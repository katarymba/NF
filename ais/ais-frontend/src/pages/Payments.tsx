// ais/ais-frontend/src/pages/Payments.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getPayments as apiGetPayments } from '../services/api';

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
      
      // Изменение: Используем apiGetPayments вместо прямого axios запроса
      const data = await apiGetPayments();
      
      setPayments(data);
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
      
      // Здесь используем fetch вместо axios для единообразия
      await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ payment_status: newStatus })
      });
      
      // Обновляем список платежей после изменения статуса
      fetchPayments();
      
      setStatusUpdating(null);
    } catch (err) {
      console.error('Ошибка при обновлении статуса платежа:', err);
      setError('Не удалось обновить статус платежа');
      setStatusUpdating(null);
    }
  };

  // Остальной код без изменений...
  
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

  // Остальной код компонента без изменений...
  
  return (
    // Разметка компонента как в оригинале...
    <div className="container mx-auto p-4">
      {/* Остальная разметка без изменений */}
    </div>
  );
};

export default Payments;