import React from 'react';
import { Modal, Form, Select, Input, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Order } from './interfaces';

const { Option } = Select;

interface PaymentModalProps {
    paymentModalVisible: boolean;
    setPaymentModalVisible: (visible: boolean) => void;
    handleCreatePayment: (values: any) => Promise<void>;
    paymentForm: any;
    orders: Order[];
    currentOrderId?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       paymentModalVisible,
                                                       setPaymentModalVisible,
                                                       handleCreatePayment,
                                                       paymentForm,
                                                       orders,
                                                       currentOrderId
                                                   }) => {
    return (
        <Modal
            title="Создание платежа"
            open={paymentModalVisible}
            onCancel={() => setPaymentModalVisible(false)}
            footer={null}
        >
            <Form
                form={paymentForm}
                layout="vertical"
                onFinish={handleCreatePayment}
                initialValues={currentOrderId ? { order_id: currentOrderId } : {}}
            >
                <Form.Item
                    name="order_id"
                    label="ID заказа"
                    rules={[{ required: true, message: 'Выберите заказ' }]}
                >
                    <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {orders.map(order => (
                            <Option key={order.id} value={order.id}>
                                {`Заказ #${order.id} - ${order.total_price.toLocaleString('ru')} ₽ - ${order.client_name || 'Без имени'}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="payment_method"
                    label="Способ оплаты"
                    rules={[{ required: true, message: 'Выберите способ оплаты' }]}
                >
                    <Select>
                        <Option value="online_card">Картой онлайн</Option>
                        <Option value="sbp">СБП</Option>
                        <Option value="cash">Наличными</Option>
                        <Option value="cash_on_delivery">Наличными при получении</Option>
                        <Option value="online_wallet">Электронный кошелёк</Option>
                        <Option value="bank_transfer">Банковский перевод</Option>
                        <Option value="credit_card">Кредитной картой</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="payment_status"
                    label="Статус платежа"
                    initialValue="completed"
                >
                    <Select>
                        <Option value="completed">Выполнен</Option>
                        <Option value="processing">В обработке</Option>
                        <Option value="pending">Ожидает</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="transaction_id"
                    label="ID транзакции"
                >
                    <Input placeholder="Например: TXN2025050800XX" />
                </Form.Item>

                <Form.Item>
                    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setPaymentModalVisible(false)}>
                            Отмена
                        </Button>
                        <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                            Создать платеж
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentModal;