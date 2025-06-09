import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Card, Select, Input, DatePicker, Typography, 
  Space, Drawer, Form, notification, Row, Col, Popconfirm, Spin, Modal, Tooltip
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, EyeOutlined, EditOutlined,
  PrinterOutlined, SendOutlined, DollarOutlined, CheckCircleOutlined, 
  SyncOutlined, ExportOutlined, FilterOutlined, PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/ru';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import '../styles/Orders.css';
import { apiClient } from '../services/api';

// Устанавливаем русскую локаль для dayjs и плагины
dayjs.locale('ru');
dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Константы для работы с датами
const CURRENT_DATE = '2025-05-28 17:31:22';
const CURRENT_USER = 'katarymba';

// Доступные курьеры
const AVAILABLE_COURIERS = [
  'Сидоров А.А.',
  'Кузнецов В.А.',
  'Дербенев И.С.',
  'Смирнова Е.П.',
  'Иванов К.Н.'
];

// Типы данных
interface OrderItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  created_at: string;
  total_amount: number;  // В соответствии с таблицей БД
  delivery_address: string;
  phone: string;         // В соответствии с таблицей БД
  email: string;         // В соответствии с таблицей БД
  name: string;          // В соответствии с таблицей БД
  comment: string;       // В соответствии с таблицей БД
  payment_method: string;
  order_items?: OrderItem[];
  courier_name?: string;
  tracking_number?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  payment_status?: string;
  transaction_id?: string;
  payment?: {
    id: number;
    payment_status: string;
    payment_method: string;
    transaction_id: string;
    created_at: string;
  };
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
}

type Key = string | number;

// Словарь для имен товаров
const productNames: {[key: number]: string} = {
  1: 'Семга свежая',
  3: 'Сельдь малосольная',
  5: 'Осетр копченый',
  6: 'Форель радужная',
  11: 'Треска атлантическая',
};

const Orders: React.FC = () => {
  // Состояние
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editForm] = Form.useForm();
  const [statistics, setStatistics] = useState<{[key: string]: number}>({});
  const [paymentStatistics, setPaymentStatistics] = useState<{[key: string]: number}>({});
  const [confirmingPayment, setConfirmingPayment] = useState<number | null>(null);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentForm] = Form.useForm();
  const [syncingOrder, setSyncingOrder] = useState<number | null>(null);
  
  // Инициализация навигации
  const navigate = useNavigate();


