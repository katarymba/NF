import React from 'react';
import { Card, Row, Col, Input, Select, DatePicker, Button } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    ExportOutlined,
    FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import { OrderStatus, PaymentStatus } from './interfaces';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface OrdersFiltersProps {
    searchText: string;
    setSearchText: (value: string) => void;
    statusFilter: string | null;
    setStatusFilter: (value: string | null) => void;
    paymentStatusFilter: string | null;
    setPaymentStatusFilter: (value: string | null) => void;
    dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    setDateRange: (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
    fetchOrders: () => void;
    clearFilters: () => void;
    loading: boolean;
    exportOrdersToExcel: () => void;
    exportLoading: boolean;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
                                                         searchText,
                                                         setSearchText,
                                                         statusFilter,
                                                         setStatusFilter,
                                                         paymentStatusFilter,
                                                         setPaymentStatusFilter,
                                                         dateRange,
                                                         setDateRange,
                                                         fetchOrders,
                                                         clearFilters,
                                                         loading,
                                                         exportOrdersToExcel,
                                                         exportLoading
                                                     }) => {
    return (
        <Card className="filters-card">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={24} md={9} lg={7} xl={6}>
                    <Input
                        placeholder="Поиск заказа, клиента или адреса"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={12} sm={12} md={5} lg={4} xl={4}>
                    <Select
                        placeholder="Статус заказа"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        allowClear
                        style={{ width: '100%' }}
                    >
                        <Option value={OrderStatus.PENDING}>Ожидает обработки</Option>
                        <Option value={OrderStatus.PROCESSING}>В обработке</Option>
                        <Option value={OrderStatus.SHIPPED}>Отправлен</Option>
                        <Option value={OrderStatus.IN_TRANSIT}>В пути</Option>
                        <Option value={OrderStatus.DELIVERED}>Доставлен</Option>
                        <Option value={OrderStatus.CANCELLED}>Отменен</Option>
                    </Select>
                </Col>
                <Col xs={12} sm={12} md={5} lg={4} xl={4}>
                    <Select
                        placeholder="Статус оплаты"
                        value={paymentStatusFilter}
                        onChange={setPaymentStatusFilter}
                        allowClear
                        style={{ width: '100%' }}
                    >
                        <Option value={PaymentStatus.PENDING}>Ожидает оплаты</Option>
                        <Option value={PaymentStatus.PROCESSING}>Обрабатывается</Option>
                        <Option value={PaymentStatus.COMPLETED}>Оплачен</Option>
                        <Option value={PaymentStatus.FAILED}>Ошибка оплаты</Option>
                        <Option value={PaymentStatus.REFUNDED}>Возврат средств</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={16} md={5} lg={5} xl={6}>
                    <RangePicker
                        format="DD.MM.YYYY"
                        placeholder={['Дата с', 'Дата по']}
                        locale={locale}
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={8} md={24} lg={4} xl={4}>
                    <div className="button-group">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchOrders}
                            loading={loading}
                        >
                            Обновить
                        </Button>
                        <Button
                            type="primary"
                            icon={<ExportOutlined />}
                            onClick={exportOrdersToExcel}
                            loading={exportLoading}
                        >
                            Экспорт
                        </Button>
                        <Button
                            type="default"
                            icon={<FilterOutlined />}
                            onClick={clearFilters}
                        >
                            Сбросить
                        </Button>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default OrdersFilters;