import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Card, 
  Select, 
  Input, 
  DatePicker, 
  Typography, 
  Space, 
  Drawer, 
  Form, 
  notification, 
  message, 
  Row, 
  Col, 
  Popconfirm, 
  Spin,
  Modal,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  EditOutlined, 
  PrinterOutlined, 
  SendOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  FilterOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/ru';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import '../styles/Orders.css';

// Устанавливаем русскую локаль для dayjs и плагины
dayjs.locale('ru');
dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Константы для работы с датами
const CURRENT_DATE = '2025-05-08 19:36:50';
const CURRENT_USER = 'katarymba';

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
  total_price: number;
  created_at: string;
  status: string;
  client_name: string;
  delivery_address: string;
  order_items: OrderItem[];
  payment_method: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  delivery_status?: string;
  payment_status?: string;
  transaction_id?: string;
  phone?: string;
  email?: string;
  contact_phone?: string;
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
}

enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

interface OrdersProps {
  token?: string;
}

// Словарь для имен товаров
const productNames: {[key: number]: string} = {
  1: 'Семга свежая',
  3: 'Сельдь малосольная',
  5: 'Осетр копченый',
  6: 'Форель радужная',
  11: 'Треска атлантическая',
};

// Доступные курьеры
const AVAILABLE_COURIERS = [
  'Сидоров А.А.',
  'Кузнецов В.А.',
  'Дербенев И.С.',
  'Смирнова Е.П.',
  'Иванов К.Н.'
];

