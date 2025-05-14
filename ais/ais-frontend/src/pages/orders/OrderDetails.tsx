import React from 'react';
import {
    Drawer, Space, Button, Row, Col, Table, Tag,
    Typography, notification
} from 'antd';
import { PrinterOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Order, Payment, AVAILABLE_COURIERS } from './interfaces';
import {
    formatPrice, formatDate, getStatusText, getPaymentStatusText, getPaymentMethodText
} from './utils';
import axios from 'axios';

const { Text } = Typography;

interface OrderDetailsProps {
    orderDetails: Order | null;
    payments: Payment[];
    detailsVisible: boolean;
    setDetailsVisible: (visible: boolean) => void;
    showEditForm: (order: Order) => void;
    printOrder: (id: number) => void;
    printLoading: boolean;
    setPaymentModalVisible: (visible: boolean) => void;
    setPaymentFormOrder: (id: number) => void;
    token?: string;
    refreshOrders: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
                                                       orderDetails,
                                                       payments,
                                                       detailsVisible,
                                                       setDetailsVisible,
                                                       showEditForm,
                                                       printOrder,
                                                       printLoading,
                                                       setPaymentModalVisible,
                                                       setPaymentFormOrder,
                                                       token,
                                                       refreshOrders
                                                   }) => {
    const API_BASE_URL = 'http://localhost:8001';

    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // Автоматическое назначение курьера
    const assignRandomCourier = async (orderId: number) => {
        try {
            // Выбираем случайного курьера из списка
            const randomIndex = Math.floor(Math.random() * AVAILABLE_COURIERS.length);
            const assignedCourier = AVAILABLE_COURIERS[randomIndex];

            // Текущая дата + 3 дня для предполагаемой даты доставки
            const estimatedDeliveryDate = dayjs().add(3, 'day').format('YYYY-MM-DD');

            // Обновляем заказ через API
            await axiosInstance.patch(`/orders/${orderId}`, {
                courier_name: assignedCourier,
                estimated_delivery: estimatedDeliveryDate
            });

            notification.success({
                message: 'Курьер назначен',
                description: `Курьер ${assignedCourier} назначен для заказа №${orderId}`
            });

            // Обновляем данные заказов
            refreshOrders();
        } catch (error) {
            console.error('Ошибка при назначении курьера:', error);
            notification.error({
                message: 'Ошибка при назначении курьера',
                description: 'Не удалось назначить курьера для заказа'
            });
        }
    };

    if (!orderDetails) return null;

    return (
        <Drawer
            title={`Заказ #${orderDetails?.id || ''}`}
            width={600}
            open={detailsVisible}
            onClose={() => setDetailsVisible(false)}
            footer={
                <Space>
                    <Button onClick={() => setDetailsVisible(false)}>Закрыть</Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            setDetailsVisible(false);
                            if (orderDetails) showEditForm(orderDetails);
                        }}
                    >
                        Редактировать
                    </Button>
                    <Button
                        onClick={() => orderDetails && printOrder(orderDetails.id)}
                        icon={<PrinterOutlined />}
                        disabled={printLoading}
                        loading={printLoading}
                    >
                        Печать
                    </Button>
                </Space>
            }
        >
            <div className="order-details">
                <div className="detail-section">
                    <div className="section-header">
                        <h3>Основная информация</h3>
                    </div>
                    <Row gutter={[16, 8]}>
                        <Col span={12}><Text strong>Дата создания:</Text></Col>
                        <Col span={12}>{formatDate(orderDetails.created_at)}</Col>

                        <Col span={12}><Text strong>Статус заказа:</Text></Col>
                        <Col span={12}>
                            <Tag color={
                                orderDetails.status === 'pending' ? 'orange' :
                                    orderDetails.status === 'processing' ? 'purple' :
                                        orderDetails.status === 'shipped' || orderDetails.status === 'in_transit' ? 'blue' :
                                            orderDetails.status === 'delivered' ? 'green' :
                                                orderDetails.status === 'cancelled' ? 'red' : 'default'
                            }>
                                {getStatusText(orderDetails.status)}
                            </Tag>
                        </Col>

                        <Col span={12}><Text strong>Общая сумма:</Text></Col>
                        <Col span={12}><Text>{formatPrice(orderDetails.total_price)}</Text></Col>

                        <Col span={12}><Text strong>Метод оплаты:</Text></Col>
                        <Col span={12}>{getPaymentMethodText(orderDetails.payment_method) || 'Не указан'}</Col>

                        <Col span={12}><Text strong>Статус оплаты:</Text></Col>
                        <Col span={12}>
                            <Tag color={
                                orderDetails.payment_status === 'completed' ? 'green' :
                                    orderDetails.payment_status === 'processing' ? 'blue' :
                                        orderDetails.payment_status === 'pending' ? 'orange' :
                                            orderDetails.payment_status === 'failed' ? 'red' : 'default'
                            }>
                                {getPaymentStatusText(orderDetails.payment_status || 'pending')}
                            </Tag>
                        </Col>

                        {orderDetails.transaction_id && (
                            <>
                                <Col span={12}><Text strong>ID транзакции:</Text></Col>
                                <Col span={12}>{orderDetails.transaction_id}</Col>
                            </>
                        )}
                    </Row>
                </div>

                <div className="detail-section">
                    <div className="section-header">
                        <h3>Информация о клиенте</h3>
                    </div>
                    <Row gutter={[16, 8]}>
                        <Col span={12}><Text strong>ID пользователя:</Text></Col>
                        <Col span={12}>{orderDetails.user_id}</Col>

                        <Col span={12}><Text strong>Имя клиента:</Text></Col>
                        <Col span={12}>{orderDetails.client_name || 'Не указан'}</Col>

                        <Col span={12}><Text strong>Телефон:</Text></Col>
                        <Col span={12}>{orderDetails.contact_phone || orderDetails.phone || 'Не указан'}</Col>

                        {orderDetails.email && (
                            <>
                                <Col span={12}><Text strong>Email:</Text></Col>
                                <Col span={12}>{orderDetails.email}</Col>
                            </>
                        )}
                    </Row>
                </div>

                <div className="detail-section">
                    <div className="section-header">
                        <h3>Адрес доставки</h3>
                    </div>
                    <p>{orderDetails.delivery_address || 'Не указан'}</p>
                </div>

                <div className="detail-section">
                    <div className="section-header">
                        <h3>Товары в заказе</h3>
                    </div>
                    <Table
                        dataSource={orderDetails.order_items}
                        rowKey={(record, index) => `${record.product_id}_${index}`}
                        pagination={false}
                        size="small"
                        columns={[
                            {
                                title: 'Товар',
                                dataIndex: 'product_name',
                                render: (text: string, record: any) => {
                                    const { product_id } = record;
                                    const productName = text ||
                                        (productNames[product_id] ? productNames[product_id] : `Товар ${product_id}`);
                                    return productName;
                                }
                            },
                            {
                                title: 'Цена',
                                dataIndex: 'price',
                                render: (price: number) => formatPrice(price),
                                align: 'right' as 'right'
                            },
                            {
                                title: 'Кол-во',
                                dataIndex: 'quantity',
                                align: 'center' as 'center'
                            },
                            {
                                title: 'Сумма',
                                render: (_: any, record: any) => formatPrice(record.price * record.quantity),
                                align: 'right' as 'right'
                            }
                        ]}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}><strong>Итого:</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <strong>{formatPrice(orderDetails.total_price)}</strong>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                </div>

                <div className="detail-section">
                    <div className="section-header">
                        <h3>Платежи</h3>
                        <Button
                            type="link"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setPaymentFormOrder(orderDetails.id);
                                setPaymentModalVisible(true);
                            }}
                        >
                            Добавить платеж
                        </Button>
                    </div>
                    <Table
                        dataSource={payments.filter(p => p.order_id === orderDetails.id)}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                            {
                                title: 'ID',
                                dataIndex: 'id',
                                width: 60
                            },
                            {
                                title: 'Метод',
                                dataIndex: 'payment_method',
                                render: (method: string) => getPaymentMethodText(method)
                            },
                            {
                                title: 'Статус',
                                dataIndex: 'payment_status',
                                render: (status: string) => (
                                    <Tag color={
                                        status === 'completed' ? 'green' :
                                            status === 'processing' ? 'blue' :
                                                status === 'pending' ? 'orange' :
                                                    status === 'failed' ? 'red' : 'default'
                                    }>
                                        {getPaymentStatusText(status)}
                                    </Tag>
                                )
                            },
                            {
                                title: 'Дата',
                                dataIndex: 'created_at',
                                render: (date: string) => formatDate(date)
                            }
                        ]}
                        locale={{
                            emptyText: 'Нет платежей для этого заказа'
                        }}
                    />
                </div>

                <div className="detail-section">
                    <div className="section-header">
                        <h3>Информация о доставке</h3>
                    </div>
                    <Row gutter={[16, 8]}>
                        <Col span={12}><Text strong>Курьер:</Text></Col>
                        <Col span={12}>
                            {orderDetails.courier_name || 'Не назначен'}
                            {!orderDetails.courier_name && orderDetails.payment_status === 'completed' && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => assignRandomCourier(orderDetails.id)}
                                >
                                    Назначить
                                </Button>
                            )}
                        </Col>

                        <Col span={12}><Text strong>Номер отслеживания:</Text></Col>
                        <Col span={12}>{orderDetails.tracking_number || 'Не указан'}</Col>

                        <Col span={12}><Text strong>Статус доставки:</Text></Col>
                        <Col span={12}>
                            {orderDetails.delivery_status ? (
                                <Tag color={
                                    orderDetails.delivery_status === 'in_transit' ? 'blue' :
                                        orderDetails.delivery_status === 'delivered' ? 'green' :
                                            'default'
                                }>
                                    {getStatusText(orderDetails.delivery_status)}
                                </Tag>
                            ) : (
                                'Не указан'
                            )}
                        </Col>

                        <Col span={12}><Text strong>Планируемая доставка:</Text></Col>
                        <Col span={12}>{orderDetails.estimated_delivery ? formatDate(orderDetails.estimated_delivery) : 'Не указана'}</Col>

                        <Col span={12}><Text strong>Фактическая доставка:</Text></Col>
                        <Col span={12}>{orderDetails.actual_delivery ? formatDate(orderDetails.actual_delivery) : 'Не выполнена'}</Col>

                        <Col span={24}><Text strong>Примечания к доставке:</Text></Col>
                        <Col span={24}>
                            <div className="notes-box">
                                {orderDetails.delivery_notes || 'Нет примечаний'}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Drawer>
    );
};

// Для доступа к productNames в компоненте
const productNames: {[key: number]: string} = {
    1: 'Семга свежая',
    3: 'Сельдь малосольная',
    5: 'Осетр копченый',
    6: 'Форель радужная',
    11: 'Треска атлантическая',
};

export default OrderDetails;