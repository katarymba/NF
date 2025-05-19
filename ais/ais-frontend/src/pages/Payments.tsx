import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, Tag, Button, Card, Select, Input, DatePicker, Typography, Space, Spin, Tooltip, Modal, Drawer, Form, notification, Row, Col, InputNumber, Tabs, Divider, Alert } from 'antd';
import { 
  SearchOutlined, FilterOutlined, ReloadOutlined, EyeOutlined, EditOutlined, 
  ExportOutlined, SyncOutlined, PlusOutlined, DollarOutlined, PrinterOutlined, 
  CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import '../styles/Payments.css';
import OrderItemsTable from "../components/delivery/OrderItemsTable";
import OrderStatusBadge from "../components/delivery/OrderStatusBadge";
import axios from 'axios';
import { API_BASE_URL as GATEWAY_URL, API_FULL_URL } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Константы
const CURRENT_DATE = '2025-05-08 18:28:55';
const CURRENT_USER = 'katarymba';

const API_BASE_URL = GATEWAY_URL;

// Типы на основе схемы базы данных
enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

enum PaymentMethod {
  ONLINE_CARD = 'online_card',
  SBP = 'sbp',
  CASH = 'cash',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  ONLINE_WALLET = 'online_wallet',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card'
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  product_name?: string;
}

interface Order {
  id: number;
  user_id: number;
  total_price: number;
  created_at: string;
  status: string;
  client_name?: string;
  delivery_address?: string;
  order_items: OrderItem[];
  payment_method?: string;
  payment_status?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  contact_phone?: string;
  delivery_status?: string;
  total_amount?: number;
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
  amount?: number;
  payer_name?: string;
  payer_email?: string;
  payment_details?: string;
  updated_at?: string;
}

// Компонент страницы Payments
const Payments: React.FC = () => {
  // Состояния
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Payment | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [paymentEditVisible, setPaymentEditVisible] = useState<boolean>(false);
  const [newPaymentVisible, setNewPaymentVisible] = useState<boolean>(false);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [paymentPrintLoading, setPaymentPrintLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<string>('1');
  const [editForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  
  // Фильтры и поиск
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [paymentSearchText, setPaymentSearchText] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [paymentDateRange, setPaymentDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  
  // Сортировка
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [paymentSortByDate, setPaymentSortByDate] = useState<'asc' | 'desc'>('desc');
  
  // При монтировании компонента проверяем соединение с БД и загружаем данные
  useEffect(() => {
    checkDatabaseConnection();
  }, []);
  
  // Проверка соединения с базой данных
  const checkDatabaseConnection = async () => {
    try {
      setDbStatus('loading');
      
      // Проверка подключения через ping API или запрос к API платежей
      const response = await axios.get(`${API_BASE_URL}/api/payments`);
      
      // Если запрос выполнен успешно, считаем, что соединение с базой установлено
      if (response.status === 200) {
        setDbStatus('connected');
        // Загружаем данные платежей
        fetchPayments();
        // Загружаем данные заказов
        fetchOrders();
      } else {
        throw new Error('Не удалось выполнить тестовый запрос к API');
      }
    } catch (err) {
      console.error('Ошибка подключения к API:', err);
      setDbStatus('error');
      setError('Не удалось подключиться к API. Проверьте, что сервер запущен и доступен.');
    }
  };
  
  // Загрузка заказов через API
  const fetchOrders = useCallback(async () => {
    if (dbStatus === 'error') {
      notification.error({
        message: 'Ошибка соединения',
        description: 'Отсутствует подключение к API. Данные заказов не могут быть загружены.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Пробуем все возможные маршруты API
      try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        if (response.data) {
          // Преобразуем JSONB данные, если они представлены как строки
          const formattedOrders = response.data.map((order: any) => ({
            ...order,
            order_items: typeof order.order_items === 'string' 
              ? JSON.parse(order.order_items) 
              : order.order_items
          }));
          
          setOrders(formattedOrders);
          return; // Успешно получили данные, выходим из функции
        }
      } catch (e) {
        console.log("Попытка получить данные через /orders не удалась:", e);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/orders`);
          if (response.data) {
            // Преобразуем JSONB данные, если они представлены как строки
            const formattedOrders = response.data.map((order: any) => ({
              ...order,
              order_items: typeof order.order_items === 'string' 
                ? JSON.parse(order.order_items) 
                : order.order_items
            }));
            
            setOrders(formattedOrders);
            return; // Успешно получили данные, выходим из функции
          }
        } catch (e) {
          console.log("Ошибка при получении заказов через альтернативный API:", e);
          setError('Не удалось получить данные заказов с сервера');
        }
      }
    } catch (error) {
      console.error('Ошибка при получении заказов через API:', error);
      setError('Не удалось получить данные заказов с сервера');
    } finally {
      setLoading(false);
    }
  }, [dbStatus]);
  
  // Загрузка платежей через API
  const fetchPayments = useCallback(async () => {
    if (dbStatus === 'error') {
      notification.error({
        message: 'Ошибка соединения',
        description: 'Отсутствует подключение к API. Данные платежей не могут быть загружены.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`);
      setPayments(response.data);
    } catch (error) {
      console.error('Ошибка при получении платежей через API:', error);
      setError('Не удалось получить данные платежей с сервера');
    } finally {
      setLoading(false);
    }
  }, [dbStatus]);
  
  // Фильтрация заказов по поисковому тексту, статусу и дате
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Фильтр по тексту (ID заказа, имя клиента, трекинг-номер)
        const searchLower = searchText.toLowerCase();
        const orderIdMatch = order.id.toString().includes(searchText);
        const clientNameMatch = (order.client_name || '').toLowerCase().includes(searchLower);
        const trackingMatch = (order.tracking_number || '').toLowerCase().includes(searchLower);
        const textMatch = orderIdMatch || clientNameMatch || trackingMatch;
        
        // Фильтр по статусу
        const statusMatch = !statusFilter || order.status === statusFilter;
        
        // Фильтр по дате
        let dateMatch = true;
        if (dateRange[0] && dateRange[1]) {
          const orderDate = dayjs(order.created_at);
          dateMatch = orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1].add(1, 'day'));
        }
        
        return textMatch && statusMatch && dateMatch;
      })
      .sort((a, b) => {
        // Сортировка по дате
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [orders, searchText, statusFilter, dateRange, sortByDate]);
  
  // Фильтрация платежей
  const filteredPayments = useMemo(() => {
    return payments
      .filter(payment => {
        // Фильтр по тексту (ID платежа, ID заказа, ID транзакции)
        const searchLower = paymentSearchText.toLowerCase();
        const paymentIdMatch = payment.id.toString().includes(paymentSearchText);
        const orderIdMatch = payment.order_id.toString().includes(paymentSearchText);
        const transactionIdMatch = (payment.transaction_id || '').toLowerCase().includes(searchLower);
        const textMatch = paymentIdMatch || orderIdMatch || transactionIdMatch;
        
        // Фильтр по статусу
        const statusMatch = !paymentStatusFilter || payment.payment_status === paymentStatusFilter;
        
        // Фильтр по дате
        let dateMatch = true;
        if (paymentDateRange[0] && paymentDateRange[1]) {
          const paymentDate = dayjs(payment.created_at);
          dateMatch = paymentDate.isAfter(paymentDateRange[0]) && paymentDate.isBefore(paymentDateRange[1].add(1, 'day'));
        }
        
        return textMatch && statusMatch && dateMatch;
      })
      .sort((a, b) => {
        // Сортировка по дате
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return paymentSortByDate === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [payments, paymentSearchText, paymentStatusFilter, paymentDateRange, paymentSortByDate]);
  
  // Обработчики событий
  const toggleSortDirection = () => {
    setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
  };
  
  const togglePaymentSortDirection = () => {
    setPaymentSortByDate(paymentSortByDate === 'asc' ? 'desc' : 'asc');
  };
  
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setDateRange([null, null]);
  };
  
  const clearPaymentFilters = () => {
    setPaymentSearchText('');
    setPaymentStatusFilter('');
    setPaymentDateRange([null, null]);
  };
  
  // Открытие окна с деталями заказа
  const showOrderDetails = (order: Order) => {
    setOrderDetails(order);
    setDetailsVisible(true);
  };
  
  // Открытие окна редактирования заказа
  const showEditOrder = (order: Order) => {
    setOrderDetails(order);
    editForm.setFieldsValue({
      status: order.status,
      tracking_number: order.tracking_number,
      courier_name: order.courier_name,
      estimated_delivery: order.estimated_delivery ? dayjs(order.estimated_delivery) : null,
      delivery_notes: order.delivery_notes,
      delivery_status: order.delivery_status
    });
    setEditVisible(true);
  };
  
  // Открытие окна деталей платежа
  const showPaymentDetails = (payment: Payment) => {
    setPaymentDetails(payment);
    const relatedOrder = orders.find(order => order.id === payment.order_id);
    if (relatedOrder) {
      setOrderDetails(relatedOrder);
    }
    setDetailsVisible(true);
    setActiveTab('2'); // Переключаемся на вкладку платежей
  };
  
  // Открытие окна редактирования платежа
  const showEditPayment = (payment: Payment) => {
    setPaymentDetails(payment);
    paymentForm.setFieldsValue({
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      transaction_id: payment.transaction_id,
      amount: payment.amount,
      payer_name: payment.payer_name,
      payer_email: payment.payer_email,
      payment_details: payment.payment_details
    });
    setPaymentEditVisible(true);
  };
  
  // Открытие окна создания нового платежа
  const showNewPayment = (orderId?: number) => {
    paymentForm.resetFields();
    if (orderId) {
      paymentForm.setFieldsValue({
        order_id: orderId
      });
    }
    setNewPaymentVisible(true);
  };
  
  // Обновление статуса заказа через API
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/orders/${id}/status`, { status });
      notification.success({
        message: 'Статус обновлен',
        description: `Статус заказа №${id} изменен на "${getStatusText(status)}"`
      });
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус заказа'
      });
    }
  };
  
  // Обработчик изменения статуса платежа
  const updatePaymentStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/payments/${id}/status`, { payment_status: status });
      notification.success({
        message: 'Статус платежа обновлен',
        description: `Статус платежа №${id} изменен на "${getPaymentStatusText(status)}"`
      });
      fetchPayments(); // Обновляем список платежей
    } catch (error) {
      console.error('Ошибка при обновлении статуса платежа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус платежа'
      });
    }
  };
  
  // Сохранение изменений заказа
  const handleSaveChanges = async (values: any) => {
    if (!orderDetails?.id) return;
    
    try {
      await axios.patch(`${API_BASE_URL}/orders/${orderDetails.id}`, values);
      notification.success({
        message: 'Заказ обновлен',
        description: `Заказ №${orderDetails.id} успешно обновлен`
      });
      setEditVisible(false);
      fetchOrders(); // Обновляем данные
      // Обновляем детали текущего заказа
      const updatedOrder = {...orderDetails, ...values};
      setOrderDetails(updatedOrder);
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные заказа'
      });
    }
  };
  
  // Сохранение изменений платежа
  const handleSavePaymentChanges = async (values: any) => {
    if (!paymentDetails?.id) return;
    
    try {
      await axios.patch(`${API_BASE_URL}/api/payments/${paymentDetails.id}`, values);
      notification.success({
        message: 'Платеж обновлен',
        description: `Платеж №${paymentDetails.id} успешно обновлен`
      });
      setPaymentEditVisible(false);
      fetchPayments(); // Обновляем данные платежей
      // Обновляем детали текущего платежа
      const updatedPayment = {...paymentDetails, ...values};
      setPaymentDetails(updatedPayment);
    } catch (error) {
      console.error('Ошибка при обновлении платежа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные платежа'
      });
    }
  };
  
  // Создание нового платежа
  const handleCreatePayment = async (values: any) => {
    try {
      // Добавляем дату создания
      const newPayment = {
        ...values,
        created_at: new Date().toISOString()
      };
      
      await axios.post(`${API_BASE_URL}/api/payments`, newPayment);
      notification.success({
        message: 'Платеж создан',
        description: `Новый платеж для заказа №${newPayment.order_id} успешно создан`
      });
      setNewPaymentVisible(false);
      fetchPayments(); // Обновляем данные платежей
      
      // Если был выбран конкретный заказ, обновляем его детали
      if (orderDetails && orderDetails.id === newPayment.order_id) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      notification.error({
        message: 'Ошибка при создании',
        description: 'Не удалось создать новый платеж'
      });
    }
  };
  
  // Печать информации о заказе
  const printOrderDetails = async (orderId: number) => {
    setPrintLoading(true);
    try {
      // Получаем детали заказа, если они еще не загружены
      let order = orders.find(o => o.id === orderId);
      if (!order) {
        const orderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
        order = orderResponse.data;
      }
      
      if (!order) {
        throw new Error('Заказ не найден');
      }
      
      // Получаем все платежи для этого заказа
      const orderPayments = payments.filter(p => p.order_id === orderId);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Не удалось открыть окно печати');
      }
      
      // Генерация содержимого для печати на основе данных
      const printContent = `
        <html>
        <head>
          <title>Заказ №${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 10px; text-align: right; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Заказ №${order.id}</h1>
          <div class="section">
            <h2>Информация о заказе</h2>
            <p><strong>Дата создания:</strong> ${formatDate(order.created_at)}</p>
            <p><strong>Статус:</strong> ${getStatusText(order.status)}</p>
            <p><strong>Клиент:</strong> ${order.client_name || 'Не указан'}</p>
            <p><strong>ID клиента:</strong> ${order.user_id}</p>
            <p><strong>Телефон:</strong> ${order.contact_phone || 'Не указан'}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address || 'Не указан'}</p>
          </div>
          
          <div class="section">
            <h2>Товары в заказе</h2>
            <table>
              <thead>
                <tr>
                  <th>ID товара</th>
                  <th>Название</th>
                  <th>Количество</th>
                  <th>Цена за ед.</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${(order.order_items || []).map((item: any) => `
                  <tr>
                    <td>${item.product_id}</td>
                    <td>${item.name || item.product_name || `Товар #${item.product_id}`}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.price)}</td>
                    <td>${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">Итого: ${formatPrice(order.total_price)}</div>
          </div>
          
          <div class="section">
            <h2>Платежи</h2>
            <table>
              <thead>
                <tr>
                  <th>ID платежа</th>
                  <th>Способ оплаты</th>
                  <th>Статус</th>
                  <th>ID транзакции</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                ${orderPayments.map((payment: any) => `
                  <tr>
                    <td>${payment.id}</td>
                    <td>${getPaymentMethodText(payment.payment_method)}</td>
                    <td>${getPaymentStatusText(payment.payment_status)}</td>
                    <td>${payment.transaction_id || '-'}</td>
                    <td>${formatPrice(payment.amount || order.total_price)}</td>
                    <td>${formatDate(payment.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Документ сформирован ${CURRENT_DATE}</p>
            <p>Оператор: ${CURRENT_USER}</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Ошибка при печати заказа:', error);
      notification.error({
        message: 'Ошибка печати',
        description: error instanceof Error ? error.message : 'Не удалось распечатать информацию о заказе'
      });
    } finally {
      setPrintLoading(false);
    }
  };
  
  // Печать информации о платеже
  const printPaymentDetails = async (paymentId: number) => {
    setPaymentPrintLoading(true);
    try {
      // Получаем детали платежа
      let payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        const paymentResponse = await axios.get(`${API_BASE_URL}/api/payments/${paymentId}`);
        payment = paymentResponse.data;
      }
      
      if (!payment) {
        throw new Error('Платеж не найден');
      }
      
      // Получаем информацию о заказе
      let order = orders.find(o => o.id === payment.order_id);
      if (!order && payment.order_id) {
        try {
          const orderResponse = await axios.get(`${API_BASE_URL}/orders/${payment.order_id}`);
          order = orderResponse.data;
        } catch (e) {
          console.log('Ошибка при получении информации о заказе:', e);
        }
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Не удалось открыть окно печати');
      }
      
      // Генерация содержимого для печати на основе данных
      const printContent = `
        <html>
        <head>
          <title>Платеж №${payment.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; }
            .receipt-header { text-align: center; margin-bottom: 30px; }
            .receipt-number { font-size: 14px; margin-bottom: 5px; }
            .receipt-data { margin-bottom: 20px; }
            .receipt-data table { border: none; }
            .receipt-data td { border: none; padding: 5px 0; }
            .receipt-total { text-align: right; font-weight: bold; margin: 20px 0; }
            .receipt-signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .receipt-signature div { width: 45%; }
            .receipt-line { border-bottom: 1px solid #000; height: 30px; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>Квитанция об оплате</h1>
            <div class="receipt-number">№ ${payment.id}</div>
            <div>от ${formatDate(payment.created_at)}</div>
          </div>
          
          <div class="receipt-data">
            <table>
              <tr>
                <td width="40%"><strong>Номер платежа:</strong></td>
                <td>${payment.id}</td>
              </tr>
              <tr>
                <td><strong>Номер заказа:</strong></td>
                <td>${payment.order_id}</td>
              </tr>
              <tr>
                <td><strong>Метод оплаты:</strong></td>
                <td>${getPaymentMethodText(payment.payment_method)}</td>
              </tr>
              <tr>
                <td><strong>Статус платежа:</strong></td>
                <td>${getPaymentStatusText(payment.payment_status)}</td>
              </tr>
              <tr>
                <td><strong>ID транзакции:</strong></td>
                <td>${payment.transaction_id || '-'}</td>
              </tr>
              <tr>
                <td><strong>Плательщик:</strong></td>
                <td>${payment.payer_name || (order ? order.client_name : '-') || '-'}</td>
              </tr>
              <tr>
                <td><strong>Email плательщика:</strong></td>
                <td>${payment.payer_email || '-'}</td>
              </tr>
              <tr>
                <td><strong>Дата платежа:</strong></td>
                <td>${formatDate(payment.created_at)}</td>
              </tr>
              ${payment.updated_at ? `
              <tr>
                <td><strong>Дата обновления:</strong></td>
                <td>${formatDate(payment.updated_at)}</td>
              </tr>
              ` : ''}
              <tr>
                <td><strong>Детали платежа:</strong></td>
                <td>${payment.payment_details || '-'}</td>
              </tr>
            </table>
          </div>
          
          <div class="receipt-total">
            Сумма платежа: ${formatPrice(payment.amount || (order ? order.total_price : 0))}
          </div>
          
          ${order ? `
          <div class="section">
            <h2>Информация о заказе</h2>
            <table>
              <tr>
                <td width="40%"><strong>Номер заказа:</strong></td>
                <td>${order.id}</td>
              </tr>
              <tr>
                <td><strong>Клиент:</strong></td>
                <td>${order.client_name || 'Не указан'}</td>
              </tr>
              <tr>
                <td><strong>Статус заказа:</strong></td>
                <td>${getStatusText(order.status)}</td>
              </tr>
              <tr>
                <td><strong>Дата создания:</strong></td>
                <td>${formatDate(order.created_at)}</td>
              </tr>
              <tr>
                <td><strong>Общая сумма заказа:</strong></td>
                <td>${formatPrice(order.total_price)}</td>
              </tr>
            </table>
          </div>
          ` : ''}
          
          <div class="receipt-signature">
            <div>
              <p>Подпись плательщика</p>
              <div class="receipt-line"></div>
            </div>
            <div>
              <p>Подпись получателя</p>
              <div class="receipt-line"></div>
            </div>
          </div>
          
          <div class="footer">
            <p>Документ сформирован ${CURRENT_DATE}</p>
            <p>Оператор: ${CURRENT_USER}</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Ошибка при печати платежа:', error);
      notification.error({
        message: 'Ошибка печати',
        description: error instanceof Error ? error.message : 'Не удалось распечатать информацию о платеже'
      });
    } finally {
      setPaymentPrintLoading(false);
    }
  };
  
  // Вспомогательные функции для форматирования данных
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD.MM.YYYY HH:mm');
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case DeliveryStatus.PENDING: return 'Ожидает обработки';
      case DeliveryStatus.PROCESSING: return 'В обработке';
      case DeliveryStatus.SHIPPED: return 'Отправлен';
      case DeliveryStatus.DELIVERED: return 'Доставлен';
      case DeliveryStatus.CANCELLED: return 'Отменен';
      default: return status || '-';
    }
  };
  
  const getPaymentStatusText = (status: string): string => {
    switch (status) {
      case PaymentStatus.PENDING: return 'Ожидает оплаты';
      case PaymentStatus.PROCESSING: return 'В обработке';
      case PaymentStatus.COMPLETED: return 'Завершен';
      case PaymentStatus.REFUNDED: return 'Возвращен';
      case PaymentStatus.FAILED: return 'Не удался';
      case PaymentStatus.CANCELLED: return 'Отменен';
      default: return status || '-';
    }
  };
  
  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case PaymentMethod.ONLINE_CARD: return 'Онлайн картой';
      case PaymentMethod.SBP: return 'СБП';
      case PaymentMethod.CASH: return 'Наличными';
      case PaymentMethod.CASH_ON_DELIVERY: return 'Наложенный платеж';
      case PaymentMethod.ONLINE_WALLET: return 'Электронный кошелек';
      case PaymentMethod.BANK_TRANSFER: return 'Банковский перевод';
      case PaymentMethod.CREDIT_CARD: return 'Кредитная карта';
      default: return method || '-';
    }
  };
  
  // Получение платежей для конкретного заказа
  const getOrderPayments = (orderId: number): Payment[] => {
    return payments.filter(payment => payment.order_id === orderId);
  };
  
  // Получение суммы всех платежей для заказа
  const getOrderTotalPaid = (orderId: number): number => {
    return getOrderPayments(orderId)
      .filter(p => p.payment_status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };
  
  // Определение, полностью ли оплачен заказ
  const isOrderFullyPaid = (order: Order): boolean => {
    const totalPaid = getOrderTotalPaid(order.id);
    return totalPaid >= order.total_price;
  };
  
  // Колонки для таблицы заказов
  const orderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: Order, b: Order) => a.id - b.id
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Клиент',
      dataIndex: 'client_name',
      key: 'client_name',
      render: (text: string, record: Order) => text || `Клиент #${record.user_id}`
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => <OrderStatusBadge status={status} />
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 140,
      render: (price: number) => formatPrice(price)
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record: Order) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showOrderDetails(record)}
            title="Просмотр деталей"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditOrder(record)}
            title="Редактировать"
          />
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => printOrderDetails(record.id)}
            loading={printLoading}
            title="Печать"
          />
        </Space>
      )
    }
  ];
  
  // Колонки для таблицы платежей
  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: Payment, b: Payment) => a.id - b.id
    },
    {
      title: 'ID заказа',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Метод оплаты',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 160,
      render: (method: string) => getPaymentMethodText(method)
    },
    {
      title: 'Статус',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 140,
      render: (status: string) => {
        let color = 'default';
        let icon = null;
        
        switch (status) {
          case PaymentStatus.COMPLETED:
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case PaymentStatus.PENDING:
            color = 'warning';
            break;
          case PaymentStatus.PROCESSING:
            color = 'processing';
            break;
          case PaymentStatus.REFUNDED:
            color = 'cyan';
            break;
          case PaymentStatus.FAILED:
          case PaymentStatus.CANCELLED:
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
        }
        
        return <Tag color={color} icon={icon}>{getPaymentStatusText(status)}</Tag>;
      }
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (amount: number, record: Payment) => {
        // Если сумма не указана явно, используем сумму заказа
        const relatedOrder = orders.find(o => o.id === record.order_id);
        const displayAmount = amount || (relatedOrder ? relatedOrder.total_price : 0);
        return formatPrice(displayAmount);
      }
    },
    {
      title: 'ID транзакции',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (text: string) => text || '-'
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record: Payment) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showPaymentDetails(record)}
            title="Просмотр деталей"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditPayment(record)}
            title="Редактировать"
          />
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => printPaymentDetails(record.id)}
            loading={paymentPrintLoading}
            title="Печать"
          />
          {/* Кнопки для изменения статуса платежа */}
          {record.payment_status === PaymentStatus.PENDING && (
            <Button 
              type="primary"
              size="small"
              onClick={() => updatePaymentStatus(record.id, PaymentStatus.COMPLETED)}
              title="Подтвердить платеж"
            >
              Подтвердить
            </Button>
          )}
        </Space>
      )
    }
  ];
  
  // Колонки для таблицы платежей в деталях заказа
  const orderPaymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Метод оплаты',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 160,
      render: (method: string) => getPaymentMethodText(method)
    },
    {
      title: 'Статус',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 140,
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case PaymentStatus.COMPLETED: color = 'success'; break;
          case PaymentStatus.PENDING: color = 'warning'; break;
          case PaymentStatus.PROCESSING: color = 'processing'; break;
          case PaymentStatus.REFUNDED: color = 'cyan'; break;
          case PaymentStatus.FAILED:
          case PaymentStatus.CANCELLED: color = 'error'; break;
        }
        return <Tag color={color}>{getPaymentStatusText(status)}</Tag>;
      }
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (amount: number) => formatPrice(amount || (orderDetails ? orderDetails.total_price : 0))
    },
    {
      title: 'ID транзакции',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (text: string) => text || '-'
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record: Payment) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditPayment(record)}
            size="small"
            title="Редактировать"
          />
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => printPaymentDetails(record.id)}
            size="small"
            loading={paymentPrintLoading}
            title="Печать"
          />
        </Space>
      )
    }
  ];
  
  return (
    <div className="payments-page">
      <Title level={2}>Управление заказами и платежами</Title>

      {error && (
          <div className="error-message">
            <Alert message="Ошибка" description={error} type="error" showIcon closable />
          </div>
      )}
      
      <Tabs defaultActiveKey="1" onChange={setActiveTab} activeKey={activeTab}>
        {/* Вкладка с заказами */}
        <TabPane tab="Заказы" key="1">
          <Card className="filter-card">
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input 
                  placeholder="Поиск по ID, клиенту или номеру отслеживания" 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                  prefix={<SearchOutlined />} 
                />
              </Col>
              <Col span={4}>
                <Select 
                  placeholder="Статус заказа"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                >
                  <Option value="pending">Ожидает обработки</Option>
                  <Option value="processing">В обработке</Option>
                  <Option value="shipped">Отправлен</Option>
                  <Option value="delivered">Доставлен</Option>
                  <Option value="cancelled">Отменен</Option>
                </Select>
              </Col>
              <Col span={6}>
                <RangePicker 
                  style={{ width: '100%' }}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  format="DD.MM.YYYY"
                  placeholder={['Дата от', 'Дата до']}
                />
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    icon={<FilterOutlined />} 
                    onClick={clearFilters}
                    title="Сбросить все фильтры"
                  >
                    Сбросить
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchOrders}
                    title="Обновить данные"
                  >
                    Обновить
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<ExportOutlined />}
                    title="Экспорт в Excel"
                  >
                    Экспорт
                  </Button>
                  <Button
                    icon={sortByDate === 'asc' ? <SyncOutlined /> : <SyncOutlined rotate={180} />}
                    onClick={toggleSortDirection}
                    title={sortByDate === 'asc' ? 'Сортировать по убыванию' : 'Сортировать по возрастанию'}
                  >
                    {sortByDate === 'asc' ? 'По возрастанию' : 'По убыванию'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Card>
            <Table 
              dataSource={filteredOrders} 
              columns={orderColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Всего ${total} записей` }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>
        
        {/* Вкладка с платежами */}
        <TabPane tab="Платежи" key="2">
          <Card className="filter-card">
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input 
                  placeholder="Поиск по ID платежа, ID заказа или ID транзакции" 
                  value={paymentSearchText} 
                  onChange={(e) => setPaymentSearchText(e.target.value)} 
                  prefix={<SearchOutlined />} 
                />
              </Col>
              <Col span={4}>
                <Select 
                  placeholder="Статус платежа"
                  style={{ width: '100%' }}
                  value={paymentStatusFilter}
                  onChange={setPaymentStatusFilter}
                  allowClear
                >
                  <Option value="pending">Ожидает оплаты</Option>
                  <Option value="processing">В обработке</Option>
                  <Option value="completed">Завершен</Option>
                  <Option value="refunded">Возвращен</Option>
                  <Option value="failed">Не удался</Option>
                  <Option value="cancelled">Отменен</Option>
                </Select>
              </Col>
              <Col span={6}>
                <RangePicker 
                  style={{ width: '100%' }}
                  onChange={(dates) => setPaymentDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  format="DD.MM.YYYY"
                  placeholder={['Дата от', 'Дата до']}
                />
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    icon={<FilterOutlined />} 
                    onClick={clearPaymentFilters}
                    title="Сбросить все фильтры"
                  >
                    Сбросить
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchPayments}
                    title="Обновить данные"
                  >
                    Обновить
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => showNewPayment()}
                    title="Создать новый платеж"
                  >
                    Новый платеж
                  </Button>
                  <Button
                    icon={paymentSortByDate === 'asc' ? <SyncOutlined /> : <SyncOutlined rotate={180} />}
                    onClick={togglePaymentSortDirection}
                    title={paymentSortByDate === 'asc' ? 'Сортировать по убыванию' : 'Сортировать по возрастанию'}
                  >
                    {paymentSortByDate === 'asc' ? 'По возрастанию' : 'По убыванию'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Card>
            <Table 
              dataSource={filteredPayments} 
              columns={paymentColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Всего ${total} записей` }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Модальное окно с деталями заказа */}
      <Drawer
        title={`Заказ №${orderDetails?.id || ''}`}
        width={700}
        onClose={() => setDetailsVisible(false)}
        visible={detailsVisible}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                setDetailsVisible(false);
                if (orderDetails) showEditOrder(orderDetails);
              }}
            >
              Редактировать
            </Button>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => orderDetails && printOrderDetails(orderDetails.id)}
              loading={printLoading}
            >
              Печать
            </Button>
          </Space>
        }
      >
        {orderDetails && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Информация о заказе" key="1">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Общая информация" size="small">
                    <p><strong>ID заказа:</strong> {orderDetails.id}</p>
                    <p><strong>Дата создания:</strong> {formatDate(orderDetails.created_at)}</p>
                    <p><strong>Статус:</strong> <OrderStatusBadge status={orderDetails.status} /></p>
                    <p><strong>Клиент:</strong> {orderDetails.client_name || '-'}</p>
                    <p><strong>ID клиента:</strong> {orderDetails.user_id}</p>
                    <p><strong>Сумма заказа:</strong> {formatPrice(orderDetails.total_price)}</p>
                    <p>
                      <strong>Статус оплаты:</strong>{' '}
                      {isOrderFullyPaid(orderDetails) ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>Оплачен</Tag>
                      ) : getOrderPayments(orderDetails.id).length > 0 ? (
                        <Tag color="warning">Частично оплачен</Tag>
                      ) : (
                        <Tag color="error" icon={<CloseCircleOutlined />}>Не оплачен</Tag>
                      )}
                    </p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Информация о доставке" size="small">
                    <p><strong>Адрес доставки:</strong> {orderDetails.delivery_address || '-'}</p>
                    <p><strong>Трекинг-номер:</strong> {orderDetails.tracking_number || '-'}</p>
                    <p><strong>Статус доставки:</strong> {orderDetails.delivery_status ? getStatusText(orderDetails.delivery_status) : '-'}</p>
                    <p><strong>Курьер:</strong> {orderDetails.courier_name || '-'}</p>
                    <p><strong>Планируемая доставка:</strong> {formatDate(orderDetails.estimated_delivery)}</p>
                    <p><strong>Фактическая доставка:</strong> {formatDate(orderDetails.actual_delivery)}</p>
                    <p><strong>Примечания:</strong> {orderDetails.delivery_notes || '-'}</p>
                  </Card>
                  
                  <div style={{ marginTop: '16px' }}>
                    <Space>
                      <Button 
                        type={orderDetails.status === 'pending' ? 'primary' : 'default'} 
                        onClick={() => updateOrderStatus(orderDetails.id, 'processing')}
                        disabled={orderDetails.status === 'cancelled' || orderDetails.status === 'delivered'}
                      >
                        В обработку
                      </Button>
                      <Button 
                        type={orderDetails.status === 'processing' ? 'primary' : 'default'}
                        onClick={() => updateOrderStatus(orderDetails.id, 'shipped')}
                        disabled={orderDetails.status === 'cancelled' || orderDetails.status === 'delivered' || orderDetails.status === 'pending'}
                      >
                        Отправить
                      </Button>
                      <Button 
                        type={orderDetails.status === 'shipped' ? 'primary' : 'default'}
                        onClick={() => updateOrderStatus(orderDetails.id, 'delivered')}
                        disabled={orderDetails.status === 'cancelled' || orderDetails.status === 'delivered' || orderDetails.status === 'pending'}
                      >
                        Доставлен
                      </Button>
                      <Button 
                        danger
                        onClick={() => updateOrderStatus(orderDetails.id, 'cancelled')}
                        disabled={orderDetails.status === 'cancelled' || orderDetails.status === 'delivered'}
                      >
                        Отменить
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
              
              <Divider orientation="left">Товары в заказе</Divider>
              <OrderItemsTable items={orderDetails.order_items || []} />
              
              <Divider orientation="left">Платежи по заказу</Divider>
              <div style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showNewPayment(orderDetails.id)}
                >
                  Добавить платеж
                </Button>
              </div>
              <Table 
                dataSource={getOrderPayments(orderDetails.id)} 
                columns={orderPaymentColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
              
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <p><strong>Сумма заказа:</strong> {formatPrice(orderDetails.total_price)}</p>
                <p><strong>Оплачено:</strong> {formatPrice(getOrderTotalPaid(orderDetails.id))}</p>
                <p><strong>Осталось оплатить:</strong> {formatPrice(Math.max(0, orderDetails.total_price - getOrderTotalPaid(orderDetails.id)))}</p>
              </div>
            </TabPane>
            
            <TabPane tab="История изменений" key="2">
              <p>История изменений статуса заказа будет отображаться здесь.</p>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
      
      {/* Модальное окно редактирования заказа */}
      <Drawer
        title={`Редактирование заказа №${orderDetails?.id || ''}`}
        width={600}
        onClose={() => setEditVisible(false)}
        visible={editVisible}
        extra={
          <Button 
            type="primary" 
            onClick={() => editForm.submit()}
          >
            Сохранить
          </Button>
        }
      >
        <Form 
          form={editForm}
          layout="vertical"
          onFinish={handleSaveChanges}
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
              <Option value="delivered">Доставлен</Option>
              <Option value="cancelled">Отменен</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="delivery_status"
            label="Статус доставки"
          >
            <Select allowClear>
              <Option value="preparing">Подготовка</Option>
              <Option value="in_transit">В пути</Option>
              <Option value="delivered">Доставлен</Option>
              <Option value="failed">Не удалась</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tracking_number"
            label="Трекинг-номер"
          >
            <Input placeholder="Введите трекинг-номер" />
          </Form.Item>
          
          <Form.Item
            name="courier_name"
            label="Курьер"
          >
            <Input placeholder="Имя курьера" />
          </Form.Item>
          
          <Form.Item
            name="estimated_delivery"
            label="Планируемая доставка"
          >
            <DatePicker 
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="delivery_notes"
            label="Примечания к доставке"
          >
            <Input.TextArea rows={4} placeholder="Дополнительная информация о доставке" />
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Модальное окно редактирования платежа */}
      <Drawer
        title={`Редактирование платежа №${paymentDetails?.id || ''}`}
        width={600}
        onClose={() => setPaymentEditVisible(false)}
        visible={paymentEditVisible}
        extra={
          <Button 
            type="primary" 
            onClick={() => paymentForm.submit()}
          >
            Сохранить
          </Button>
        }
      >
        <Form 
          form={paymentForm}
          layout="vertical"
          onFinish={handleSavePaymentChanges}
        >
          <Form.Item
            name="payment_method"
            label="Метод оплаты"
            rules={[{ required: true, message: 'Выберите метод оплаты' }]}
          >
            <Select>
              <Option value="online_card">Онлайн картой</Option>
              <Option value="sbp">СБП</Option>
              <Option value="cash">Наличными</Option>
              <Option value="cash_on_delivery">Наложенный платеж</Option>
              <Option value="online_wallet">Электронный кошелек</Option>
              <Option value="bank_transfer">Банковский перевод</Option>
              <Option value="credit_card">Кредитная карта</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_status"
            label="Статус платежа"
            rules={[{ required: true, message: 'Выберите статус платежа' }]}
          >
            <Select>
              <Option value="pending">Ожидает оплаты</Option>
              <Option value="processing">В обработке</Option>
              <Option value="completed">Завершен</Option>
              <Option value="refunded">Возвращен</Option>
              <Option value="failed">Не удался</Option>
              <Option value="cancelled">Отменен</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Сумма платежа"
            rules={[{ required: true, message: 'Введите сумму платежа' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              formatter={value => `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₽\s?|(,*)/g, '')}
              placeholder="Введите сумму платежа"
            />
          </Form.Item>
          
          <Form.Item
            name="transaction_id"
            label="ID транзакции"
          >
            <Input placeholder="Идентификатор транзакции платежной системы" />
          </Form.Item>
          
          <Form.Item
            name="payer_name"
            label="Имя плательщика"
          >
            <Input placeholder="Имя плательщика" />
          </Form.Item>
          
          <Form.Item
            name="payer_email"
            label="Email плательщика"
          >
            <Input placeholder="Email плательщика" type="email" />
          </Form.Item>
          
          <Form.Item
            name="payment_details"
            label="Детали платежа"
          >
            <Input.TextArea rows={4} placeholder="Дополнительная информация о платеже" />
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Модальное окно создания нового платежа */}
      <Drawer
        title="Создание нового платежа"
        width={600}
        onClose={() => setNewPaymentVisible(false)}
        visible={newPaymentVisible}
        extra={
          <Button 
            type="primary" 
            onClick={() => paymentForm.submit()}
          >
            Создать
          </Button>
        }
      >
        <Form 
          form={paymentForm}
          layout="vertical"
          onFinish={handleCreatePayment}
          initialValues={{
            payment_status: 'completed',
            payment_method: 'online_card'
          }}
        >
          <Form.Item
            name="order_id"
            label="ID заказа (необязательно)"
            tooltip="Оставьте пустым для создания расходного платежа, не связанного с заказом"
          >
            <InputNumber 
              style={{ width: '100%' }}
              placeholder="Введите ID заказа или оставьте пустым"
            />
          </Form.Item>
          
          <Form.Item
            name="payment_type"
            label="Тип платежа"
            initialValue="income"
            rules={[{ required: true, message: 'Выберите тип платежа' }]}
          >
            <Select>
              <Option value="income">Доход (оплата заказа)</Option>
              <Option value="expense">Расход (затраты компании)</Option>
              <Option value="refund">Возврат</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_category"
            label="Категория платежа"
          >
            <Select allowClear>
              <Option value="order_payment">Оплата заказа</Option>
              <Option value="salary">Зарплата</Option>
              <Option value="rent">Аренда</Option>
              <Option value="utilities">Коммунальные платежи</Option>
              <Option value="supplies">Закупка материалов</Option>
              <Option value="marketing">Маркетинг и реклама</Option>
              <Option value="shipping">Доставка</Option>
              <Option value="tax">Налоги</Option>
              <Option value="other">Другое</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_method"
            label="Метод оплаты"
            rules={[{ required: true, message: 'Выберите метод оплаты' }]}
          >
            <Select>
              <Option value="online_card">Онлайн картой</Option>
              <Option value="sbp">СБП</Option>
              <Option value="cash">Наличными</Option>
              <Option value="cash_on_delivery">Наложенный платеж</Option>
              <Option value="online_wallet">Электронный кошелек</Option>
              <Option value="bank_transfer">Банковский перевод</Option>
              <Option value="credit_card">Кредитная карта</Option>
              <Option value="company_account">Счет компании</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_status"
            label="Статус платежа"
            rules={[{ required: true, message: 'Выберите статус платежа' }]}
          >
            <Select>
              <Option value="pending">Ожидает оплаты</Option>
              <Option value="processing">В обработке</Option>
              <Option value="completed">Завершен</Option>
              <Option value="refunded">Возвращен</Option>
              <Option value="failed">Не удался</Option>
              <Option value="cancelled">Отменен</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму платежа' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              formatter={value => `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₽\s?|(,*)/g, '')}
              placeholder="Введите сумму платежа"
            />
          </Form.Item>
          
          <Form.Item
            name="transaction_id"
            label="ID транзакции"
          >
            <Input placeholder="Идентификатор транзакции платежной системы" />
          </Form.Item>
          
          <Form.Item
            name="payer_name"
            label="Имя плательщика/получателя"
          >
            <Input placeholder="Имя плательщика или получателя платежа" />
          </Form.Item>
          
          <Form.Item
            name="payer_email"
            label="Email плательщика/получателя"
          >
            <Input placeholder="Email плательщика или получателя" type="email" />
          </Form.Item>
          
          <Form.Item
            name="payment_details"
            label="Детали платежа"
          >
            <Input.TextArea rows={4} placeholder="Дополнительная информация о платеже" />
          </Form.Item>

          <Form.Item
            name="payment_receipt"
            label="Номер чека или квитанции"
          >
            <Input placeholder="Номер чека или квитанции" />
          </Form.Item>
          
          <Form.Item
            name="payment_date"
            label="Дата платежа"
            initialValue={dayjs()}
          >
            <DatePicker 
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Payments;