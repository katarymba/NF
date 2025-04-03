// ais/ais-frontend/src/pages/OrderDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    description?: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  customer_name?: string;
  email?: string;
  phone?: string;
  total_price: number;
  status: string;
  created_at: string;
  delivery_method?: string;
  delivery_address?: string;
  payment_method?: string;
  comment?: string;
  items: OrderItem[];
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const navigate = useNavigate();

  // Статусы заказов
  const orderStatuses = [
    { value: 'new', label: 'Новый' },
    { value: 'processing', label: 'Обрабатывается' },
    { value: 'shipped', label: 'Отправлен' },
    { value: 'completed', label: 'Выполнен' },
    { value: 'cancelled', label: 'Отменен' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Получаем данные о заказе
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
      setOrder(response.data);

      // Получаем информацию о пользователе
      if (response.data.user_id) {
        try {
          const userResponse = await axios.get(`${API_BASE_URL}/users/${response.data.user_id}`);
          setUser(userResponse.data);
        } catch (userError) {
          console.error('Ошибка при получении информации о пользователе:', userError);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Ошибка при получении данных заказа:', err);
      setError('Не удалось загрузить данные заказа');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setStatusUpdating(true);
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}`, {
        status: newStatus
      });
      
      // Обновляем данные заказа после обновления статуса
      await fetchOrderDetails();
      setStatusUpdating(false);
    } catch (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      setError('Не удалось обновить статус заказа');
      setStatusUpdating(false);
    }
  };

  // Получение названия статуса для отображения
  const getStatusLabel = (statusValue: string): string => {
    const status = orderStatuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  // Получение класса для статуса
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/orders')} 
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
        >
          Вернуться к списку заказов
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Заказ не найден</p>
        <button 
          onClick={() => navigate('/orders')} 
          className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-900"
        >
          Вернуться к списку заказов
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Заказ #{order.id}
        </h1>
        <button 
          onClick={() => navigate('/orders')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          К списку заказов
        </button>
      </div>

      {/* Основная информация о заказе */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Информация о заказе</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Дата создания:</span> {formatDate(order.created_at)}</p>
              <p><span className="font-medium">Сумма заказа:</span> {order.total_price.toFixed(2)} ₽</p>
              <p className="mt-2">
                <span className="font-medium">Статус:</span> 
                <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Изменить статус</h2>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => updateOrderStatus(status.value)}
                  disabled={order.status === status.value || statusUpdating}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    order.status === status.value
                      ? `${getStatusClass(status.value)} cursor-not-allowed opacity-70`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Информация о клиенте */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Информация о клиенте</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <p><span className="font-medium">ФИО:</span> {order.customer_name || (user?.full_name || 'Не указано')}</p>
              <p><span className="font-medium">Email:</span> {order.email || (user?.email || 'Не указано')}</p>
              <p><span className="font-medium">Телефон:</span> {order.phone || 'Не указано'}</p>
            </div>
            <div>
              <p><span className="font-medium">Способ доставки:</span> {order.delivery_method || 'Не указано'}</p>
              {order.delivery_address && (
                <p><span className="font-medium">Адрес доставки:</span> {order.delivery_address}</p>
              )}
              <p><span className="font-medium">Способ оплаты:</span> {order.payment_method || 'Не указано'}</p>
            </div>
          </div>
        </div>

        {/* Комментарий к заказу */}
        {order.comment && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Комментарий к заказу</h2>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300">{order.comment}</p>
            </div>
          </div>
        )}
      </div>

      {/* Список товаров */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Товары в заказе</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Товар
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Цена
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Количество
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.product?.name || `Товар #${item.product_id}`}
                    </div>
                    {item.product?.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                        {item.product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.price.toFixed(2)} ₽</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {(item.price * item.quantity).toFixed(2)} ₽
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Итого:</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{order.total_price.toFixed(2)} ₽</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;