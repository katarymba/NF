import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, Tag, Button, Card, Select, Input, DatePicker, Typography, Space, Spin, Tooltip, Modal, Drawer, Form, notification, Row, Col, InputNumber, Tabs, Divider } from 'antd';
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

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Константы
const CURRENT_DATE = '2025-05-08 14:38:06';
const CURRENT_USER = 'katarymba';
const DB_API_URL = 'http://localhost:8001/db';

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
  REFUNDED = 'refunded'
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
  product_id: number;
  price: number;
  quantity: number;
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
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
}

// Вспомогательные функции
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2
  }).format(price);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD.MM.YYYY HH:mm');
};

const getStatusText = (status: string): string => {
  switch(status) {
    case DeliveryStatus.PENDING: return 'Ожидает обработки';
    case DeliveryStatus.PROCESSING: return 'В обработке';
    case DeliveryStatus.SHIPPED: return 'Отправлен';
    case DeliveryStatus.DELIVERED: return 'Доставлен';
    case DeliveryStatus.CANCELLED: return 'Отменен';
    default: return status || '-';
  }
};

const getPaymentMethodText = (method: string): string => {
  switch(method) {
    case PaymentMethod.ONLINE_CARD: return 'Онлайн картой';
    case PaymentMethod.SBP: return 'СБП';
    case PaymentMethod.CASH: return 'Наличными';
    case PaymentMethod.CASH_ON_DELIVERY: return 'Наложенный платеж';
    case PaymentMethod.ONLINE_WALLET: return 'Онлайн кошелек';
    case PaymentMethod.BANK_TRANSFER: return 'Банковский перевод';
    case PaymentMethod.CREDIT_CARD: return 'Кредитная карта';
    default: return method || '-';
  }
};

const getPaymentStatusText = (status: string): string => {
  switch(status) {
    case PaymentStatus.COMPLETED: return 'Выполнен';
    case PaymentStatus.PROCESSING: return 'В обработке';
    case PaymentStatus.PENDING: return 'Ожидает';
    case PaymentStatus.REFUNDED: return 'Возвращен';
    default: return status || '-';
  }
};

