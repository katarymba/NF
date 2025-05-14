import React from 'react';
import { Card } from 'antd';

interface StatisticProps {
    title: string;
    value: number;
    prefix?: React.ReactNode;
}

interface OrdersStatisticsProps {
    ordersCount: number;
    pendingCount: number;
    processingCount: number;
    shippedCount: number;
    deliveredCount: number;
    pendingPaymentCount: number;
}

// Компонент одной карточки статистики
const Statistic: React.FC<StatisticProps> = ({ title, value, prefix }) => {
    return (
        <div className="statistic-container">
            <div className="statistic-title">{title}</div>
            <div className="statistic-value">
                {prefix && <span className="statistic-prefix">{prefix}</span>}
                {value}
            </div>
        </div>
    );
};

// Компоненты для иконок статистики
const ShoppingCartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const SyncIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
    </svg>
);

const DeliveryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const PaymentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
);

const OrdersStatistics: React.FC<OrdersStatisticsProps> = ({
                                                               ordersCount,
                                                               pendingCount,
                                                               processingCount,
                                                               shippedCount,
                                                               deliveredCount,
                                                               pendingPaymentCount
                                                           }) => {
    return (
        <div className="stats-row">
            <Card size="small" className="stat-card stat-card-all">
                <Statistic
                    title="Всего заказов"
                    value={ordersCount}
                    prefix={<ShoppingCartIcon />}
                />
            </Card>
            <Card size="small" className="stat-card stat-card-pending">
                <Statistic
                    title="Ожидают обработки"
                    value={pendingCount}
                    prefix={<ClockIcon />}
                />
            </Card>
            <Card size="small" className="stat-card stat-card-processing">
                <Statistic
                    title="В обработке"
                    value={processingCount}
                    prefix={<SyncIcon />}
                />
            </Card>
            <Card size="small" className="stat-card stat-card-shipped">
                <Statistic
                    title="Отправлены"
                    value={shippedCount}
                    prefix={<DeliveryIcon />}
                />
            </Card>
            <Card size="small" className="stat-card stat-card-delivered">
                <Statistic
                    title="Доставлены"
                    value={deliveredCount}
                    prefix={<CheckIcon />}
                />
            </Card>
            <Card size="small" className="stat-card stat-card-payment">
                <Statistic
                    title="Ожидают оплаты"
                    value={pendingPaymentCount}
                    prefix={<PaymentIcon />}
                />
            </Card>
        </div>
    );
};

export default OrdersStatistics;