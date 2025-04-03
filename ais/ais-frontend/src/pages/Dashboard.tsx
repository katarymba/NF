// ais/ais-frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

interface OrderSummary {
  total: number;
  new: number;
  processing: number;
  completed: number;
  cancelled: number;
}

interface SalesSummary {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

interface ProductSummary {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
}

interface UserSummary {
  totalUsers: number;
  newUsersToday: number;
}

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
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
  const [productSummary, setProductSummary] = useState<ProductSummary>({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0
  });
  const [userSummary, setUserSummary] = useState<UserSummary>({
    totalUsers: 0,
    newUsersToday: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Загрузка данных о заказах
      const orderResponse = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (orderResponse.data) {
        const orders = orderResponse.data;
        // Расчет статистики по заказам
        const ordersStats = {
          total: orders.length,
          new: orders.filter((o: any) => o.status === 'new').length,
          processing: orders.filter((o: any) => o.status === 'processing').length,
          completed: orders.filter((o: any) => o.status === 'completed').length,
          cancelled: orders.filter((o: any) => o.status === 'cancelled').length
        };
        setOrderSummary(ordersStats);
        
        // Расчет статистики по продажам
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000).getTime();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total_price, 0);
        const todayRevenue = orders
          .filter((o: any) => new Date(o.created_at).getTime() >= today)
          .reduce((sum: number, order: any) => sum + order.total_price, 0);
        const weekRevenue = orders
          .filter((o: any) => new Date(o.created_at).getTime() >= weekAgo)
          .reduce((sum: number, order: any) => sum + order.total_price, 0);
        const monthRevenue = orders
          .filter((o: any) => new Date(o.created_at).getTime() >= monthAgo)
          .reduce((sum: number, order: any) => sum + order.total_price, 0);
        
        setSalesSummary({
          totalRevenue,
          todayRevenue,
          weekRevenue,
          monthRevenue
        });
        
        // Получаем последние 5 заказов
        setRecentOrders(
          orders
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      }
      
      // Загрузка данных о продуктах
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
      
      if (productsResponse.data) {
        const products = productsResponse.data;
        // Статистика по продуктам
        setProductSummary({
          totalProducts: products.length,
          outOfStock: products.filter((p: any) => p.stock_quantity === 0).length,
          lowStock: products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity < 10).length
        });
        
        // Топ продаваемых продуктов (заглушка, обычно берется из статистики продаж)
        setTopProducts(products.slice(0, 5));
      }
      
      // Загрузка данных о пользователях (если API доступен)
      try {
        const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (usersResponse.data) {
          const users = usersResponse.data;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          setUserSummary({
            totalUsers: users.length,
            newUsersToday: users.filter((u: any) => {
              const created = new Date(u.created_at);
              return created >= today;
            }).length
          });
        }
      } catch (userError) {
        console.log('Не удалось загрузить данные о пользователях:', userError);
        // Не выдаем ошибку, просто оставляем заглушечные данные
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки данных Dashboard:', err);
      setError('Не удалось загрузить данные');
      setLoading(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ' ₽';
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
        >
          Повторить
        </button>
      </div>
    );
  }

  // Остальной JSX код Dashboard.tsx остается прежним
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Панель управления</h1>
      {/* Содержимое панели управления */}
      
      {/* Верхние карточки со статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Статистика по заказам */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Всего заказов</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.total}</h2>
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
        
        {/* И другие карточки статистики */}
      </div>
      
      {/* Недавние заказы и популярные товары */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Секции с заказами и товарами */}
      </div>
    </div>
  );
};

export default Dashboard;