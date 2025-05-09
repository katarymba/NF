import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

interface DashboardProps {
    token: string;
}

interface SalesSummary {
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderSummary, setOrderSummary] = useState({
        total: 0,
        new: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
    });
    const [salesSummary, setSalesSummary] = useState<SalesSummary>({
        totalRevenue: 0,
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Генерируем тестовые данные для демонстрации
                // В реальном приложении здесь будут API-запросы
                
                // Заглушка для количества заказов
                setOrderSummary({
                    total: 125,
                    new: 15,
                    processing: 32,
                    completed: 68,
                    cancelled: 10
                });
                
                // Заглушка для финансовой информации
                setSalesSummary({
                    totalRevenue: 1750000,
                    todayRevenue: 45000,
                    weekRevenue: 320000,
                    monthRevenue: 1250000
                });
                
                // Заглушка для последних заказов
                setRecentOrders([
                    {
                        id: 10045,
                        customer_name: "Иванов Иван",
                        created_at: "2025-04-08T10:30:00",
                        total_price: 12500,
                        status: "new"
                    },
                    {
                        id: 10044,
                        customer_name: "Петров Петр",
                        created_at: "2025-04-07T15:45:00",
                        total_price: 8750,
                        status: "processing"
                    },
                    {
                        id: 10043,
                        customer_name: "Сидорова Анна",
                        created_at: "2025-04-06T09:15:00",
                        total_price: 21300,
                        status: "completed"
                    }
                ]);
                
                setError(null);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки данных Dashboard:', err);
                setError('Не удалось загрузить данные дашборда');
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        } else {
            setLoading(false);
            setError('Требуется авторизация');
        }
    }, [token]);

    // Форматирование цены
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Форматирование даты
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Получение класса для статуса заказа
    const getStatusClass = (status: string): string => {
        switch (status) {
            case 'new':
                return 'status-new';
            case 'processing':
                return 'status-processing';
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    // Получение названия статуса для отображения
    const getStatusLabel = (status: string): string => {
        const statusLabels: {[key: string]: string} = {
            'new': 'Новый',
            'processing': 'Обрабатывается',
            'shipped': 'Отправлен',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusLabels[status] || status;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p className="error-message-content">{error}</p>
                <p className="error-message-content">Это тестовая версия приложения с демонстрационными данными.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Панель управления</h1>
            
            {/* Карточки со статистикой */}
            <div className="summary-cards">
                {/* Карточка заказов */}
                <div className="summary-card">
                    <div className="summary-card-header">
                        <div>
                            <p className="summary-card-title">Всего заказов</p>
                            <p className="summary-card-value">{orderSummary.total}</p>
                        </div>
                        <div className="summary-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="summary-card-footer">
                        <div>
                            <span className="summary-card-label">Новых:</span>
                            <span className="summary-card-data summary-card-data-accent"> {orderSummary.new}</span>
                        </div>
                        <div>
                            <span className="summary-card-label">Обработка:</span>
                            <span className="summary-card-data summary-card-data-warning"> {orderSummary.processing}</span>
                        </div>
                        <div>
                            <span className="summary-card-label">Выполнено:</span>
                            <span className="summary-card-data summary-card-data-success"> {orderSummary.completed}</span>
                        </div>
                    </div>
                </div>
                
                {/* Карточка общего дохода */}
                <div className="summary-card">
                    <div className="summary-card-header">
                        <div>
                            <p className="summary-card-title">Общий доход</p>
                            <p className="summary-card-value">{formatPrice(salesSummary.totalRevenue)}</p>
                        </div>
                        <div className="summary-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8V7M12 8V16M12 16V17M12 16C10.3431 16 9 14.6569 9 13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="summary-card-footer">
                        <div>
                            <span className="summary-card-label">Сегодня:</span>
                            <span className="summary-card-data"> {formatPrice(salesSummary.todayRevenue)}</span>
                        </div>
                        <div>
                            <span className="summary-card-label">За месяц:</span>
                            <span className="summary-card-data"> {formatPrice(salesSummary.monthRevenue)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Карточка товаров */}
                <div className="summary-card">
                    <div className="summary-card-header">
                        <div>
                            <p className="summary-card-title">Товары на складе</p>
                            <p className="summary-card-value">278</p>
                        </div>
                        <div className="summary-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 8H19M5 8C3.89543 8 3 7.10457 3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6C21 7.10457 20.1046 8 19 8M5 8V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V8M12 12H16" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="summary-card-footer">
                        <div>
                            <span className="summary-card-label">Категорий:</span>
                            <span className="summary-card-data"> 12</span>
                        </div>
                        <div>
                            <span className="summary-card-label">Низкий запас:</span>
                            <span className="summary-card-data summary-card-data-danger"> 15</span>
                        </div>
                    </div>
                </div>
                
                {/* Карточка клиентов */}
                <div className="summary-card">
                    <div className="summary-card-header">
                        <div>
                            <p className="summary-card-title">Клиенты</p>
                            <p className="summary-card-value">450</p>
                        </div>
                        <div className="summary-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.35418C12.7329 3.52375 13.8053 3 15 3C17.2091 3 19 4.79086 19 7C19 9.20914 17.2091 11 15 11C13.8053 11 12.7329 10.4762 12 9.64582M15 21H3V20C3 16.6863 5.68629 14 9 14C12.3137 14 15 16.6863 15 20V21ZM15 21H21V20C21 16.6863 18.3137 14 15 14C13.9071 14 12.8825 14.2922 12 14.8027M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="summary-card-footer">
                        <div>
                            <span className="summary-card-label">Новых:</span>
                            <span className="summary-card-data"> 12 за неделю</span>
                        </div>
                        <div>
                            <span className="summary-card-label">Активных:</span>
                            <span className="summary-card-data"> 85%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Последние заказы */}
            <div className="orders-section">
                <div className="orders-header">
                    <h2 className="orders-title">Последние заказы</h2>
                    <Link to="/orders" className="orders-link">
                        Все заказы
                    </Link>
                </div>
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>ID заказа</th>
                                <th>Клиент</th>
                                <th>Дата</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>{formatPrice(order.total_price)}</td>
                                    <td>
                                        <span className={`order-status ${getStatusClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;