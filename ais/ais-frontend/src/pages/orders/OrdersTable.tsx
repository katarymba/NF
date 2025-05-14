import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Card, Tooltip, Spin, Popconfirm } from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    PrinterOutlined,
    SendOutlined,
    DollarOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Order } from './interfaces';
import { formatPrice, formatDate, getStatusText, getPaymentMethodText, getPaymentStatusText } from './utils';
import { Typography } from 'antd';

const { Text } = Typography;

interface OrdersTableProps {
    orders: Order[];
    loading: boolean;
    searchText: string;
    statusFilter: string | null;
    paymentStatusFilter: string | null;
    dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    setOrderDetails: (order: Order) => void;
    showDetailsDrawer: () => void;
    showEditForm: (order: Order) => void;
    printOrder: (id: number) => void;
    confirmOrderPayment: (id: number) => void;
    syncOrderWithSeverRyba: (id: number) => void;
    confirmingPayment: number | null;
    syncingOrder: number | null;
    printLoading: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
                                                     orders,
                                                     loading,
                                                     searchText,
                                                     statusFilter,
                                                     paymentStatusFilter,
                                                     dateRange,
                                                     setOrderDetails,
                                                     showDetailsDrawer,
                                                     showEditForm,
                                                     printOrder,
                                                     confirmOrderPayment,
                                                     syncOrderWithSeverRyba,
                                                     confirmingPayment,
                                                     syncingOrder,
                                                     printLoading
                                                 }) => {
    const navigate = useNavigate();

    // Фильтрация заказов
    const filterOrders = useMemo(() => {
        return orders.filter(order => {
            let match = true;

            // Фильтр по поиску
            if (searchText) {
                const lowerSearchText = searchText.toLowerCase();
                const searchMatch =
                    order.id.toString().includes(lowerSearchText) ||
                    (order.client_name && order.client_name.toLowerCase().includes(lowerSearchText)) ||
                    (order.tracking_number && order.tracking_number.toLowerCase().includes(lowerSearchText)) ||
                    (order.delivery_address && order.delivery_address.toLowerCase().includes(lowerSearchText));

                if (!searchMatch) match = false;
            }

            // Фильтр по статусу заказа
            if (statusFilter && order.status !== statusFilter) {
                match = false;
            }

            // Фильтр по статусу оплаты
            if (paymentStatusFilter && order.payment_status !== paymentStatusFilter) {
                match = false;
            }

            // Фильтр по датам
            if (dateRange && dateRange[0] && dateRange[1]) {
                const orderDate = dayjs(order.created_at);
                const startDate = dateRange[0].startOf('day');
                const endDate = dateRange[1].endOf('day');

                if (!orderDate.isBetween(startDate, endDate, null, '[]')) {
                    match = false;
                }
            }

            return match;
        });
    }, [orders, searchText, statusFilter, paymentStatusFilter, dateRange]);

    // Переход на страницу доставки
    const goToDelivery = (orderId: number) => {
        navigate(`/delivery/${orderId}`);
    };

    // Колонки для таблицы
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a: Order, b: Order) => a.id - b.id,
            render: (id: number) => <span className="order-id">#{id}</span>
        },
        {
            title: 'Дата',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 130,
            sorter: (a: Order, b: Order) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (date: string) => formatDate(date)
        },
        {
            title: 'Клиент',
            dataIndex: 'client_name',
            key: 'client_name',
            width: 150,
            ellipsis: true,
            render: (text: string, record: Order) => (
                <div>
                    <div>{text || 'Не указан'}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.user_id}</Text>
                </div>
            )
        },
        {
            title: 'Сумма',
            dataIndex: 'total_price',
            key: 'total_price',
            width: 110,
            sorter: (a: Order, b: Order) => a.total_price - b.total_price,
            render: (price: number) => formatPrice(price)
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            filters: [
                { text: 'Ожидает обработки', value: 'pending' },
                { text: 'В обработке', value: 'processing' },
                { text: 'Отправлен', value: 'shipped' },
                { text: 'В пути', value: 'in_transit' },
                { text: 'Доставлен', value: 'delivered' },
                { text: 'Отменен', value: 'cancelled' }
            ],
            onFilter: (value: string, record: Order) => record.status === value,
            render: (status: string) => (
                <Tag color={
                    status === 'pending' ? 'orange' :
                        status === 'processing' ? 'purple' :
                            status === 'shipped' || status === 'in_transit' ? 'blue' :
                                status === 'delivered' ? 'green' :
                                    status === 'cancelled' ? 'red' : 'default'
                }>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Оплата',
            key: 'payment',
            width: 150,
            filters: [
                { text: 'Оплачен', value: 'completed' },
                { text: 'Обрабатывается', value: 'processing' },
                { text: 'Ожидает оплаты', value: 'pending' },
                { text: 'Ошибка оплаты', value: 'failed' },
                { text: 'Возврат', value: 'refunded' }
            ],
            onFilter: (value: string, record: Order) => record.payment_status === value,
            render: (text: string, record: Order) => (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{getPaymentMethodText(record.payment_method)}</Text>
                    <Tag color={
                        record.payment_status === 'completed' ? 'green' :
                            record.payment_status === 'processing' ? 'blue' :
                                record.payment_status === 'pending' ? 'orange' :
                                    record.payment_status === 'failed' ? 'red' : 'default'
                    }>
                        {getPaymentStatusText(record.payment_status || 'pending')}
                    </Tag>
                    {record.transaction_id && (
                        <div className="transaction-id" style={{ fontSize: '11px' }}>{record.transaction_id}</div>
                    )}
                </Space>
            )
        },
        {
            title: 'Доставка',
            key: 'delivery',
            width: 130,
            render: (text: string, record: Order) => (
                <Space direction="vertical" size="small">
                    {record.courier_name && (
                        <div>{record.courier_name}</div>
                    )}
                    {!record.courier_name && record.payment_status === 'completed' && (
                        <Text type="warning" style={{ fontSize: '12px' }}>Курьер не назначен</Text>
                    )}
                    {record.tracking_number && (
                        <div className="tracking-number" style={{ fontSize: '11px' }}>{record.tracking_number}</div>
                    )}
                    {record.estimated_delivery && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Доставка: {dayjs(record.estimated_delivery).format('DD.MM.YYYY')}
                        </Text>
                    )}
                    {record.delivery_status && record.delivery_status !== record.status && (
                        <Tag color={
                            record.delivery_status === 'in_transit' ? 'blue' :
                                record.delivery_status === 'delivered' ? 'green' :
                                    'default'
                        }>
                            {getStatusText(record.delivery_status)}
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 180,
            fixed: 'right' as 'right',
            render: (text: string, record: Order) => (
                <Space size={4} className="action-buttons">
                    <Tooltip title="Просмотр деталей">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className="action-button"
                            onClick={() => {
                                setOrderDetails(record);
                                showDetailsDrawer();
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Редактировать">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            className="action-button"
                            onClick={() => showEditForm(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Печать заказа">
                        <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            className="action-button"
                            onClick={() => printOrder(record.id)}
                            loading={printLoading}
                        />
                    </Tooltip>
                    <Tooltip title="Управление доставкой">
                        <Button
                            type="text"
                            icon={<SendOutlined />}
                            className="action-button"
                            onClick={() => goToDelivery(record.id)}
                        />
                    </Tooltip>
                    {record.payment_status !== 'completed' && (
                        <Tooltip title="Подтвердить оплату">
                            <Popconfirm
                                title="Подтверждение оплаты"
                                description="Вы уверены, что хотите подтвердить оплату этого заказа?"
                                onConfirm={() => confirmOrderPayment(record.id)}
                                okText="Да"
                                cancelText="Нет"
                            >
                                <Button
                                    type="text"
                                    icon={<DollarOutlined />}
                                    className="action-button"
                                    loading={confirmingPayment === record.id}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <Tooltip title="Синхронизировать с Север-Рыба">
                        <Button
                            type="text"
                            icon={<SyncOutlined spin={syncingOrder === record.id} />}
                            className="action-button"
                            onClick={() => syncOrderWithSeverRyba(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Card className="orders-table-card">
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filterOrders}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total) => `Всего ${total} заказов`
                    }}
                    scroll={{ x: 'max-content' }}
                    size="middle"
                    locale={{
                        emptyText: 'Нет данных заказов в базе'
                    }}
                />
            )}
        </Card>
    );
};

export default OrdersTable;