// В вашем компоненте:
const axiosInstance = useMemo(() => {
  // Используем уже настроенный apiClient вместо создания нового экземпляра axios
  return apiClient;
}, []);

  // Обновление статуса заказа
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      // Обновляем заказ через API
      await axiosInstance.patch(`/orders/${id}/status`, { status });
      
      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id ? {
            ...order,
            status
          } : order
        )
      );
      
      notification.success({
        message: 'Статус обновлен',
        description: `Статус заказа №${id} изменен на "${getStatusText(status)}"`
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус заказа'
      });
    }
  };
  
  // Автоматическое назначение курьера
  const autoAssignCourier = async (orderId: number) => {
    try {
      // Выбираем случайного курьера из списка
      const randomIndex = Math.floor(Math.random() * AVAILABLE_COURIERS.length);
      const assignedCourier = AVAILABLE_COURIERS[randomIndex];
      
      // Текущая дата + 3 дня для предполагаемой даты доставки
      const estimatedDeliveryDate = dayjs().add(3, 'day').format('YYYY-MM-DD');
      
      // Обновляем заказ через API
      await axiosInstance.patch(`/orders/${orderId}`, {
        courier_name: assignedCourier,
        estimated_delivery: estimatedDeliveryDate
      });
      
      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? {
            ...order,
            courier_name: assignedCourier,
            estimated_delivery: estimatedDeliveryDate
          } : order
        )
      );
      
      notification.success({
        message: 'Курьер назначен',
        description: `Заказу №${orderId} назначен курьер: ${assignedCourier}`
      });
    } catch (error) {
      console.error('Ошибка при автоматическом назначении курьера:', error);
      notification.error({
        message: 'Ошибка при назначении курьера',
        description: 'Не удалось автоматически назначить курьера'
      });
    }
  };

  // Автоматическое обновление статусов заказов
  const autoUpdateOrderStatuses = async (ordersList: Order[]) => {
    try {
      for (const order of ordersList) {
        // Получаем статус платежа
        const paymentStatus = order.payment?.payment_status || order.payment_status;
        
        // Если заказ оплачен и ожидает обработки
        if (
          paymentStatus === 'completed' &&
          order.status === 'pending' &&
          order.payment_method !== 'cash' &&
          order.payment_method !== 'cash_on_delivery'
        ) {
          // Обновляем статус заказа на "processing"
          await updateOrderStatus(order.id, 'processing');
          
          // Если у заказа нет назначенного курьера, назначаем автоматически
          if (!order.courier_name) {
            await autoAssignCourier(order.id);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при автообновлении статусов:', error);
    }
  };

  // Получение заказов из базы данных через API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Массив возможных URL для заказов с разными префиксами
      const urls = [
        'http://127.0.0.1:8080/ais/api/orders',  // ✅ Работает
        '/ais/api/orders',                       // Через прокси
        'http://127.0.0.1:8001/ais/api/orders'   // Прямое подключение
      ];

      let ordersData = null;
      let fetchSuccess = false;
      
      // Пробуем разные URL
      for (const url of urls) {
        try {
          console.log(`Попытка получения заказов с URL: ${url}`);
          const response = await axiosInstance.get(url);
          
          if (Array.isArray(response.data)) {
            ordersData = response.data;
            fetchSuccess = true;
            console.log(`Заказы успешно получены с URL: ${url}`);
            break;
          }
        } catch (err) {
          console.warn(`Ошибка при получении заказов с URL ${url}:`, err);
        }
      }
      
      if (!fetchSuccess || !ordersData) {
        throw new Error('Не удалось получить заказы ни по одному из доступных URL');
      }
      
      // Сохраняем полученные данные
      setOrders(ordersData);
      
      // Обновляем статистику
      const stats: {[key: string]: number} = {};
      const payStats: {[key: string]: number} = {};
      
      ordersData.forEach((order) => {
        // Статистика по статусам заказа
        stats[order.status] = (stats[order.status] || 0) + 1;
        
        // Статистика по статусам платежей
        const paymentStatus = order.payment?.payment_status || order.payment_status || 'pending';
        payStats[paymentStatus] = (payStats[paymentStatus] || 0) + 1;
      });
      
      setStatistics(stats);
      setPaymentStatistics(payStats);
      
      // Автоматическое обновление статусов
      await autoUpdateOrderStatuses(ordersData);
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      notification.error({
        message: 'Ошибка при загрузке заказов',
        description: 'Не удалось получить данные заказов из базы данных'
      });
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  // Подтверждение оплаты заказа
  const confirmOrderPayment = async (id: number) => {
    setConfirmingPayment(id);
    try {
      const order = orders.find(o => o.id === id);
      if (!order) {
        throw new Error('Заказ не найден');
      }
      
      // Создаем новый платеж через API
      const transactionId = `TXN${dayjs().format('YYYYMMDDHHmmss')}`;
      
      // Обновляем заказ с информацией об оплате
      await axiosInstance.patch(`/orders/${id}`, {
        payment_status: 'completed',
        transaction_id: transactionId
      });
      
      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id ? { 
            ...order, 
            payment_status: 'completed',
            transaction_id: transactionId,
            payment: {
              ...order.payment,
              payment_status: 'completed',
              transaction_id: transactionId
            }
          } : order
        )
      );
      
      notification.success({
        message: 'Оплата подтверждена',
        description: `Оплата заказа №${id} подтверждена`
      });
      
      // Если заказ в ожидании, автоматически переводим в обработку
      if (order.status === 'pending') {
        await updateOrderStatus(id, 'processing');
      }
      
      // Если у заказа нет курьера, автоматически назначаем
      if (!order.courier_name) {
        await autoAssignCourier(id);
      }
    } catch (error) {
      console.error('Ошибка при подтверждении оплаты:', error);
      notification.error({
        message: 'Ошибка при подтверждении',
        description: 'Не удалось подтвердить оплату заказа'
      });
    } finally {
      setConfirmingPayment(null);
    }
  };

  // Синхронизация с Север-Рыбой через API
  const syncOrderWithSeverRyba = async (orderId: number) => {
    setSyncingOrder(orderId);
    try {
      await axiosInstance.post(`/orders/${orderId}/sync`, {
        target_system: 'sever_ryba',
        sync_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        user: CURRENT_USER
      });
      
      notification.success({
        message: 'Синхронизация с Север-Рыба',
        description: `Заказ №${orderId} успешно отправлен в систему Север-Рыба`
      });
    } catch (error) {
      console.error(`Ошибка при отправке заказа ${orderId} на синхронизацию:`, error);
      notification.error({
        message: 'Ошибка синхронизации',
        description: 'Не удалось синхронизировать заказ с системой Север-Рыба'
      });
    } finally {
      setSyncingOrder(null);
    }
  };

  // Отправка формы редактирования заказа
  const handleEditSubmit = async (values: any) => {
    if (!orderDetails) return;
    
    try {
      // Подготавливаем данные для API
      const updateData = { ...values };
      
      // Преобразуем моменты в строки
      if (values.estimated_delivery && dayjs.isDayjs(values.estimated_delivery)) {
        updateData.estimated_delivery = values.estimated_delivery.format('YYYY-MM-DD');
      }
      
      if (values.actual_delivery && dayjs.isDayjs(values.actual_delivery)) {
        updateData.actual_delivery = values.actual_delivery.format('YYYY-MM-DD HH:mm:ss');
      }
      
      // Отправляем обновления на сервер
      const response = await axiosInstance.patch(`/orders/${orderDetails.id}`, updateData);
      
      // Обновляем локальное состояние
      const updatedOrder = response.data;
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderDetails.id ? updatedOrder : order
        )
      );
      
      setOrderDetails(updatedOrder);
      
      notification.success({
        message: 'Заказ обновлен',
        description: `Заказ №${orderDetails.id} успешно обновлен`
      });
      
      setEditVisible(false);
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные заказа'
      });
    }
  };

  // Создание нового платежа
  const handleCreatePayment = async (values: any) => {
    try {
      const transactionId = values.transaction_id || `TXN${dayjs().format('YYYYMMDDHHmmss')}`;
      
      // Обновляем заказ с информацией об оплате
      await axiosInstance.patch(`/orders/${values.order_id}`, {
        payment_status: values.payment_status,
        transaction_id: transactionId,
        payment_method: values.payment_method
      });
      
      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === values.order_id ? {
            ...order,
            payment_status: values.payment_status,
            transaction_id: transactionId,
            payment_method: values.payment_method,
            payment: {
              ...order.payment,
              payment_status: values.payment_status,
              transaction_id: transactionId,
              payment_method: values.payment_method
            }
          } : order
        )
      );
      
      notification.success({
        message: 'Платеж добавлен',
        description: `Новый платеж для заказа №${values.order_id} успешно создан`
      });
      
      // Запускаем автоматизацию для этого заказа
      if (values.payment_status === 'completed') {
        const order = orders.find(o => o.id === values.order_id);
        
        if (order && order.status === 'pending') {
          await updateOrderStatus(values.order_id, 'processing');
        }
        
        // Если у заказа нет курьера, автоматически назначаем
        if (order && !order.courier_name) {
          await autoAssignCourier(values.order_id);
        }
      }
      
      paymentForm.resetFields();
      setPaymentModalVisible(false);
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      notification.error({
        message: 'Ошибка при создании платежа',
        description: 'Не удалось создать новый платеж'
      });
    }
  };

  // Печать заказа
  const printOrder = async (orderId: number) => {
    setPrintLoading(true);
    
    try {
      // Получаем детали заказа через API
      const orderResponse = await axiosInstance.get(`/orders/${orderId}`);
      const order = orderResponse.data;
      
      // Создаем новое окно для печати
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notification.error({
          message: 'Ошибка печати',
          description: 'Не удалось открыть окно печати. Проверьте настройки блокировки всплывающих окон.'
        });
        return;
      }
      
      // HTML для печати
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Заказ #${order.id}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
            .order-header { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            .section { margin-bottom: 20px; }
            .total { font-weight: bold; text-align: right; }
            @media print {
              body { margin: 0; padding: 1cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="order-header">
            <h1>Заказ #${order.id}</h1>
            <p><strong>Дата заказа:</strong> ${formatDate(order.created_at)}</p>
            <p><strong>Статус:</strong> ${getStatusText(order.status)}</p>
          </div>
          
          <div class="section">
            <h2>Информация о клиенте</h2>
            <p><strong>Имя:</strong> ${order.name || 'Не указано'}</p>
            <p><strong>ID пользователя:</strong> ${order.user_id}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address || 'Не указан'}</p>
            ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ''}
            ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ''}
            ${order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : ''}
          </div>
          
          <div class="section">
            <h2>Платежная информация</h2>
            <p><strong>Способ оплаты:</strong> ${getPaymentMethodText(order.payment_method)}</p>
            <p><strong>Статус оплаты:</strong> ${getPaymentStatusText(order.payment?.payment_status || order.payment_status)}</p>
            <p><strong>Сумма заказа:</strong> ${formatPrice(order.total_amount)}</p>
          </div>
          
          <div class="section">
            <h2>Информация о доставке</h2>
            <p><strong>Курьер:</strong> ${order.courier_name || 'Не назначен'}</p>
            ${order.tracking_number ? `<p><strong>Номер отслеживания:</strong> ${order.tracking_number}</p>` : ''}
            ${order.estimated_delivery ? `<p><strong>Планируемая дата доставки:</strong> ${formatDate(order.estimated_delivery)}</p>` : ''}
            ${order.actual_delivery ? `<p><strong>Фактическая дата доставки:</strong> ${formatDate(order.actual_delivery)}</p>` : ''}
          </div>
          
          <div class="section">
            <p style="text-align: center;">ООО "Север-Рыба" - Свежая рыба с севера</p>
            <p style="text-align: center;">Тел: +7 (999) 123-45-67 | Email: info@sever-fish.ru</p>
            <p style="text-align: center;">Документ сформирован: ${CURRENT_DATE}</p>
            <p style="text-align: center;">Пользователь: ${CURRENT_USER}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Печать
            </button>
            <button onclick="window.close();" style="padding: 10px 20px; background: #f5f5f5; color: #333; border: 1px solid #d9d9d9; border-radius: 4px; margin-left: 10px; cursor: pointer;">
              Закрыть
            </button>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Ошибка при печати заказа:', error);
      notification.error({
        message: 'Ошибка печати',
        description: 'Не удалось подготовить заказ для печати'
      });
    } finally {
      setPrintLoading(false);
    }
  };

  // Открытие формы редактирования
  const showEditForm = (order: Order) => {
    setOrderDetails(order);
    
    // Устанавливаем начальные значения формы
    editForm.setFieldsValue({
      status: order.status,
      name: order.name,
      delivery_address: order.delivery_address,
      phone: order.phone,
      email: order.email,
      comment: order.comment,
      courier_name: order.courier_name,
      tracking_number: order.tracking_number,
      delivery_notes: order.delivery_notes,
      estimated_delivery: order.estimated_delivery ? dayjs(order.estimated_delivery) : null,
      actual_delivery: order.actual_delivery ? dayjs(order.actual_delivery) : null
    });
    
    setEditVisible(true);
  };

  // Фильтрация заказов
  const filterOrders = useMemo(() => {
    return orders.filter(order => {
      let match = true;
      
      // Фильтр по поиску
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        const searchMatch =
          order.id.toString().includes(lowerSearchText) ||
          (order.name && order.name.toLowerCase().includes(lowerSearchText)) ||
          (order.delivery_address && order.delivery_address.toLowerCase().includes(lowerSearchText)) ||
          (order.phone && order.phone.toLowerCase().includes(lowerSearchText)) ||
          (order.email && order.email.toLowerCase().includes(lowerSearchText));
        
        if (!searchMatch) match = false;
      }
      
      // Фильтр по статусу заказа
      if (statusFilter && order.status !== statusFilter) {
        match = false;
      }
      
      // Фильтр по статусу оплаты
      if (paymentStatusFilter) {
        const paymentStatus = order.payment?.payment_status || order.payment_status;
        if (paymentStatus !== paymentStatusFilter) {
          match = false;
        }
      }
      
      // Фильтр по датам
      if (dateRange && dateRange[0] && dateRange[1]) {
        const orderDate = dayjs(order.created_at);
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        
        if (!orderDate.isBetween(startDate, endDate, null, '[]')) {
          match = false;
        }
      }
      
      return match;
    });
  }, [orders, searchText, statusFilter, paymentStatusFilter, dateRange]);

  // Переход на страницу доставки
  const goToDelivery = (orderId: number) => {
    navigate(`/delivery/${orderId}`);
  };

  // Вспомогательные функции
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD.MM.YYYY HH:mm');
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает обработки',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'in_transit': 'В пути',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: string | undefined): string => {
    if (!status) return 'Ожидает оплаты';
    
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает оплаты',
      'processing': 'Обрабатывается',
      'completed': 'Оплачен',
      'failed': 'Ошибка оплаты',
      'refunded': 'Возврат средств'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method: string): string => {
    const methodMap: { [key: string]: string } = {
      'online_card': 'Картой онлайн',
      'sbp': 'СБП',
      'cash': 'Наличными',
      'cash_on_delivery': 'Наличными при получении',
      'online_wallet': 'Электронный кошелёк',
      'credit_card': 'Кредитной картой',
      'bank_transfer': 'Банковский перевод'
    };
    return methodMap[method] || method;
  };

  // Очистка фильтров
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setPaymentStatusFilter(null);
    setDateRange(null);
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchOrders();
    
    // Периодическое обновление данных
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 300000); // каждые 5 минут
    
    return () => clearInterval(refreshInterval);
  }, [fetchOrders]);

  // Компонент статистики
  const Statistic: React.FC<{ title: string; value: number; prefix?: React.ReactNode }> = ({
    title,
    value,
    prefix
  }) => {
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

  // Колонки для таблицы
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id: number) => <strong>#{id}</strong>
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Клиент',
      key: 'client',
      width: 150,
      ellipsis: true,
      render: (text: string, record: Order) => (
        <div>
          <div>{record.name || 'Не указан'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.phone || record.email || 'Нет контактов'}
          </Text>
        </div>
      )
    },
    {
      title: 'Сумма',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (amount: number) => formatPrice(amount)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'pending' ? 'orange' :
          status === 'processing' ? 'purple' :
          status === 'shipped' || status === 'in_transit' ? 'blue' :
          status === 'delivered' ? 'green' :
          status === 'cancelled' ? 'red' : 'default'
        }>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Оплата',
      key: 'payment',
      width: 120,
      render: (text: string, record: Order) => {
        const paymentStatus = record.payment?.payment_status || record.payment_status;
        return (
          <Space direction="vertical" size="small">
            <div>{getPaymentMethodText(record.payment_method)}</div>
            <Tag color={
              paymentStatus === 'completed' ? 'green' :
              paymentStatus === 'processing' ? 'blue' :
              paymentStatus === 'pending' ? 'orange' :
              paymentStatus === 'failed' ? 'red' : 'default'
            }>
              {getPaymentStatusText(paymentStatus)}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (text: string, record: Order) => {
        const paymentStatus = record.payment?.payment_status || record.payment_status;
        return (
          <Space size="small">
            <Tooltip title="Просмотр деталей">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  setOrderDetails(record);
                  setDetailsVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Редактировать">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showEditForm(record)}
              />
            </Tooltip>
            <Tooltip title="Печать заказа">
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={() => printOrder(record.id)}
                loading={printLoading}
              />
            </Tooltip>
            <Tooltip title="Управление доставкой">
              <Button
                type="text"
                icon={<SendOutlined />}
                onClick={() => goToDelivery(record.id)}
              />
            </Tooltip>
            {paymentStatus !== 'completed' && (
              <Tooltip title="Подтвердить оплату">
                <Popconfirm
                  title="Подтверждение оплаты"
                  description="Вы уверены, что хотите подтвердить оплату этого заказа?"
                  onConfirm={() => confirmOrderPayment(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    type="text"
                    icon={<DollarOutlined />}
                    loading={confirmingPayment === record.id}
                  />
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="Синхронизировать с Север-Рыба">
              <Button
                type="text"
                icon={<SyncOutlined spin={syncingOrder === record.id} />}
                onClick={() => syncOrderWithSeverRyba(record.id)}
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="orders-page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <div className="header-title">
          <Title level={2}>Управление заказами</Title>
          <Text type="secondary">
            {dayjs(CURRENT_DATE).format('DD MMMM YYYY')} | {orders.length} заказов в базе данных
          </Text>
        </div>
        <Button 
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setPaymentModalVisible(true)}
          className="create-button"
        >
          Создать платеж
        </Button>
      </div>

      {/* Информационная панель */}
      <Card className="info-card" type="inner">
        <Space>
          <CheckCircleOutlined className="info-icon" />
          <Text strong>
            Сейчас: {CURRENT_DATE}, Пользователь: {CURRENT_USER}.
            Полуавтоматический режим активен. При оплате заказа автоматически назначается курьер и обновляется статус.
          </Text>
        </Space>
      </Card>

      {/* Карточки статистики */}
      <div className="stats-row">
        <Card size="small" className="stat-card">
          <Statistic title="Всего заказов" value={orders.length} />
        </Card>
        <Card size="small" className="stat-card">
          <Statistic title="Ожидают обработки" value={statistics['pending'] || 0} />
        </Card>
        <Card size="small" className="stat-card">
          <Statistic title="В обработке" value={statistics['processing'] || 0} />
        </Card>
        <Card size="small" className="stat-card">
          <Statistic title="Отправлены" value={(statistics['shipped'] || 0) + (statistics['in_transit'] || 0)} />
        </Card>
        <Card size="small" className="stat-card">
          <Statistic title="Доставлены" value={statistics['delivered'] || 0} />
        </Card>
      </div>

      {/* Панель фильтров */}
      <Card className="filter-card">
        <div className="filter-container">
          <Row gutter={[8, 8]} align="middle" justify="space-between">
            <Col xs={24} md={8} lg={8}>
              <Input
                placeholder="Поиск по заказу, клиенту или адресу"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="search-input"
              />
            </Col>
            <Col xs={12} md={4} lg={4}>
              <Select
                placeholder="Статус заказа"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                className="status-select"
              >
                <Option value="pending">Ожидает обработки</Option>
                <Option value="processing">В обработке</Option>
                <Option value="shipped">Отправлен</Option>
                <Option value="in_transit">В пути</Option>
                <Option value="delivered">Доставлен</Option>
                <Option value="cancelled">Отменен</Option>
              </Select>
            </Col>
            <Col xs={12} md={4} lg={4}>
              <Select
                placeholder="Статус оплаты"
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                allowClear
                className="payment-status-select"
              >
                <Option value="pending">Ожидает оплаты</Option>
                <Option value="processing">Обрабатывается</Option>
                <Option value="completed">Оплачен</Option>
                <Option value="failed">Ошибка оплаты</Option>
                <Option value="refunded">Возврат средств</Option>
              </Select>
            </Col>
            <Col xs={12} md={5} lg={5}>
              <RangePicker
                format="DD.MM.YYYY"
                placeholder={['Дата с', 'Дата по']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                allowClear
                className="date-range-picker"
                locale={locale}
              />
            </Col>
            <Col xs={12} md={3} lg={3}>
              <div className="filter-actions">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchOrders}
                  loading={loading}
                  className="refresh-button"
                >
                  Обновить
                </Button>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearFilters}
                  className="clear-button"
                >
                  Сбросить
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Таблица заказов */}
      <Card className="table-card">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filterOrders}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Всего ${total} заказов`
            }}
            className="orders-table"
            size="middle"
          />
        )}
      </Card>

      {/* Модальное окно деталей заказа */}
      <Drawer
        title={`Заказ #${orderDetails?.id || ''}`}
        width={600}
        open={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        extra={
          <Space>
            <Button
              onClick={() => {
                setDetailsVisible(false);
                if (orderDetails) showEditForm(orderDetails);
              }}
            >
              Редактировать
            </Button>
            <Button
              type="primary"
              onClick={() => orderDetails && printOrder(orderDetails.id)}
              className="print-button"
            >
              Печать
            </Button>
          </Space>
        }
      >
        {orderDetails && (
          <div>
            <Card title="Основная информация" className="detail-card">
              <p><strong>Дата создания:</strong> {formatDate(orderDetails.created_at)}</p>
              <p>
                <strong>Статус заказа:</strong> {' '}
                <Tag color={
                  orderDetails.status === 'pending' ? 'orange' :
                  orderDetails.status === 'processing' ? 'purple' :
                  orderDetails.status === 'shipped' || orderDetails.status === 'in_transit' ? 'blue' :
                  orderDetails.status === 'delivered' ? 'green' :
                  orderDetails.status === 'cancelled' ? 'red' : 'default'
                }>
                  {getStatusText(orderDetails.status)}
                </Tag>
                {orderDetails.status === 'pending' && (
                  <Button
                    type="link"
                    onClick={() => {
                      updateOrderStatus(orderDetails.id, 'processing');
                      setDetailsVisible(false);
                    }}
                  >
                    Обработать заказ
                  </Button>
                )}
              </p>
              <p><strong>Общая сумма:</strong> {formatPrice(orderDetails.total_amount)}</p>
            </Card>
            
            <Card title="Клиент" className="detail-card">
              <p><strong>Имя:</strong> {orderDetails.name || 'Не указано'}</p>
              <p><strong>ID пользователя:</strong> {orderDetails.user_id}</p>
              <p><strong>Телефон:</strong> {orderDetails.phone || 'Не указан'}</p>
              <p><strong>Email:</strong> {orderDetails.email || 'Не указан'}</p>
              <p><strong>Адрес доставки:</strong> {orderDetails.delivery_address || 'Не указан'}</p>
              <p><strong>Комментарий:</strong> {orderDetails.comment || 'Нет комментария'}</p>
            </Card>
            
            <Card title="Оплата" className="detail-card">
              <p><strong>Способ оплаты:</strong> {getPaymentMethodText(orderDetails.payment_method)}</p>
              <p>
                <strong>Статус оплаты:</strong> {' '}
                <Tag color={
                  orderDetails.payment?.payment_status === 'completed' ? 'green' :
                  orderDetails.payment?.payment_status === 'processing' ? 'blue' :
                  orderDetails.payment?.payment_status === 'pending' ? 'orange' :
                  orderDetails.payment?.payment_status === 'failed' ? 'red' : 'default'
                }>
                  {getPaymentStatusText(orderDetails.payment?.payment_status || orderDetails.payment_status)}
                </Tag>
                {(orderDetails.payment?.payment_status !== 'completed' && orderDetails.payment_status !== 'completed') && (
                  <Button
                    type="link"
                    onClick={() => {
                      confirmOrderPayment(orderDetails.id);
                      setDetailsVisible(false);
                    }}
                  >
                    Подтвердить оплату
                  </Button>
                )}
              </p>
            </Card>
            
            <Card title="Доставка" className="detail-card">
              <p>
                <strong>Курьер:</strong> {orderDetails.courier_name || 'Не назначен'}
                {!orderDetails.courier_name && (
                  <Button
                    type="link"
                    onClick={() => {
                      autoAssignCourier(orderDetails.id);
                      setDetailsVisible(false);
                    }}
                  >
                    Назначить курьера
                  </Button>
                )}
              </p>
              <p><strong>Номер отслеживания:</strong> {orderDetails.tracking_number || 'Не указан'}</p>
              <p><strong>Планируемая дата доставки:</strong> {orderDetails.estimated_delivery ? formatDate(orderDetails.estimated_delivery) : 'Не указана'}</p>
              <p><strong>Фактическая дата доставки:</strong> {orderDetails.actual_delivery ? formatDate(orderDetails.actual_delivery) : 'Не доставлено'}</p>
              <p><strong>Примечания:</strong> {orderDetails.delivery_notes || 'Нет примечаний'}</p>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Форма редактирования заказа */}
      <Drawer
        title={`Редактирование заказа #${orderDetails?.id || ''}`}
        width={600}
        open={editVisible}
        onClose={() => setEditVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setEditVisible(false)}>Отмена</Button>
            <Button type="primary" onClick={() => editForm.submit()}>
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
            name="name"
            label="Имя клиента"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Телефон клиента"
          >
            <Input placeholder="+7 (___) ___-__-__" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email клиента"
          >
            <Input type="email" />
          </Form.Item>
          
          <Form.Item
            name="delivery_address"
            label="Адрес доставки"
          >
            <TextArea rows={2} />
          </Form.Item>
          
          <Form.Item
            name="comment"
            label="Комментарий к заказу"
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
              style={{ width: '100%' }}
              locale={locale}
            />
          </Form.Item>
          
          <Form.Item
            name="actual_delivery"
            label="Фактическая дата доставки"
          >
            <DatePicker
              format="DD.MM.YYYY"
              showTime
              style={{ width: '100%' }}
              locale={locale}
            />
          </Form.Item>
          
          <Form.Item
            name="delivery_notes"
            label="Примечания к доставке"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Модальное окно для создания платежа */}
      <Modal
        title="Создание платежа"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        className="payment-modal"
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleCreatePayment}
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
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {orders.map(order => (
                <Option key={order.id} value={order.id}>
                  {`Заказ #${order.id} - ${formatPrice(order.total_amount)} - ${order.name || 'Без имени'}`}
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
            <Space className="form-actions">
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

      {/* Добавляем CSS для стилизации компонентов */}
      <style jsx>{`
        .orders-page {
          max-width: 100%;
          padding: 20px;
          margin: 0 auto;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .header-title {
          flex: 1;
        }
        
        .create-button {
          background-color: #0e6eab;
          border-color: #0e6eab;
          margin-left: 16px;
        }
        
        .info-card {
          margin-bottom: 16px;
        }
        
        .info-icon {
          color: #52c41a;
        }
        
        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .stat-card {
          flex: 1;
          min-width: 140px;
        }
        
        .statistic-container {
          text-align: center;
        }
        
        .statistic-title {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 4px;
        }
        
        .statistic-value {
          font-size: 24px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
        }
        
        .filter-card {
          margin-bottom: 16px;
          border-radius: 8px;
        }
        
        .filter-container {
          padding: 5px 0;
        }
        
        .search-input,
        .status-select,
        .payment-status-select,
        .date-range-picker {
          width: 100%;
        }
        
        .filter-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .refresh-button,
        .clear-button {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 32px;
        }
        
        .table-card {
          border-radius: 8px;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        }
        
        .detail-card {
          margin-bottom: 16px;
        }
        
        .orders-table {
          margin-top: 0;
        }
        
        .print-button {
          background-color: #0e6eab;
          border-color: #0e6eab;
        }
        
        .payment-modal .form-actions {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }
        
        /* Адаптивные стили */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .create-button {
            margin-top: 16px;
            margin-left: 0;
            width: 100%;
          }
          
          .stats-row {
            flex-direction: column;
          }
          
          .stat-card {
            width: 100%;
          }
          
          .filter-actions {
            margin-top: 8px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;