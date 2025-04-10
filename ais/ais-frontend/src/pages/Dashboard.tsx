// ais/ais-frontend/src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded">
                <p>{error}</p>
                <p className="mt-2 text-sm">Это тестовая версия приложения с демонстрационными данными.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Панель управления</h1>
            
            {/* Верхние карточки со статистикой */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Карточка заказов */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Всего заказов</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.total}</h2>
                        </div>
                        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900">
                            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Новых:</span>
                            <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">{orderSummary.new}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Обработка:</span>
                            <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">{orderSummary.processing}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Выполнено:</span>
                            <span className="ml-2 font-medium text-green-600 dark:text-green-400">{orderSummary.completed}</span>
                        </div>
                    </div>
                </div>
                
                {/* Карточка общего дохода */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Общий доход</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(salesSummary.totalRevenue)}</h2>
                        </div>
                        <div className="p-3 rounded-full bg-green-50 dark:bg-green-900">
                            <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Сегодня:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{formatPrice(salesSummary.todayRevenue)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">За месяц:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{formatPrice(salesSummary.monthRevenue)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Заглушки для других карточек */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Товары на складе</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">278</h2>
                        </div>
                        <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900">
                            <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Категорий:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">12</span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Низкий запас:</span>
                            <span className="ml-2 font-medium text-red-600 dark:text-red-400">15</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Клиенты</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">450</h2>
                        </div>
                        <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900">
                            <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Новых:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">12 за неделю</span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Активных:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">85%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Последние заказы */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Последние заказы</h2>
                    <Link to="/orders" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        Все заказы
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    ID заказа
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Клиент
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {order.customer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatPrice(order.total_price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Блок с информацией для разработчиков */}
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 p-4 rounded">
                <h3 className="font-medium mb-2">Для разработчиков</h3>
                <p className="text-sm">
                    Это тестовая версия приложения с демонстрационными данными. API-сервер может быть недоступен,
                    поэтому используются заглушки. В реальном приложении здесь будут отображаться актуальные данные.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;