// Компонент
const Payments: React.FC = () => {
  // Состояние
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentEditVisible, setPaymentEditVisible] = useState<boolean>(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [editForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [syncingOrder, setSyncingOrder] = useState<number | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('payments');
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'loading'>('loading');

  // Проверка соединения с базой данных
  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setDbStatus('loading');
      const response = await axios.post(`${DB_API_URL}/execute`, {
        query: 'SELECT 1 as result',
        params: []
      });
      
      if (response.data && response.data.success) {
        setDbStatus('connected');
      } else {
        throw new Error('Не удалось выполнить тестовый запрос к базе данных');
      }
    } catch (err) {
      console.error('Ошибка подключения к базе данных:', err);
      setDbStatus('error');
      setError('Не удалось подключиться к базе данных PostgreSQL. Проверьте настройки подключения.');
    }
  };

  // Выполнение SQL-запроса в базе данных через API
  const executeSql = async (query: string, params: any[] = []) => {
    try {
      const response = await axios.post(`${DB_API_URL}/execute`, {
        query,
        params
      });
      
      if (response.data && response.data.success) {
        return response.data.results;
      } else {
        throw new Error(response.data.error || 'Ошибка выполнения SQL-запроса');
      }
    } catch (error) {
      console.error('Ошибка при выполнении SQL-запроса:', error);
      throw error;
    }
  };

  // Загрузка заказов напрямую из базы данных
  const fetchOrders = useCallback(async () => {
    if (dbStatus === 'error') {
      notification.error({
        message: 'Ошибка базы данных',
        description: 'Нет подключения к PostgreSQL. Данные не могут быть загружены.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Запрос к базе данных для получения заказов
      const query = `
        SELECT 
          id, user_id, total_price, created_at, status, 
          client_name, delivery_address, order_items,
          payment_method, tracking_number, courier_name,
          delivery_notes, estimated_delivery, actual_delivery,
          delivery_status
        FROM orders
        ORDER BY id DESC
      `;
      
      const results = await executeSql(query);
      
      // Преобразуем JSONB данные
      const formattedOrders = results.map((row: any) => ({
        ...row,
        order_items: typeof row.order_items === 'string' ? JSON.parse(row.order_items) : row.order_items
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Ошибка при получении заказов из базы данных:', error);
      setError('Не удалось получить данные заказов из PostgreSQL. Ошибка на стороне сервера.');
    } finally {
      setLoading(false);
    }
  }, [dbStatus]);

  // Загрузка платежей напрямую из базы данных
  const fetchPayments = useCallback(async () => {
    if (dbStatus === 'error') {
      return;
    }

    setPaymentsLoading(true);
    setError(null);
    
    try {
      // Запрос к базе данных для получения платежей
      const query = `
        SELECT 
          id, order_id, payment_method, payment_status,
          transaction_id, created_at
        FROM payments
        ORDER BY id DESC
      `;
      
      const results = await executeSql(query);
      setPayments(results);
    } catch (error) {
      console.error('Ошибка при получении платежей из базы данных:', error);
      setError('Не удалось получить данные платежей из PostgreSQL. Ошибка на стороне сервера.');
    } finally {
      setPaymentsLoading(false);
    }
  }, [dbStatus]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (dbStatus === 'connected') {
      fetchOrders();
      fetchPayments();
    }
  }, [fetchOrders, fetchPayments, dbStatus]);

  // Обновление статуса заказа - прямой SQL-запрос
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const query = 'UPDATE orders SET status = $1 WHERE id = $2';
      await executeSql(query, [status, id]);
      
      notification.success({
        message: 'Статус обновлен',
        description: `Статус заказа №${id} изменен на "${getStatusText(status)}" в базе данных`
      });
      
      fetchOrders(); // Обновляем список заказов из базы
    } catch (error) {
      console.error('Ошибка при обновлении статуса в базе данных:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус заказа в PostgreSQL'
      });
    }
  };

  // Синхронизация с Север-Рыбой через запись в отдельную таблицу БД
  const syncOrderWithSeverRyba = async (orderId: number) => {
    setSyncingOrder(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Заказ не найден в базе данных');
      }
      
      // Проверяем существование таблицы для очереди синхронизации
      await executeSql(`
        CREATE TABLE IF NOT EXISTS severryba_sync_queue (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id),
          sync_data JSONB NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'pending'
        )
      `);
      
      // Добавляем заказ в очередь синхронизации
      const syncData = {
        id: order.id,
        user_id: order.user_id,
        total_price: order.total_price,
        created_at: order.created_at,
        status: order.status,
        client_name: order.client_name,
        delivery_address: order.delivery_address,
        order_items: order.order_items
      };
      
      const insertQuery = 'INSERT INTO severryba_sync_queue (order_id, sync_data, created_at) VALUES ($1, $2, $3)';
      await executeSql(insertQuery, [orderId, JSON.stringify(syncData), CURRENT_DATE]);
      
      notification.success({
        message: 'Синхронизация с базой данных',
        description: `Заказ №${orderId} успешно добавлен в очередь синхронизации с Север-Рыбой в БД`
      });
    } catch (error) {
      console.error(`Ошибка при отправке заказа ${orderId} в очередь синхронизации:`, error);
      notification.error({
        message: 'Ошибка синхронизации',
        description: 'Не удалось добавить заказ в очередь синхронизации в базе данных'
      });
    } finally {
      setSyncingOrder(null);
    }
  };

  // UI обработчики
  const showOrderDetails = (order: Order) => {
    setOrderDetails(order);
    setDetailsVisible(true);
  };

  const showEditForm = (order: Order) => {
    setOrderDetails(order);
    editForm.setFieldsValue({
      status: order.status,
      delivery_address: order.delivery_address,
      contact_phone: order.contact_phone,
      delivery_notes: order.delivery_notes,
      tracking_number: order.tracking_number,
      courier_name: order.courier_name,
      estimated_delivery: order.estimated_delivery ? dayjs(order.estimated_delivery) : null
    });
    setEditVisible(true);
  };

  // Сохранение изменений заказа - прямой SQL-запрос UPDATE
  const handleSaveChanges = async (values: any) => {
    if (!orderDetails?.id) return;
    
    try {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      // Формируем SET часть запроса динамически
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      }
      
      if (updateFields.length === 0) return;
      
      updateValues.push(orderDetails.id);
      
      const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
      await executeSql(query, updateValues);
      
      notification.success({
        message: 'Заказ обновлен',
        description: `Заказ №${orderDetails.id} успешно обновлен в базе данных PostgreSQL`
      });
      
      setEditVisible(false);
      fetchOrders(); // Обновляем данные из базы
      
      const updatedOrder = {...orderDetails, ...values};
      setOrderDetails(updatedOrder);
    } catch (error) {
      console.error('Ошибка при обновлении заказа в базе данных:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные заказа в PostgreSQL'
      });
    }
  };

  // Создание нового платежа - прямой SQL-запрос INSERT
  const handleCreatePayment = async (values: any) => {
    try {
      const transactionId = values.transaction_id || `TXN${new Date().toISOString().replace(/[-:T.]/g, '')}`;
      
      const query = `
        INSERT INTO payments (order_id, payment_method, payment_status, transaction_id, created_at) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
      `;
      
      const results = await executeSql(query, [
        values.order_id, 
        values.payment_method, 
        'completed', 
        transactionId, 
        CURRENT_DATE
      ]);
      
      const newPaymentId = results[0].id;
      
      notification.success({
        message: 'Платеж добавлен',
        description: `Новый платеж №${newPaymentId} успешно создан в базе данных PostgreSQL`
      });
      
      paymentForm.resetFields();
      setPaymentModalVisible(false);
      
      // Обновляем списки данных из базы
      fetchPayments();
      fetchOrders();
    } catch (error) {
      console.error('Ошибка при создании платежа в базе данных:', error);
      notification.error({
        message: 'Ошибка создания платежа',
        description: 'Не удалось создать новый платеж в PostgreSQL'
      });
    }
  };

  // Редактирование платежа - прямой SQL-запрос UPDATE
  const handleEditPayment = async (values: any) => {
    if (!currentPayment?.id) return;
    
    try {
      const query = `
        UPDATE payments 
        SET payment_method = $1, payment_status = $2, transaction_id = $3 
        WHERE id = $4
      `;
      
      await executeSql(query, [
        values.payment_method, 
        values.status || 'completed', 
        values.transaction_id, 
        currentPayment.id
      ]);
      
      notification.success({
        message: 'Платеж обновлен',
        description: `Платеж №${currentPayment.id} успешно обновлен в базе данных PostgreSQL`
      });
      
      setPaymentEditVisible(false);
      fetchPayments(); // Обновляем данные из базы
    } catch (error) {
      console.error('Ошибка при обновлении платежа в базе данных:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные платежа в PostgreSQL'
      });
    }
  };

  // Удаление платежа - прямой SQL-запрос DELETE
  const handleDeletePayment = async (paymentId: number) => {
    try {
      const query = 'DELETE FROM payments WHERE id = $1';
      await executeSql(query, [paymentId]);
      
      notification.success({
        message: 'Платеж удален',
        description: `Платеж №${paymentId} успешно удален из базы данных PostgreSQL`
      });
      
      fetchPayments(); // Обновляем данные из базы
    } catch (error) {
      console.error('Ошибка при удалении платежа из базы данных:', error);
      notification.error({
        message: 'Ошибка удаления',
        description: 'Не удалось удалить платеж из PostgreSQL'
      });
    }
  };

  const showPaymentEditForm = (payment: Payment) => {
    setCurrentPayment(payment);
    paymentForm.setFieldsValue({
      payment_method: payment.payment_method,
      status: payment.payment_status,
      order_id: payment.order_id,
      transaction_id: payment.transaction_id
    });
    setPaymentEditVisible(true);
  };

  // Печать информации о заказе
  const printOrderDetails = async (orderId: number) => {
    setPrintLoading(true);
    try {
      // Получаем все детали о заказе непосредственно из базы данных
      const orderQuery = 'SELECT * FROM orders WHERE id = $1';
      const orderResults = await executeSql(orderQuery, [orderId]);
      
      if (orderResults.length === 0) {
        throw new Error('Заказ не найден в базе данных');
      }
      
      const order = {
        ...orderResults[0],
        order_items: typeof orderResults[0].order_items === 'string' 
          ? JSON.parse(orderResults[0].order_items) 
          : orderResults[0].order_items
      };
      
      // Получаем все платежи для этого заказа
      const paymentsQuery = 'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC';
      const orderPayments = await executeSql(paymentsQuery, [orderId]);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Не удалось открыть окно печати');
      }
      
      // Генерация содержимого для печати на основе данных из базы
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
            <h2>Информация о заказе из базы данных</h2>
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
                  <th>Количество</th>
                  <th>Цена за ед.</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${(order.order_items || []).map((item: any) => `
                  <tr>
                    <td>${item.product_id}</td>
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
            <h2>Платежи из базы данных</h2>
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
                ${orderPayments.map((payment: any) => `
                  <tr>
                    <td>${payment.id}</td>
                    <td>${getPaymentMethodText(payment.payment_method)}</td>
                    <td>${getPaymentStatusText(payment.payment_status)}</td>
                    <td>${payment.transaction_id || '-'}</td>
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
        description: error instanceof Error ? error.message : 'Не удалось распечатать информацию о заказе из базы данных'
      });
    } finally {
      setPrintLoading(false);
    }
  };

  // Экспорт в Excel - прямой SQL-запрос
  const exportToExcel = async () => {
    notification.info({
      message: 'Экспорт данных',
      description: 'Подготовка данных из PostgreSQL для экспорта в Excel...'
    });

    try {
      // Получаем все платежи из базы данных с инфо о заказах
      const query = `
        SELECT p.*, o.client_name, o.total_price
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        ORDER BY p.id DESC
      `;
      
      const allPayments = await executeSql(query);
      
      // Создаем CSV-файл с данными из БД
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID;ID заказа;Клиент;Сумма заказа;Способ оплаты;Статус;ID транзакции;Дата\n";
      
      allPayments.forEach((payment: any) => {
        csvContent += `${payment.id};`;
        csvContent += `${payment.order_id};`;
        csvContent += `${payment.client_name || ''};`;
        csvContent += `${payment.total_price || 0};`;
        csvContent += `${getPaymentMethodText(payment.payment_method)};`;
        csvContent += `${getPaymentStatusText(payment.payment_status)};`;
        csvContent += `${payment.transaction_id || ''};`;
        csvContent += `${formatDate(payment.created_at)}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notification.success({
        message: 'Экспорт выполнен',
        description: 'Данные платежей из PostgreSQL успешно экспортированы'
      });
    } catch (error) {
      console.error('Ошибка при экспорте данных из базы:', error);
      notification.error({
        message: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать данные из PostgreSQL'
      });
    }
  };

  // Фильтры
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setDateRange(null);
  };

  // Мемоизированные отфильтрованные данные для производительности
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Фильтр по поиску
      const searchMatch = !searchText || 
        order.id.toString().includes(searchText) || 
        (order.client_name && order.client_name.toLowerCase().includes(searchText.toLowerCase())) ||
        (order.tracking_number && order.tracking_number.includes(searchText));
      
      // Фильтр по статусу
      const statusMatch = !statusFilter || order.status === statusFilter;
      
      // Фильтр по диапазону дат
      let dateMatch = true;
      if (dateRange && dateRange[0] && dateRange[1] && order.created_at) {
        const orderDate = dayjs(order.created_at);
        dateMatch = orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
  }, [orders, searchText, statusFilter, dateRange]);

  // Мемоизированные отфильтрованные платежи для производительности
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Фильтр по поиску
      const searchMatch = !searchText || 
        payment.id.toString().includes(searchText) || 
        payment.order_id.toString().includes(searchText) ||
        (payment.transaction_id && payment.transaction_id.includes(searchText));
      
      // Фильтр по статусу
      const statusMatch = !statusFilter || payment.payment_status === statusFilter;
      
      // Фильтр по диапазону дат
      let dateMatch = true;
      if (dateRange && dateRange[0] && dateRange[1] && payment.created_at) {
        const paymentDate = dayjs(payment.created_at);
        dateMatch = paymentDate.isAfter(dateRange[0]) && paymentDate.isBefore(dateRange[1]);
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
  }, [payments, searchText, statusFilter, dateRange]);

  // Определения колонок таблицы
  const orderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Order, b: Order) => a.id - b.id,
      render: (id: number) => <Link to={`/orders/${id}`}>{id}</Link>,
    },
    {
      title: 'Клиент',
      dataIndex: 'client_name',
      key: 'client_name',
      render: (text: string, record: Order) => (
        <div>
          <div>{text || 'Клиент не указан'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.user_id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number) => formatPrice(price),
      sorter: (a: Order, b: Order) => a.total_price - b.total_price,
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
      sorter: (a: Order, b: Order) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <OrderStatusBadge status={status} />,
    },
    {
      title: 'Оплата',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string, record: Order) => {
        // Находим последний платеж для этого заказа
        const orderPayments = payments.filter(p => p.order_id === record.id);
        const latestPayment = orderPayments.length > 0 ? 
          orderPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : 
          null;
        
        return (
          <div>
            {latestPayment && (
              <Tag color={
                latestPayment.payment_status === 'completed' ? 'green' : 
                latestPayment.payment_status === 'processing' ? 'blue' : 
                latestPayment.payment_status === 'pending' ? 'orange' : 'default'
              }>
                {getPaymentStatusText(latestPayment.payment_status)}
              </Tag>
            )}
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {getPaymentMethodText(method)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: string, record: Order) => (
        <Space>
          <Tooltip title="Просмотр деталей">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              type="default" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => showEditForm(record)}
            />
          </Tooltip>
          <Tooltip title="Добавить платеж">
            <Button 
              type="default" 
              size="small" 
              icon={<DollarOutlined />} 
              onClick={() => {
                paymentForm.setFieldsValue({ order_id: record.id });
                setPaymentModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Печать">
            <Button 
              type="default" 
              size="small" 
              icon={<PrinterOutlined />} 
              onClick={() => printOrderDetails(record.id)}
              loading={printLoading}
            />
          </Tooltip>
          <Tooltip title="Отправить в Север-Рыбу">
            <Button 
              type="default" 
              size="small" 
              icon={<SyncOutlined spin={syncingOrder === record.id} />} 
              onClick={() => syncOrderWithSeverRyba(record.id)}
              loading={syncingOrder === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Payment, b: Payment) => a.id - b.id,
    },
    {
      title: 'ID заказа',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId: number) => (
        <Link to={`/orders/${orderId}`}>{orderId}</Link>
      ),
    },
    {
      title: 'Способ оплаты',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => <Tag>{getPaymentMethodText(method)}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'processing' ? 'blue' : 
          status === 'pending' ? 'orange' : 
          status === 'refunded' ? 'red' : 'default'
        }>
          {getPaymentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'ID транзакции',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (id: string) => id || <Text type="secondary">-</Text>,
    },
    {
      title: 'Создан',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
      sorter: (a: Payment, b: Payment) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: string, record: Payment) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button 
              type="default" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => showPaymentEditForm(record)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button 
              type="default" 
              danger
              size="small" 
              icon={<CloseCircleOutlined />} 
              onClick={() => Modal.confirm({
                title: 'Удаление платежа',
                content: `Вы уверены, что хотите удалить платеж №${record.id}?`,
                okText: 'Да, удалить',
                cancelText: 'Отмена',
                onOk: () => handleDeletePayment(record.id)
              })}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Элементы вкладок
  const tabItems = [
    {
      key: 'payments',
      label: 'Платежи',
      children: (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Space wrap>
              <Input 
                placeholder="Поиск по ID, заказу или транзакции" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Select 
                placeholder="Статус платежа" 
                style={{ width: 180 }} 
                onChange={(value) => setStatusFilter(value)}
                allowClear
              >
                <Option value="completed">Выполнен</Option>
                <Option value="processing">В обработке</Option>
                <Option value="pending">Ожидает</Option>
                <Option value="refunded">Возвращен</Option>
              </Select>
              <RangePicker 
                placeholder={['Дата с', 'Дата по']}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                value={dateRange}
              />
              <Button type="default" onClick={clearFilters} icon={<FilterOutlined />}>
                Сбросить фильтры
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  paymentForm.resetFields();
                  setPaymentModalVisible(true);
                }}
                disabled={dbStatus !== 'connected'}
              >
                Новый платеж
              </Button>
            </Space>
          </div>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Card type="inner" style={{ backgroundColor: '#FFFBE6', borderColor: '#FFD666' }}>
                <Space>
                  <Text type="warning">{error}</Text>
                </Space>
              </Card>
            </div>
          )}

          {dbStatus === 'error' && (
            <div style={{ marginBottom: '16px' }}>
              <Card type="inner" style={{ backgroundColor: '#FFF1F0', borderColor: '#FFA39E' }}>
                <Space>
                  <Text type="danger">Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу.</Text>
                </Space>
              </Card>
            </div>
          )}

          {(paymentsLoading || dbStatus === 'loading') && payments.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
              <Spin size="large" tip="Загрузка платежей из базы данных PostgreSQL..." />
            </div>
          ) : (
            <Table 
              dataSource={filteredPayments}
              columns={paymentColumns}
              rowKey="id"
              loading={paymentsLoading && payments.length > 0}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true, 
                showTotal: (total) => `Всего: ${total} платежей в базе данных`,
                pageSizeOptions: ['10', '20', '50']
              }}
              locale={{
                emptyText: dbStatus === 'error' ? 'Нет подключения к базе данных' : 'Нет данных в базе'
              }}
            />
          )}
        </>
      )
    },
    {
      key: 'orders',
      label: 'Заказы с платежами',
      children: (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Space wrap>
              <Input 
                placeholder="Поиск по ID, клиенту или транзакции" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Select 
                placeholder="Статус заказа" 
                style={{ width: 180 }} 
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value={DeliveryStatus.PENDING}>Ожидает обработки</Option>
                <Option value={DeliveryStatus.PROCESSING}>В обработке</Option>
                <Option value={DeliveryStatus.SHIPPED}>Отправлен</Option>
                <Option value={DeliveryStatus.DELIVERED}>Доставлен</Option>
                <Option value={DeliveryStatus.CANCELLED}>Отменен</Option>
              </Select>
              <RangePicker 
                placeholder={['Дата с', 'Дата по']}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                value={dateRange}
              />
              <Button type="default" onClick={clearFilters} icon={<FilterOutlined />}>
                Сбросить фильтры
              </Button>
            </Space>
          </div>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Card type="inner" style={{ backgroundColor: '#FFFBE6', borderColor: '#FFD666' }}>
                <Space>
                  <Text type="warning">{error}</Text>
                </Space>
              </Card>
            </div>
          )}

          {dbStatus === 'error' && (
            <div style={{ marginBottom: '16px' }}>
              <Card type="inner" style={{ backgroundColor: '#FFF1F0', borderColor: '#FFA39E' }}>
                <Space>
                  <Text type="danger">Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу.</Text>
                </Space>
              </Card>
            </div>
          )}

          {(loading || dbStatus === 'loading') && orders.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
              <Spin size="large" tip="Загрузка заказов из базы данных PostgreSQL..." />
            </div>
          ) : (
            <Table 
              dataSource={filteredOrders}
              columns={orderColumns}
              rowKey="id"
              loading={loading && orders.length > 0}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true, 
                showTotal: (total) => `Всего: ${total} заказов в базе данных`,
                pageSizeOptions: ['10', '20', '50']
              }}
              locale={{
                emptyText: dbStatus === 'error' ? 'Нет подключения к базе данных' : 'Нет данных в базе'
              }}
            />
          )}
        </>
      )
    }
  ];

  return (
    <div className="payments-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={3}>Управление платежами (Прямое подключение к PostgreSQL)</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                checkDatabaseConnection();
                if (dbStatus === 'connected') {
                  fetchOrders();
                  fetchPayments();
                }
              }}
              loading={loading || paymentsLoading || dbStatus === 'loading'}
            >
              Подключиться к БД
            </Button>
            <Button 
              type="default" 
              icon={<PlusOutlined />}
              onClick={() => {
                paymentForm.resetFields();
                setPaymentModalVisible(true);
              }}
              disabled={dbStatus !== 'connected'}
            >
              Новый платеж
            </Button>
            <Button 
              type="default" 
              icon={<ExportOutlined />} 
              onClick={exportToExcel}
              disabled={dbStatus !== 'connected' || payments.length === 0}
            >
              Экспорт из БД
            </Button>
          </Space>
        </div>

        {dbStatus === 'connected' && (
          <div style={{ marginBottom: '16px' }}>
            <Card type="inner" style={{ backgroundColor: '#F6FFED', borderColor: '#B7EB8F' }}>
              <Space>
                <Text type="success">Подключение к базе данных PostgreSQL установлено. Данные загружаются напрямую из БД.</Text>
              </Space>
            </Card>
          </div>
        )}

        <Tabs 
          activeKey={activeTabKey} 
          onChange={setActiveTabKey}
          type="card"
          className="payments-tabs"
          items={tabItems}
        />
      </Card>

      {/* Drawer с деталями заказа */}
      <Drawer
        title={`Детали заказа №${orderDetails?.id} из базы данных`}
        width={700}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        extra={
          <Space>
            <Button 
              onClick={() => printOrderDetails(orderDetails?.id || 0)}
              icon={<PrinterOutlined />}
              loading={printLoading}
              disabled={dbStatus !== 'connected'}
            >
              Печать
            </Button>
            <Button 
              type="primary" 
              onClick={() => orderDetails && showEditForm(orderDetails)}
              icon={<EditOutlined />}
              disabled={dbStatus !== 'connected'}
            >
              Редактировать
            </Button>
          </Space>
        }
      >
        {orderDetails && (
          <>
            <Card title="Основная информация" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Клиент:</strong> {orderDetails.client_name || 'Не указан'}</p>
                  <p><strong>ID пользователя:</strong> {orderDetails.user_id}</p>
                  <p><strong>Телефон:</strong> {orderDetails.contact_phone || 'Не указан'}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Дата создания:</strong> {formatDate(orderDetails.created_at)}</p>
                  <p><strong>Статус:</strong> <OrderStatusBadge status={orderDetails.status} /></p>
                  <p><strong>Сумма заказа:</strong> {formatPrice(orderDetails.total_price)}</p>
                </Col>
              </Row>
            </Card>
            
            <Card title="Информация о доставке" style={{ marginBottom: '16px' }}>
              <p><strong>Адрес доставки:</strong> {orderDetails.delivery_address || 'Не указан'}</p>
              <p><strong>Трек-номер:</strong> {orderDetails.tracking_number || 'Не присвоен'}</p>
              <p><strong>Курьер:</strong> {orderDetails.courier_name || 'Не назначен'}</p>
              <p><strong>Примечание к доставке:</strong> {orderDetails.delivery_notes || 'Нет'}</p>
              <p><strong>Ожидаемая дата доставки:</strong> {
                orderDetails.estimated_delivery ? formatDate(orderDetails.estimated_delivery) : 'Не определена'
              }</p>
              <p><strong>Фактическая доставка:</strong> {
                orderDetails.actual_delivery ? formatDate(orderDetails.actual_delivery) : 'Не доставлено'
              }</p>
            </Card>
            
            <Card title="Оплата из базы данных" style={{ marginBottom: '16px' }}>
              <p><strong>Способ оплаты:</strong> {getPaymentMethodText(orderDetails.payment_method || '')}</p>
              
              {/* Отображение связанных платежей */}
              <h4>Связанные платежи из базы данных:</h4>
              <Table 
                dataSource={payments.filter(p => p.order_id === orderDetails.id)}
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id' },
                  { title: 'Способ', dataIndex: 'payment_method', key: 'payment_method', 
                    render: (method) => getPaymentMethodText(method) },
                  { title: 'Дата', dataIndex: 'created_at', key: 'created_at', render: (date) => formatDate(date) },
                  { title: 'Статус', dataIndex: 'payment_status', key: 'payment_status', 
                    render: (status) => <Tag color={status === 'completed' ? 'green' : 'orange'}>{getPaymentStatusText(status)}</Tag> }
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginTop: '10px' }}
                onClick={() => {
                  paymentForm.setFieldsValue({ order_id: orderDetails.id });
                  setPaymentModalVisible(true);
                }}
                disabled={dbStatus !== 'connected'}
              >
                Добавить платеж к заказу
              </Button>
            </Card>
            
            <Card title="Товары в заказе из базы данных">
              <OrderItemsTable 
                items={orderDetails.order_items.map(item => ({
                  product_id: item.product_id,
                  product_name: `Товар #${item.product_id}`,
                  quantity: item.quantity,
                  price: item.price,
                }))}
                total={orderDetails.total_price}
              />
            </Card>
          </>
        )}
      </Drawer>

      {/* Форма редактирования заказа */}
      <Modal
        title={`Редактирование заказа №${orderDetails?.id} в базе данных`}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
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
              <Option value={DeliveryStatus.PENDING}>Ожидает обработки</Option>
              <Option value={DeliveryStatus.PROCESSING}>В обработке</Option>
              <Option value={DeliveryStatus.SHIPPED}>Отправлен</Option>
              <Option value={DeliveryStatus.DELIVERED}>Доставлен</Option>
              <Option value={DeliveryStatus.CANCELLED}>Отменен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="delivery_address"
            label="Адрес доставки"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Телефон для связи"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tracking_number"
            label="Трек-номер"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="courier_name"
            label="Курьер"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="estimated_delivery"
            label="Ожидаемая дата доставки"
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="delivery_notes"
            label="Примечание к доставке"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить в БД
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для создания/редактирования платежа */}
      <Modal
        title={paymentEditVisible ? "Редактирование платежа в базе данных" : "Создание нового платежа в базе данных"}
        open={paymentModalVisible || paymentEditVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setPaymentEditVisible(false);
        }}
        footer={null}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={paymentEditVisible ? handleEditPayment : handleCreatePayment}
        >
          <Form.Item
            name="payment_method"
            label="Способ оплаты"
            rules={[{ required: true, message: 'Выберите способ оплаты' }]}
          >
            <Select>
              <Option value="online_card">Онлайн картой</Option>
              <Option value="sbp">СБП</Option>
              <Option value="cash">Наличными</Option>
              <Option value="cash_on_delivery">Наложенный платеж</Option>
              <Option value="online_wallet">Онлайн кошелек</Option>
              <Option value="bank_transfer">Банковский перевод</Option>
              <Option value="credit_card">Кредитная карта</Option>
            </Select>
          </Form.Item>

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

          {paymentEditVisible && (
            <Form.Item
              name="status"
              label="Статус платежа"
              rules={[{ required: true, message: 'Выберите статус платежа' }]}
            >
              <Select>
                <Option value="completed">Выполнен</Option>
                <Option value="processing">В обработке</Option>
                <Option value="pending">Ожидает</Option>
                <Option value="refunded">Возвращен</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="transaction_id"
            label="ID транзакции"
          >
            <Input placeholder="Например: TXN2025050800XX" />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setPaymentModalVisible(false);
                setPaymentEditVisible(false);
              }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                {paymentEditVisible ? 'Обновить в БД' : 'Создать в БД'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payments;