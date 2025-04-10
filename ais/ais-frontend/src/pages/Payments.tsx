// ais/ais-frontend/src/pages/Payments.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
}

interface PaymentsProps {
  token: string;
}

const Payments: React.FC<PaymentsProps> = ({ token }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // секунды
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Статусы платежей
  const paymentStatuses = [
    { value: 'pending', label: 'Ожидает', color: 'yellow' },
    { value: 'completed', label: 'Выполнен', color: 'green' },
    { value: 'failed', label: 'Ошибка', color: 'red' },
    { value: 'refunded', label: 'Возвращен', color: 'purple' }
  ];

  // Методы оплаты
  const paymentMethods = [
    { value: 'card', label: 'Банковская карта' },
    { value: 'cash', label: 'Наличные' },
    { value: 'online_wallet', label: 'Электронный кошелек' }
  ];

  // Функция загрузки платежей
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Запрос через API Gateway для получения платежей
      const response = await axios.get(`${API_BASE_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPayments(response.data);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке платежей:', err);
      setError('Не удалось загрузить данные платежей');
      setLoading(false);
    }
  };

  // Загрузка платежей при монтировании и при изменении токена
  useEffect(() => {
    fetchPayments();
  }, [token]);

  // Настройка автоматического обновления
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchPayments();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  // Обновление статуса платежа
  const updatePaymentStatus = async (paymentId: number, newStatus: string) => {
    try {
      setStatusUpdating(paymentId);
      
      await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, 
        { payment_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем список платежей после изменения статуса
      fetchPayments();
      
      setStatusUpdating(null);
    } catch (err) {
      console.error('Ошибка при обновлении статуса платежа:', err);
      setError('Не удалось обновить статус платежа');
      setStatusUpdating(null);
    }
  };

  // Функция форматирования даты
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

  // Функция получения класса для статуса платежа
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Функция получения названия метода оплаты
  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: {[key: string]: string} = {
      'card': 'Банковская карта',
      'cash': 'Наличные',
      'online_wallet': 'Электронный кошелек'
    };
    return methodLabels[method] || method;
  };

  // Функция получения названия статуса платежа
  const getStatusLabel = (status: string): string => {
    const statusLabels: {[key: string]: string} = {
      'pending': 'Ожидает',
      'completed': 'Выполнен',
      'failed': 'Ошибка',
      'refunded': 'Возвращен'
    };
    return statusLabels[status] || status;
  };

  // Фильтрация платежей по статусу
  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.payment_status === filter);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Управление платежами</h1>
        
        <div className="flex items-center space-x-4">
          {/* Настройки автообновления */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Автообновление:
            </span>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              disabled={!autoRefresh}
            >
              <option value="15">15 сек</option>
              <option value="30">30 сек</option>
              <option value="60">1 мин</option>
              <option value="300">5 мин</option>
            </select>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Вкл</span>
            </label>
          </div>
          
          {/* Фильтр по статусу */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">Все платежи</option>
            {paymentStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {/* Кнопка обновления */}
          <button 
            onClick={fetchPayments}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
      </div>
      
      {/* Информация о последнем обновлении */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Последнее обновление: {formatDate(lastRefresh.toISOString())}
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading && payments.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Нет платежей для отображения</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Заказ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Метод оплаты
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID транзакции
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <Link 
                        to={`/orders/${payment.order_id}`} 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Заказ #{payment.order_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.payment_status)}`}>
                        {getStatusLabel(payment.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.transaction_id || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-2">
                        {/* Изменение статуса */}
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updatePaymentStatus(payment.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={statusUpdating === payment.id}
                          className="text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        >
                          <option value="">Изменить статус</option>
                          {paymentStatuses.map(status => (
                            status.value !== payment.payment_status && (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            )
                          ))}
                        </select>
                        
                        {/* Кнопка для ввода ID транзакции */}
                        {(payment.payment_status === 'pending' || !payment.transaction_id) && (
                          <button
                            onClick={() => {
                              const transactionId = prompt('Введите ID транзакции:');
                              if (transactionId !== null) {
                                axios.put(`${API_BASE_URL}/api/payments/${payment.id}`, 
                                  { transaction_id: transactionId },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                ).then(() => {
                                  fetchPayments();
                                }).catch(err => {
                                  console.error('Ошибка при обновлении ID транзакции:', err);
                                  setError('Не удалось обновить ID транзакции');
                                });
                              }
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                          >
                            ID транзакции
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;