import React from 'react';
import {
    Drawer, Form, Input, Select, Space, Button, DatePicker
} from 'antd';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import { Order, AVAILABLE_COURIERS } from './interfaces';

const { Option } = Select;
const { TextArea } = Input;

interface OrderEditProps {
    orderDetails: Order | null;
    editVisible: boolean;
    setEditVisible: (visible: boolean) => void;
    handleEditSubmit: (values: any) => Promise<void>;
    editForm: any;
}

const OrderEdit: React.FC<OrderEditProps> = ({
                                                 orderDetails,
                                                 editVisible,
                                                 setEditVisible,
                                                 handleEditSubmit,
                                                 editForm
                                             }) => {
    return (
        <Drawer
            title={`Редактирование заказа #${orderDetails?.id || ''}`}
            width={600}
            open={editVisible}
            onClose={() => setEditVisible(false)}
            footer={
                <Space>
                    <Button onClick={() => setEditVisible(false)}>Отмена</Button>
                    <Button
                        type="primary"
                        onClick={() => editForm.submit()}
                    >
                        Сохранить
                    </Button>
                </Space>
            }
        >
            <Form
                form={editForm}
                layout="vertical"
                onFinish={handleEditSubmit}
            >
                <Form.Item
                    name="status"
                    label="Статус заказа"
                    rules={[{ required: true, message: 'Выберите статус заказа' }]}
                >
                    <Select>
                        <Option value="pending">Ожидает обработки</Option>
                        <Option value="processing">В обработке</Option>
                        <Option value="shipped">Отправлен</Option>
                        <Option value="in_transit">В пути</Option>
                        <Option value="delivered">Доставлен</Option>
                        <Option value="cancelled">Отменен</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="client_name"
                    label="Имя клиента"
                    rules={[{ required: true, message: 'Введите имя клиента' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="contact_phone"
                    label="Телефон клиента"
                >
                    <Input placeholder="+7 (___) ___-__-__" />
                </Form.Item>

                <Form.Item
                    name="delivery_address"
                    label="Адрес доставки"
                    rules={[{ required: true, message: 'Введите адрес доставки' }]}
                >
                    <TextArea rows={2} />
                </Form.Item>

                <Form.Item
                    name="courier_name"
                    label="Курьер"
                >
                    <Select allowClear>
                        {AVAILABLE_COURIERS.map((courier, index) => (
                            <Option key={index} value={courier}>{courier}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="tracking_number"
                    label="Номер отслеживания"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="estimated_delivery"
                    label="Планируемая дата доставки"
                >
                    <DatePicker
                        format="DD.MM.YYYY"
                        locale={locale}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="actual_delivery"
                    label="Фактическая дата доставки"
                >
                    <DatePicker
                        format="DD.MM.YYYY HH:mm"
                        showTime
                        locale={locale}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="delivery_status"
                    label="Статус доставки"
                >
                    <Select allowClear>
                        <Option value="pending">Ожидает отправки</Option>
                        <Option value="processing">Подготовка к отправке</Option>
                        <Option value="shipped">Отправлен</Option>
                        <Option value="in_transit">В пути</Option>
                        <Option value="delivered">Доставлен</Option>
                        <Option value="cancelled">Отменен</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="delivery_notes"
                    label="Примечания к доставке"
                >
                    <TextArea rows={3} />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default OrderEdit;