// Компонент страницы заказов
const Orders: React.FC<OrdersProps> = ({ token }) => {
  // Состояние
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);
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
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [confirmingPayment, setConfirmingPayment] = useState<number | null>(null);
  const [availableCouriers, setAvailableCouriers] = useState<string[]>(AVAILABLE_COURIERS);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentForm] = Form.useForm();
  const [syncingOrder, setSyncingOrder] = useState<number | null>(null);
  
  // API URL и инициализация навигации
  const API_BASE_URL = 'http://localhost:8001';
  const navigate = useNavigate();
  
  // Настройка axios с токеном авторизации
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Получение заказов из базы данных через API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Запрос к API для получения всех заказов
      const ordersResponse = await axiosInstance.get('/orders');
      
      if (Array.isArray(ordersResponse.data)) {
        const ordersData = ordersResponse.data;
        
        // Получаем платежи для обогащения заказов информацией о платежах
        await fetchPayments();
        
        // Обогащаем данные заказов информацией о платежах
        const enrichedOrders = ordersData.map((order: Order) => {
          // Находим платежи для этого заказа
          const orderPayments = payments.filter(p => p.order_id === order.id);
          
          // Получаем последний платеж
          const latestPayment = orderPayments.length ? 
            orderPayments.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0] : null;
          
          // Обработка order_items, если они представлены строкой
          let orderItems = order.order_items;
          if (typeof orderItems === 'string') {
            try {
              orderItems = JSON.parse(orderItems);
            } catch (e) {
              console.error('Ошибка при парсинге order_items:', e);
              orderItems = [];
            }
          }
          
          // Добавляем информацию о платеже в заказ
          return {
            ...order,
            order_items: orderItems,
            payment_status: latestPayment?.payment_status || 'pending',
            transaction_id: latestPayment?.transaction_id
          };
        });
        
        setOrders(enrichedOrders);
        
        // Рассчитываем статистику
        const stats: {[key: string]: number} = {};
        const payStats: {[key: string]: number} = {};
        
        enrichedOrders.forEach((order: Order) => {
          stats[order.status] = (stats[order.status] || 0) + 1;
          if (order.payment_status) {
            payStats[order.payment_status] = (payStats[order.payment_status] || 0) + 1;
          }
        });
        
        setStatistics(stats);
        setPaymentStatistics(payStats);
        
        // Автоматически обновляем статусы и назначаем курьеров
        autoUpdateOrderStatuses(enrichedOrders);
      }
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      notification.error({
        message: 'Ошибка при загрузке заказов',
        description: 'Не удалось получить данные заказов из базы данных'
      });
    } finally {
      setLoading(false);
    }
  }, [payments]);
  
  // Получение платежей из базы данных через API
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      // Запрос к API для получения всех платежей
      const paymentsResponse = await axiosInstance.get('/payments');
      
      if (Array.isArray(paymentsResponse.data)) {
        setPayments(paymentsResponse.data);
        return paymentsResponse.data;
      }
      return [];
    } catch (error) {
      console.error('Ошибка при получении платежей:', error);
      notification.error({
        message: 'Ошибка при загрузке платежей',
        description: 'Не удалось получить данные платежей из базы данных'
      });
      return [];
    } finally {
      setPaymentsLoading(false);
    }
  }, [axiosInstance]);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchOrders();
    
    // Периодическое обновление данных
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 300000); // каждые 5 минут
    
    return () => clearInterval(refreshInterval);
  }, [fetchOrders]);
  
  // Автоматическое обновление статусов заказов и назначение курьеров
  const autoUpdateOrderStatuses = async (ordersList: Order[]) => {
    try {
      for (const order of ordersList) {
        // Если заказ оплачен и ожидает обработки
        if (
          order.payment_status === 'completed' && 
          order.status === 'pending' && 
          order.payment_method !== 'cash_on_delivery' &&
          order.payment_method !== 'cash'
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
  
  // Автоматическое назначение курьера
  const autoAssignCourier = async (orderId: number) => {
    try {
      // Выбираем случайного курьера из списка
      const randomIndex = Math.floor(Math.random() * availableCouriers.length);
      const assignedCourier = availableCouriers[randomIndex];
      
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
        message: 'Курьер назначен автоматически',
        description: `Заказу №${orderId} автоматически назначен курьер: ${assignedCourier}`
      });
    } catch (error) {
      console.error('Ошибка при автоматическом назначении курьера:', error);
      notification.error({
        message: 'Ошибка при назначении курьера',
        description: 'Не удалось автоматически назначить курьера'
      });
    }
  };
  
  // Обновление статуса заказа
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      // Обновляем заказ через API
      const updateData: any = { status };
      
      // Если статус - доставлен, добавляем фактическую дату доставки
      if (status === 'delivered') {
        updateData.actual_delivery = dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      
      // Также обновляем статус доставки, чтобы они были синхронизированы
      updateData.delivery_status = status;
      
      await axiosInstance.patch(`/orders/${id}`, updateData);
      
      // Обновляем локальное состояние
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === id ? { 
            ...order, 
            status, 
            delivery_status: status,
            ...(status === 'delivered' ? { actual_delivery: dayjs().format('YYYY-MM-DD HH:mm:ss') } : {})
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
      
      const paymentData = {
        order_id: id,
        payment_method: order.payment_method,
        payment_status: 'completed',
        transaction_id: transactionId,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      const response = await axiosInstance.post('/payments', paymentData);
      
      // Обновляем локальное состояние
      const newPayment = response.data;
      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === id ? { ...order, payment_status: 'completed', transaction_id: transactionId } : order
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
      // Отправляем запрос на синхронизацию
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
  
  // Экспорт заказов в Excel
  const exportOrdersToExcel = async () => {
    setExportLoading(true);
    try {
      // Запрос на экспорт заказов
      const response = await axiosInstance.get('/orders/export', {
        responseType: 'blob',
        params: {
          format: 'csv',
          search: searchText,
          status: statusFilter,
          payment_status: paymentStatusFilter,
          start_date: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
          end_date: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined
        }
      });
      
      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      notification.success({
        message: 'Экспорт выполнен',
        description: 'Данные заказов успешно экспортированы'
      });
    } catch (error) {
      console.error('Ошибка при экспорте заказов:', error);
      notification.error({
        message: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать данные заказов'
      });
    } finally {
      setExportLoading(false);
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
      await axiosInstance.patch(`/orders/${orderDetails.id}`, updateData);
      
      // Обновляем локальное состояние
      const updatedOrder = { ...orderDetails, ...updateData };
      
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
      
      // Создаем новый платеж через API
      const paymentData = {
        order_id: values.order_id,
        payment_method: values.payment_method,
        payment_status: values.payment_status || 'completed',
        transaction_id: transactionId,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      const response = await axiosInstance.post('/payments', paymentData);
      
      // Получаем новый платеж из ответа
      const newPayment = response.data;
      
      // Обновляем список платежей
      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      // Обновляем статус платежа в заказе, если он завершен
      if (values.payment_status === 'completed') {
        const updatedOrders = orders.map(o => 
          o.id === values.order_id ? { 
            ...o, 
            payment_status: 'completed',
            transaction_id: transactionId
          } : o
        );
        
        setOrders(updatedOrders);
        
        // Запускаем автоматизацию для этого заказа
        const order = updatedOrders.find(o => o.id === values.order_id);
        
        if (order && order.status === 'pending') {
          await updateOrderStatus(values.order_id, 'processing');
        }
        
        // Если у заказа нет курьера, автоматически назначаем
        if (order && !order.courier_name) {
          await autoAssignCourier(values.order_id);
        }
      }
      
      notification.success({
        message: 'Платеж добавлен',
        description: `Новый платеж для заказа №${values.order_id} успешно создан`
      });
      
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
      
      // Получаем платежи для этого заказа
      const paymentsResponse = await axiosInstance.get(`/payments`, {
        params: { order_id: orderId }
      });
      const orderPayments = paymentsResponse.data || [];
      
      // Создаем новое окно для печати
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notification.error({
          message: 'Ошибка печати',
          description: 'Не удалось открыть окно печати. Проверьте настройки блокировки всплывающих окон.'
        });
        return;
      }
      
      // Обработка order_items, если они представлены строкой
      let orderItems = order.order_items;
      if (typeof orderItems === 'string') {
        try {
          orderItems = JSON.parse(orderItems);
        } catch (e) {
          console.error('Ошибка при парсинге order_items:', e);
          orderItems = [];
        }
      }
      
      // Подготавливаем данные товаров для печати
      const itemsHtml = orderItems.map((item: OrderItem) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.product_id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${productNames[item.product_id] || `Товар ${item.product_id}`}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(item.price)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `).join('');
      
      // Подготавливаем данные платежей для печати
      const paymentsHtml = orderPayments.map((payment: Payment) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${payment.id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${getPaymentMethodText(payment.payment_method)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${getPaymentStatusText(payment.payment_status)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payment.transaction_id || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(payment.created_at)}</td>
        </tr>
      `).join('');
      
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
            <p><strong>Имя:</strong> ${order.client_name || 'Не указано'}</p>
            <p><strong>ID пользователя:</strong> ${order.user_id}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address || 'Не указан'}</p>
            ${order.contact_phone ? `<p><strong>Телефон:</strong> ${order.contact_phone}</p>` : ''}
          </div>
          
          <div class="section">
            <h2>Состав заказа</h2>
            <table>
              <thead>
                <tr>
                  <th>ID товара</th>
                  <th>Наименование</th>
                  <th style="text-align: center;">Количество</th>
                  <th style="text-align: right;">Цена за ед.</th>
                  <th style="text-align: right;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="total">Итого:</td>
                  <td class="total" style="text-align: right;">${formatPrice(order.total_price)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="section">
            <h2>Платежная информация</h2>
            <p><strong>Способ оплаты:</strong> ${getPaymentMethodText(order.payment_method)}</p>
            <p><strong>Статус оплаты:</strong> ${getPaymentStatusText(order.payment_status || 'pending')}</p>
            
            <h3>История платежей</h3>
            ${orderPayments.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>ID платежа</th>
                    <th>Способ оплаты</th>
                    <th>Статус</th>
                    <th>ID транзакции</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  ${paymentsHtml}
                </tbody>
              </table>
            ` : '<p>Нет записей о платежах</p>'}
          </div>
          
          <div class="section">
            <h2>Информация о доставке</h2>
            <p><strong>Курьер:</strong> ${order.courier_name || 'Не назначен'}</p>
            <p><strong>Номер отслеживания:</strong> ${order.tracking_number || 'Не указан'}</p>
            <p><strong>Планируемая дата доставки:</strong> ${order.estimated_delivery ? formatDate(order.estimated_delivery) : 'Не указана'}</p>
            <p><strong>Фактическая дата доставки:</strong> ${order.actual_delivery ? formatDate(order.actual_delivery) : 'Не доставлено'}</p>
            ${order.delivery_notes ? `<p><strong>Примечания к доставке:</strong> ${order.delivery_notes}</p>` : ''}
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
      client_name: order.client_name,
      delivery_address: order.delivery_address,
      courier_name: order.courier_name,
      tracking_number: order.tracking_number,
      delivery_notes: order.delivery_notes,
      contact_phone: order.contact_phone,
      estimated_delivery: order.estimated_delivery ? dayjs(order.estimated_delivery) : null,
      actual_delivery: order.actual_delivery ? dayjs(order.actual_delivery) : null,
      delivery_status: order.delivery_status || order.status
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
          (order.client_name && order.client_name.toLowerCase().includes(lowerSearchText)) ||
          (order.tracking_number && order.tracking_number.toLowerCase().includes(lowerSearchText)) ||
          (order.delivery_address && order.delivery_address.toLowerCase().includes(lowerSearchText));
        
        if (!searchMatch) match = false;
      }
      
      // Фильтр по статусу заказа
      if (statusFilter && order.status !== statusFilter) {
        match = false;
      }
      
      // Фильтр по статусу оплаты
      if (paymentStatusFilter && order.payment_status !== paymentStatusFilter) {
        match = false;
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
      maximumFractionDigits: 0
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

  const getPaymentStatusText = (status: string): string => {
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
  
  // Колонки для таблицы
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: Order, b: Order) => a.id - b.id,
      render: (id: number) => <span className="order-id">#{id}</span>
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      sorter: (a: Order, b: Order) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Клиент',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 150,
      ellipsis: true,
      render: (text: string, record: Order) => (
        <div>
          <div>{text || 'Не указан'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.user_id}</Text>
        </div>
      )
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 110,
      sorter: (a: Order, b: Order) => a.total_price - b.total_price,
      render: (price: number) => formatPrice(price)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Ожидает обработки', value: 'pending' },
        { text: 'В обработке', value: 'processing' },
        { text: 'Отправлен', value: 'shipped' },
        { text: 'В пути', value: 'in_transit' },
        { text: 'Доставлен', value: 'delivered' },
        { text: 'Отменен', value: 'cancelled' }
      ],
      onFilter: (value: string, record: Order) => record.status === value,
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
      width: 150,
      filters: [
        { text: 'Оплачен', value: 'completed' },
        { text: 'Обрабатывается', value: 'processing' },
        { text: 'Ожидает оплаты', value: 'pending' },
        { text: 'Ошибка оплаты', value: 'failed' },
        { text: 'Возврат', value: 'refunded' }
      ],
      onFilter: (value: string, record: Order) => record.payment_status === value,
      render: (text: string, record: Order) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>{getPaymentMethodText(record.payment_method)}</Text>
          <Tag color={
            record.payment_status === 'completed' ? 'green' : 
            record.payment_status === 'processing' ? 'blue' :
            record.payment_status === 'pending' ? 'orange' : 
            record.payment_status === 'failed' ? 'red' : 'default'
          }>
            {getPaymentStatusText(record.payment_status || 'pending')}
          </Tag>
          {record.transaction_id && (
            <div className="transaction-id" style={{ fontSize: '11px' }}>{record.transaction_id}</div>
          )}
        </Space>
      )
    },
    {
      title: 'Доставка',
      key: 'delivery',
      width: 130,
      render: (text: string, record: Order) => (
        <Space direction="vertical" size="small">
          {record.courier_name && (
            <div>{record.courier_name}</div>
          )}
          {!record.courier_name && record.payment_status === 'completed' && (
            <Text type="warning" style={{ fontSize: '12px' }}>Курьер не назначен</Text>
          )}
          {record.tracking_number && (
            <div className="tracking-number" style={{ fontSize: '11px' }}>{record.tracking_number}</div>
          )}
          {record.estimated_delivery && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Доставка: {dayjs(record.estimated_delivery).format('DD.MM.YYYY')}
            </Text>
          )}
          {record.delivery_status && record.delivery_status !== record.status && (
            <Tag color={
              record.delivery_status === 'in_transit' ? 'blue' :
              record.delivery_status === 'delivered' ? 'green' :
              'default'
            }>
              {getStatusText(record.delivery_status)}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      fixed: 'right' as 'right',
      render: (text: string, record: Order) => (
        <Space size={4} className="action-buttons">
          <Tooltip title="Просмотр деталей">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              className="action-button"
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
              className="action-button"
              onClick={() => showEditForm(record)}
            />
          </Tooltip>
          <Tooltip title="Печать заказа">
            <Button 
              type="text" 
              icon={<PrinterOutlined />}
              className="action-button"
              onClick={() => printOrder(record.id)}
              loading={printLoading}
            />
          </Tooltip>
          <Tooltip title="Управление доставкой">
            <Button 
              type="text" 
              icon={<SendOutlined />}
              className="action-button"
              onClick={() => goToDelivery(record.id)}
            />
          </Tooltip>
          {record.payment_status !== 'completed' && (
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
                  className="action-button"
                  loading={confirmingPayment === record.id}
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title="Синхронизировать с Север-Рыба">
            <Button 
              type="text" 
              icon={<SyncOutlined spin={syncingOrder === record.id} />}
              className="action-button"
              onClick={() => syncOrderWithSeverRyba(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

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
  
  // Рендер компонента
  return (
    <div className="orders-page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <Title level={2}>Управление заказами</Title>
        <Text type="secondary">
          {`${dayjs().format('DD MMMM YYYY')} | ${orders.length} заказов в базе данных`}
        </Text>
      </div>
      
      {/* Информационная панель */}
      <Card style={{ marginBottom: '16px' }} type="inner">
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text strong>
            Сейчас: {CURRENT_DATE}, Пользователь: {CURRENT_USER}. 
            Полуавтоматический режим активен. При оплате заказа автоматически назначается курьер и обновляется статус заказа.
          </Text>
        </Space>
      </Card>
      
      {/* Карточки статистики */}
      <div className="stats-row">
        <Card size="small" className="stat-card stat-card-all">
          <Statistic
            title="Всего заказов"
            value={orders.length}
            prefix={<ShoppingCartIcon />}
          />
        </Card>
        <Card size="small" className="stat-card stat-card-pending">
          <Statistic
            title="Ожидают обработки"
            value={statistics['pending'] || 0}
            prefix={<ClockIcon />}
          />
        </Card>
        <Card size="small" className="stat-card stat-card-processing">
          <Statistic
            title="В обработке"
            value={statistics['processing'] || 0}
            prefix={<SyncIcon />}
          />
        </Card>
        <Card size="small" className="stat-card stat-card-shipped">
          <Statistic
            title="Отправлены"
            value={(statistics['shipped'] || 0) + (statistics['in_transit'] || 0)}
            prefix={<DeliveryIcon />}
          />
        </Card>
        <Card size="small" className="stat-card stat-card-delivered">
          <Statistic
            title="Доставлены"
            value={statistics['delivered'] || 0}
            prefix={<CheckIcon />}
          />
        </Card>
        <Card size="small" className="stat-card stat-card-payment">
          <Statistic
            title="Ожидают оплаты"
            value={paymentStatistics['pending'] || 0}
            prefix={<PaymentIcon />}
          />
        </Card>
      </div>
      
      {/* Панель фильтров */}
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
              <Option value="pending">Ожидает обработки</Option>
              <Option value="processing">В обработке</Option>
              <Option value="shipped">Отправлен</Option>
              <Option value="in_transit">В пути</Option>
              <Option value="delivered">Доставлен</Option>
              <Option value="cancelled">Отменен</Option>
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
              <Option value="pending">Ожидает оплаты</Option>
              <Option value="processing">Обрабатывается</Option>
              <Option value="completed">Оплачен</Option>
              <Option value="failed">Ошибка оплаты</Option>
              <Option value="refunded">Возврат средств</Option>
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
      
      {/* Таблица заказов */}
      <Card className="orders-table-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filterOrders}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Всего ${total} заказов`
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
            locale={{
              emptyText: 'Нет данных заказов в базе'
            }}
          />
        )}
      </Card>
      
      {/* Модальное окно деталей заказа */}
      <Drawer
        title={`Заказ #${orderDetails?.id || ''}`}
        width={600}
        open={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailsVisible(false)}>Закрыть</Button>
            <Button 
              type="primary" 
              onClick={() => {
                setDetailsVisible(false);
                if (orderDetails) showEditForm(orderDetails);
              }}
            >
              Редактировать
            </Button>
            <Button 
              onClick={() => orderDetails && printOrder(orderDetails.id)}
              icon={<PrinterOutlined />}
              disabled={printLoading}
              loading={printLoading}
            >
              Печать
            </Button>
          </Space>
        }
      >
        {orderDetails && (
          <div className="order-details">
            <div className="detail-section">
              <div className="section-header">
                <h3>Основная информация</h3>
              </div>
              <Row gutter={[16, 8]}>
                <Col span={12}><Text strong>Дата создания:</Text></Col>
                <Col span={12}>{formatDate(orderDetails.created_at)}</Col>
                
                <Col span={12}><Text strong>Статус заказа:</Text></Col>
                <Col span={12}>
                  <Tag color={
                    orderDetails.status === 'pending' ? 'orange' :
                    orderDetails.status === 'processing' ? 'purple' :
                    orderDetails.status === 'shipped' || orderDetails.status === 'in_transit' ? 'blue' :
                    orderDetails.status === 'delivered' ? 'green' :
                    orderDetails.status === 'cancelled' ? 'red' : 'default'
                  }>
                    {getStatusText(orderDetails.status)}
                  </Tag>
                </Col>
                
                <Col span={12}><Text strong>Общая сумма:</Text></Col>
                <Col span={12}><Text>{formatPrice(orderDetails.total_price)}</Text></Col>
                
                <Col span={12}><Text strong>Метод оплаты:</Text></Col>
                <Col span={12}>{getPaymentMethodText(orderDetails.payment_method) || 'Не указан'}</Col>
                
                <Col span={12}><Text strong>Статус оплаты:</Text></Col>
                <Col span={12}>
                  <Tag color={
                    orderDetails.payment_status === 'completed' ? 'green' : 
                    orderDetails.payment_status === 'processing' ? 'blue' :
                    orderDetails.payment_status === 'pending' ? 'orange' : 
                    orderDetails.payment_status === 'failed' ? 'red' : 'default'
                  }>
                    {getPaymentStatusText(orderDetails.payment_status || 'pending')}
                  </Tag>
                  {orderDetails.payment_status !== 'completed' && (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => confirmOrderPayment(orderDetails.id)}
                      loading={confirmingPayment === orderDetails.id}
                    >
                      Подтвердить
                    </Button>
                  )}
                </Col>
                
                {orderDetails.transaction_id && (
                  <>
                    <Col span={12}><Text strong>ID транзакции:</Text></Col>
                    <Col span={12}>{orderDetails.transaction_id}</Col>
                  </>
                )}
              </Row>
            </div>
            
            <div className="detail-section">
              <div className="section-header">
                <h3>Информация о клиенте</h3>
              </div>
              <Row gutter={[16, 8]}>
                <Col span={12}><Text strong>ID пользователя:</Text></Col>
                <Col span={12}>{orderDetails.user_id}</Col>
                
                <Col span={12}><Text strong>Имя клиента:</Text></Col>
                <Col span={12}>{orderDetails.client_name || 'Не указан'}</Col>
                
                <Col span={12}><Text strong>Телефон:</Text></Col>
                <Col span={12}>{orderDetails.contact_phone || orderDetails.phone || 'Не указан'}</Col>
                
                {orderDetails.email && (
                  <>
                    <Col span={12}><Text strong>Email:</Text></Col>
                    <Col span={12}>{orderDetails.email}</Col>
                  </>
                )}
              </Row>
            </div>
            
            <div className="detail-section">
              <div className="section-header">
                <h3>Адрес доставки</h3>
              </div>
              <p>{orderDetails.delivery_address || 'Не указан'}</p>
            </div>
            
            <div className="detail-section">
              <div className="section-header">
                <h3>Товары в заказе</h3>
              </div>
              <Table
                dataSource={orderDetails.order_items}
                rowKey={(record, index) => `${record.product_id}_${index}`}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Товар',
                    dataIndex: 'product_name',
                    render: (text, record) => text || productNames[record.product_id] || `Товар ${record.product_id}`
                  },
                  {
                    title: 'Цена',
                    dataIndex: 'price',
                    render: (price) => formatPrice(price),
                    align: 'right'
                  },
                  {
                    title: 'Кол-во',
                    dataIndex: 'quantity',
                    align: 'center'
                  },
                  {
                    title: 'Сумма',
                    render: (_, record) => formatPrice(record.price * record.quantity),
                    align: 'right'
                  }
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}><strong>Итого:</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatPrice(orderDetails.total_price)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </div>
            
            <div className="detail-section">
              <div className="section-header">
                <h3>Платежи</h3>
                <Button 
                  type="link" 
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    paymentForm.setFieldsValue({ 
                      order_id: orderDetails.id,
                      payment_method: orderDetails.payment_method,
                      payment_status: 'completed'
                    });
                    setPaymentModalVisible(true);
                  }}
                >
                  Добавить платеж
                </Button>
              </div>
              <Table
                dataSource={payments.filter(p => p.order_id === orderDetails.id)}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    width: 60
                  },
                  {
                    title: 'Метод',
                    dataIndex: 'payment_method',
                    render: (method) => getPaymentMethodText(method)
                  },
                  {
                    title: 'Статус',
                    dataIndex: 'payment_status',
                    render: (status) => (
                      <Tag color={
                        status === 'completed' ? 'green' : 
                        status === 'processing' ? 'blue' :
                        status === 'pending' ? 'orange' : 
                        status === 'failed' ? 'red' : 'default'
                      }>
                        {getPaymentStatusText(status)}
                      </Tag>
                    )
                  },
                  {
                    title: 'Дата',
                    dataIndex: 'created_at',
                    render: (date) => formatDate(date)
                  }
                ]}
                locale={{
                  emptyText: 'Нет платежей для этого заказа'
                }}
              />
            </div>
            
            <div className="detail-section">
              <div className="section-header">
                <h3>Информация о доставке</h3>
              </div>
              <Row gutter={[16, 8]}>
                <Col span={12}><Text strong>Курьер:</Text></Col>
                <Col span={12}>
                  {orderDetails.courier_name || 'Не назначен'}
                  {!orderDetails.courier_name && orderDetails.payment_status === 'completed' && (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={async () => {
                        try {
                          // Выбираем случайного курьера из списка
                          const randomIndex = Math.floor(Math.random() * availableCouriers.length);
                          const assignedCourier = availableCouriers[randomIndex];
                          
                          // Текущая дата + 3 дня для предполагаемой даты доставки
                          const estimatedDeliveryDate = dayjs().add(3, 'day').format('YYYY-MM-DD');
                          
                          // Обновляем заказ через API
                          await axiosInstance.patch(`/orders/${orderDetails.id}`, {
                            courier_name: assignedCourier,
                            estimated_delivery: estimatedDeliveryDate
                          });
                          
                          const updatedOrder = { 
                            ...orderDetails, 
                            courier_name: assignedCourier,
                            estimated_delivery: estimatedDeliveryDate
                          };
                          
                          setOrderDetails(updatedOrder);
                          
                          // Обновляем в основном списке
                          const updatedOrders = orders.map(o => 
                            o.id === orderDetails.id ? updatedOrder : o
                          );
                          
                          setOrders(updatedOrders);
                          
                          notification.success({
                            message: 'Курьер назначен',
                            description: `Курьер ${assignedCourier} назначен для заказа №${orderDetails.id}`
                          });
                        } catch (error) {
                          console.error('Ошибка при назначении курьера:', error);
                          notification.error({
                            message: 'Ошибка при назначении курьера',
                            description: 'Не удалось назначить курьера для заказа'
                          });
                        }
                      }}
                    >
                      Назначить
                    </Button>
                  )}
                </Col>
                
                <Col span={12}><Text strong>Номер отслеживания:</Text></Col>
                <Col span={12}>{orderDetails.tracking_number || 'Не указан'}</Col>
                
                <Col span={12}><Text strong>Статус доставки:</Text></Col>
                <Col span={12}>
                  {orderDetails.delivery_status ? (
                    <Tag color={
                      orderDetails.delivery_status === 'in_transit' ? 'blue' :
                      orderDetails.delivery_status === 'delivered' ? 'green' :
                      'default'
                    }>
                      {getStatusText(orderDetails.delivery_status)}
                    </Tag>
                  ) : (
                    'Не указан'
                  )}
                </Col>
                
                <Col span={12}><Text strong>Планируемая доставка:</Text></Col>
                <Col span={12}>{orderDetails.estimated_delivery ? formatDate(orderDetails.estimated_delivery) : 'Не указана'}</Col>
                
                <Col span={12}><Text strong>Фактическая доставка:</Text></Col>
                <Col span={12}>{orderDetails.actual_delivery ? formatDate(orderDetails.actual_delivery) : 'Не выполнена'}</Col>
                
                <Col span={24}><Text strong>Примечания к доставке:</Text></Col>
                <Col span={24}>
                  <div className="notes-box">
                    {orderDetails.delivery_notes || 'Нет примечаний'}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Drawer>
      
      {/* Форма редактирования заказа */}
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
              {availableCouriers.map((courier, index) => (
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
      
      {/* Модальное окно для создания платежа */}
      <Modal
        title="Создание платежа"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
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
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {orders.map(order => (
                <Option key={order.id} value={order.id}>
                  {`Заказ #${order.id} - ${formatPrice(order.total_price)} - ${order.client_name || 'Без имени'}`}
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
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
    </div>
  );
};

export default Orders;