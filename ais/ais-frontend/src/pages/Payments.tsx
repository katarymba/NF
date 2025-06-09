import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, Tag, Button, Card, Select, Input, DatePicker, Typography, Space, Spin, Tooltip, Modal, Drawer, Form, notification, Row, Col, InputNumber, Tabs, Divider, Alert } from 'antd';
import { 
  SearchOutlined, FilterOutlined, ReloadOutlined, EyeOutlined, EditOutlined, 
  SyncOutlined, PlusOutlined, PrinterOutlined, 
  CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import '../styles/Payments.css';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Константы
const CURRENT_DATE = '2025-05-28 17:09:48';
const CURRENT_USER = 'katarymba';
const API_BASE_URL = 'http://localhost:8001/api';

// Типы на основе схемы базы данных
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

interface Payment {
  id: number;
  order_id?: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
  amount?: number;
  payer_name?: string;
  payer_email?: string;
  payment_details?: string;
  updated_at?: string;
  client_name?: string;
}

// Компонент страницы Payments
const Payments: React.FC = () => {
  // Состояния
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<Payment | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [paymentEditVisible, setPaymentEditVisible] = useState<boolean>(false);
  const [newPaymentVisible, setNewPaymentVisible] = useState<boolean>(false);
  const [paymentPrintLoading, setPaymentPrintLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [paymentForm] = Form.useForm();
  const [ordersData, setOrdersData] = useState<any[]>([]);
  
  // Фильтры и поиск
  const [paymentSearchText, setPaymentSearchText] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [paymentDateRange, setPaymentDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  
  // Сортировка
  const [paymentSortByDate, setPaymentSortByDate] = useState<'asc' | 'desc'>('desc');
  
  // При монтировании компонента проверяем соединение с БД и загружаем данные
  useEffect(() => {
    checkDatabaseConnection();
    fetchOrders();
  }, []);
  
  // Проверка соединения с базой данных
  const checkDatabaseConnection = async () => {
    try {
      setDbStatus('loading');
      
      // Используем только рабочий URL
      const url = `${API_BASE_URL}/payments`;
      
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          console.log(`Успешное подключение через ${url}`);
          
          // Проверяем, что данные - это массив или имеют свойство payments
          if (Array.isArray(response.data)) {
            setPayments(response.data);
            setDbStatus('connected');
            return;
          } else if (response.data && Array.isArray(response.data.payments)) {
            setPayments(response.data.payments);
            setDbStatus('connected');
            return;
          } else {
            console.warn(`Данные от ${url} не являются массивом или объектом с payments:`, response.data);
          }
        }
      } catch (e) {
        console.log(`Не удалось подключиться через ${url}:`, e);
      }
      
      // Если не смогли подключиться, заполняем тестовыми данными
      setMockData();
      setDbStatus('error');
      throw new Error('Не удалось подключиться к API платежей');
    } catch (err) {
      console.error('Ошибка подключения к API:', err);
      setDbStatus('error');
      setError('Не удалось подключиться к API. Используются тестовые данные.');
    }
  };

  // Получение списка заказов для связывания с платежами
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      if (response.status === 200) {
        const orders = Array.isArray(response.data) ? response.data : 
                      (response.data && Array.isArray(response.data.orders)) ? response.data.orders : [];
        setOrdersData(orders);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      // В случае ошибки создаем демо-данные
      setOrdersData([
        { id: 1001, client_name: 'Иван Петров', total_price: 5000 },
        { id: 1002, client_name: 'Анна Сидорова', total_price: 7500 },
        { id: 1003, client_name: 'Алексей Смирнов', total_price: 3200 }
      ]);
    }
  };

  // Заполнение тестовыми данными, если API не работает
  const setMockData = () => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        order_id: 1001,
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: 'txn_123456789',
        created_at: '2025-05-25T10:15:00Z',
        amount: 5000,
        client_name: 'Иван Петров'
      },
      {
        id: 2,
        order_id: 1002,
        payment_method: 'cash',
        payment_status: 'completed',
        created_at: '2025-05-26T12:00:00Z',
        amount: 7500,
        client_name: 'Анна Сидорова'
      },
      {
        id: 3,
        order_id: 1003,
        payment_method: 'online_wallet',
        payment_status: 'failed',
        transaction_id: 'txn_987654321',
        created_at: '2025-05-27T09:30:00Z',
        amount: 3200,
        client_name: 'Алексей Смирнов'
      },
      {
        id: 4,
        order_id: 1004,
        payment_method: 'bank_transfer',
        payment_status: 'completed',
        transaction_id: 'txn_456789123',
        created_at: '2025-05-28T14:30:00Z',
        amount: 12000,
        client_name: 'Иван Петров'
      },
      {
        id: 5,
        order_id: 1005,
        payment_method: 'cash',
        payment_status: 'completed',
        created_at: '2025-05-28T16:45:00Z',
        amount: 9500,
        client_name: 'Алексей Смирнов'
      }
    ];
    
    setPayments(mockPayments);
    setError('API недоступен. Отображаются тестовые данные.');
  };
  
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
      const url = `${API_BASE_URL}/payments`;
      
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          console.log(`Успешная загрузка платежей через ${url}`);
          
          // Проверяем формат данных
          if (Array.isArray(response.data)) {
            setPayments(response.data);
          } else if (response.data && Array.isArray(response.data.payments)) {
            setPayments(response.data.payments);
          } else {
            console.warn(`Данные от ${url} не в ожидаемом формате:`, response.data);
            throw new Error('Данные от API в неожиданном формате');
          }
        }
      } catch (e) {
        console.log(`Не удалось загрузить платежи через ${url}:`, e);
        throw e;
      }
    } catch (error) {
      console.error('Ошибка при получении платежей через API:', error);
      setError('Не удалось получить данные платежей с сервера');
    } finally {
      setLoading(false);
    }
  }, [dbStatus]);
  
  // Фильтрация платежей
  const filteredPayments = useMemo(() => {
    // Проверяем, что payments является массивом
    if (!Array.isArray(payments)) {
      console.warn('payments не является массивом:', payments);
      return [];
    }
    
    return payments
      .filter(payment => {
        // Фильтр по тексту (ID платежа, ID заказа, ID транзакции, имя клиента)
        const searchLower = paymentSearchText.toLowerCase();
        const paymentIdMatch = payment.id.toString().includes(paymentSearchText);
        const orderIdMatch = payment.order_id ? payment.order_id.toString().includes(paymentSearchText) : false;
        const transactionIdMatch = (payment.transaction_id || '').toLowerCase().includes(searchLower);
        const clientNameMatch = (payment.client_name || '').toLowerCase().includes(searchLower);
        const textMatch = paymentIdMatch || orderIdMatch || transactionIdMatch || clientNameMatch;
        
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
  const togglePaymentSortDirection = () => {
    setPaymentSortByDate(paymentSortByDate === 'asc' ? 'desc' : 'asc');
  };
  
  const clearPaymentFilters = () => {
    setPaymentSearchText('');
    setPaymentStatusFilter('');
    setPaymentDateRange([null, null]);
  };
  
  // Открытие окна деталей платежа
  const showPaymentDetails = (payment: Payment) => {
    setPaymentDetails(payment);
    setDetailsVisible(true);
  };
  
  // Открытие окна редактирования платежа
  const showEditPayment = (payment: Payment) => {
    setPaymentDetails(payment);
    paymentForm.setFieldsValue({
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      transaction_id: payment.transaction_id,
      amount: payment.amount,
      payer_name: payment.payer_name || payment.client_name,
      payer_email: payment.payer_email,
      payment_details: payment.payment_details
    });
    setPaymentEditVisible(true);
  };
  
  // Открытие окна создания нового платежа
  const showNewPayment = () => {
    paymentForm.resetFields();
    paymentForm.setFieldsValue({
      payment_status: 'completed',
      payment_method: 'online_card',
      payment_date: dayjs(CURRENT_DATE)
    });
    setNewPaymentVisible(true);
  };
  
  // Обработчик изменения статуса платежа
  const handleUpdatePaymentStatus = async (id: number, status: string) => {
    try {
      const url = `${API_BASE_URL}/payments/${id}/status`;
      let success = false;
      
      if (dbStatus !== 'error') {
        try {
          const response = await axios.patch(url, { payment_status: status });
          if (response.status >= 200 && response.status < 300) {
            success = true;
          }
        } catch (e) {
          console.log(`Не удалось обновить статус платежа:`, e);
        }
      }
      
      // Обновляем локальные данные даже при ошибке API
      const updatedPayments = payments.map(payment => {
        if (payment.id === id) {
          return { ...payment, payment_status: status };
        }
        return payment;
      });
      setPayments(updatedPayments);
      
      notification.success({
        message: 'Статус платежа обновлен',
        description: `Статус платежа №${id} изменен на "${getPaymentStatusText(status)}"${success ? '' : ' (только локально)'}`
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса платежа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус платежа'
      });
    }
  };
  
  // Сохранение изменений платежа
  const handleSavePaymentChanges = async (values: any) => {
    if (!paymentDetails?.id) return;
    
    try {
      const url = `${API_BASE_URL}/payments/${paymentDetails.id}`;
      let success = false;
      
      if (dbStatus !== 'error') {
        try {
          const response = await axios.patch(url, values);
          if (response.status >= 200 && response.status < 300) {
            success = true;
          }
        } catch (e) {
          console.log(`Не удалось обновить платеж:`, e);
        }
      }
      
      // Обновляем локальные данные даже при ошибке API
      const updatedPayments = payments.map(payment => {
        if (payment.id === paymentDetails.id) {
          return { ...payment, ...values };
        }
        return payment;
      });
      setPayments(updatedPayments);
      
      notification.success({
        message: 'Платеж обновлен',
        description: `Платеж №${paymentDetails.id} успешно обновлен${success ? '' : ' (только локально)'}`
      });
      setPaymentEditVisible(false);
      
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
      // Преобразуем значения в формат API
      const paymentDate = values.payment_date ? values.payment_date.toISOString() : new Date().toISOString();
      
      // Создаем объект для отправки на сервер
      const newPaymentData = {
        order_id: values.order_id,
        payment_method: values.payment_method,
        payment_status: values.payment_status,
        transaction_id: values.transaction_id || null,
        created_at: paymentDate,
        // Дополнительные поля не относящиеся к API схеме будут сохранены только локально
        amount: values.amount,
        payer_name: values.payer_name,
        payer_email: values.payer_email,
        payment_details: values.payment_details
      };
      
      let responseData = null;
      let success = false;
      
      if (dbStatus !== 'error') {
        try {
          const response = await axios.post(`${API_BASE_URL}/payments`, newPaymentData);
          if (response.status >= 200 && response.status < 300) {
            responseData = response.data;
            success = true;
          }
        } catch (e) {
          console.log('Не удалось создать платеж:', e);
        }
      }
      
      if (!success) {
        // Если API недоступен или запрос не успешный, создаем локальный объект платежа
        responseData = {
          ...newPaymentData,
          id: Math.max(...payments.map(p => p.id), 0) + 1
        };
      }
      
      // Добавляем информацию о клиенте, если есть связанный заказ
      if (responseData.order_id) {
        const relatedOrder = ordersData.find(order => order.id === responseData.order_id);
        if (relatedOrder) {
          responseData.client_name = relatedOrder.client_name;
        }
      } else if (values.payer_name) {
        responseData.client_name = values.payer_name;
      }
      
      // Добавляем новый платеж в локальный массив
      setPayments([responseData, ...payments]);
      
      notification.success({
        message: 'Платеж создан',
        description: `Новый платеж успешно создан${success ? '' : ' (только локально)'}`
      });
      setNewPaymentVisible(false);
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      notification.error({
        message: 'Ошибка при создании',
        description: 'Не удалось создать новый платеж'
      });
    }
  };
  
  // Удаление платежа
  const handleDeletePayment = async (id: number) => {
    try {
      // Подтверждение удаления
      Modal.confirm({
        title: 'Подтверждение удаления',
        content: `Вы уверены, что хотите удалить платеж №${id}?`,
        okText: 'Да, удалить',
        okType: 'danger',
        cancelText: 'Отмена',
        onOk: async () => {
          let success = false;
          
          if (dbStatus !== 'error') {
            try {
              const response = await axios.delete(`${API_BASE_URL}/payments/${id}`);
              if (response.status >= 200 && response.status < 300) {
                success = true;
              }
            } catch (e) {
              console.log(`Не удалось удалить платеж:`, e);
            }
          }
          
          // Удаляем платеж из локального массива даже при ошибке API
          setPayments(payments.filter(payment => payment.id !== id));
          
          notification.success({
            message: 'Платеж удален',
            description: `Платеж №${id} успешно удален${success ? '' : ' (только локально)'}`
          });
        }
      });
    } catch (error) {
      console.error('Ошибка при удалении платежа:', error);
      notification.error({
        message: 'Ошибка при удалении',
        description: 'Не удалось удалить платеж'
      });
    }
  };
  
  // Печать информации о платеже
  const printPaymentDetails = async (paymentId: number) => {
    setPaymentPrintLoading(true);
    try {
      // Получаем детали платежа
      let payment = payments.find(p => p.id === paymentId);
      if (!payment && dbStatus !== 'error') {
        try {
          const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`);
          if (response.status === 200) {
            payment = response.data;
          }
        } catch (e) {
          console.log(`Не удалось получить платеж:`, e);
        }
      }
      
      if (!payment) {
        throw new Error('Платеж не найден');
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
              ${payment.order_id ? `
              <tr>
                <td><strong>Номер заказа:</strong></td>
                <td>${payment.order_id}</td>
              </tr>` : ''}
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
                <td>${payment.payer_name || payment.client_name || '-'}</td>
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
            Сумма платежа: ${formatPrice(payment.amount || 0)}
          </div>
          
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
  
  // Колонки для таблицы платежей - уменьшенные, для статичной таблицы без прокрутки
  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '7%',
      sorter: (a: Payment, b: Payment) => a.id - b.id
    },
    {
      title: 'ДАТА',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'ПЛАТЕЛЬЩИК',
      dataIndex: 'payer_name',
      key: 'payer_name',
      width: '20%',
      render: (text: string, record: Payment) => text || record.client_name || '-'
    },
    {
      title: 'МЕТОД',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: '15%',
      render: (method: string) => {
        // Используем более краткие названия для методов оплаты
        switch (method) {
          case PaymentMethod.ONLINE_CARD: return 'Онлайн карта';
          case PaymentMethod.SBP: return 'СБП';
          case PaymentMethod.CASH: return 'Наличные';
          case PaymentMethod.CASH_ON_DELIVERY: return 'Нал. платеж';
          case PaymentMethod.ONLINE_WALLET: return 'Эл. кошелек';
          case PaymentMethod.BANK_TRANSFER: return 'Банк. перевод';
          case PaymentMethod.CREDIT_CARD: return 'Кредит. карта';
          default: return method || '-';
        }
      }
    },
    {
      title: 'СТАТУС',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: '15%',
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
        
        return (
          <Tag color={color} icon={icon}>{
            status === PaymentStatus.COMPLETED ? 'Завершен' :
            status === PaymentStatus.PENDING ? 'Ожидает' :
            status === PaymentStatus.PROCESSING ? 'В обработке' : 
            status === PaymentStatus.REFUNDED ? 'Возвращен' :
            status === PaymentStatus.FAILED ? 'Не удался' :
            status === PaymentStatus.CANCELLED ? 'Отменен' : status
          }</Tag>
        );
      }
    },
    {
      title: 'СУММА',
      dataIndex: 'amount',
      key: 'amount',
      width: '13%',
      render: (amount: number) => formatPrice(amount || 0)
    },
    {
      title: 'ДЕЙСТВИЯ',
      key: 'actions',
      width: '15%',
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
          {record.payment_status === PaymentStatus.PENDING && (
            <Button 
              type="default"
              size="small"
              onClick={() => handleUpdatePaymentStatus(record.id, PaymentStatus.COMPLETED)}
              title="Подтвердить платеж"
              style={{ backgroundColor: '#52c41a', color: 'white' }}
            >
              OK
            </Button>
          )}
        </Space>
      )
    }
  ];
  
  return (
    <div className="payments-page">
      <div className="page-header">
        <Title level={2}>Управление платежами</Title>
        <Button 
          type="primary" 
          size="large"
          icon={<PlusOutlined />}
          onClick={() => showNewPayment()}
          className="create-payment-btn"
        >
          Создать новый платеж
        </Button>
      </div>

      {error && (
        <div className="error-message">
          <Alert message="Ошибка" description={error} type="error" showIcon closable />
        </div>
      )}
      
      <Card className="filter-card">
        <div className="filter-container">
          <Row gutter={[8, 0]} align="middle" justify="space-between">
            <Col xs={24} sm={12} md={7} lg={7} xl={7}>
              <Input 
                placeholder="Поиск по ID, транзакции или плательщику" 
                value={paymentSearchText} 
                onChange={(e) => setPaymentSearchText(e.target.value)} 
                prefix={<SearchOutlined />} 
                size="middle"
                className="search-input"
              />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Select 
                placeholder="Статус платежа"
                style={{ width: '100%' }}
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                allowClear
                size="middle"
                className="status-select"
              >
                <Option value="pending">Ожидает оплаты</Option>
                <Option value="processing">В обработке</Option>
                <Option value="completed">Завершен</Option>
                <Option value="refunded">Возвращен</Option>
                <Option value="failed">Не удался</Option>
                <Option value="cancelled">Отменен</Option>
              </Select>
            </Col>
            <Col xs={24} sm={14} md={7} lg={7} xl={7}>
              <RangePicker 
                style={{ width: '100%' }}
                onChange={(dates) => setPaymentDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="DD.MM.YYYY"
                placeholder={['Дата от', 'Дата до']}
                size="middle"
                className="date-picker"
              />
            </Col>
            <Col xs={24} sm={10} md={6} lg={6} xl={6} style={{ textAlign: 'right' }}>
              <div className="filter-actions">
                <Button 
                  icon={<FilterOutlined />} 
                  onClick={clearPaymentFilters}
                  title="Сбросить все фильтры"
                  className="filter-button"
                >
                  Сбросить
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchPayments}
                  title="Обновить данные"
                  className="filter-button"
                >
                  Обновить
                </Button>
                <Button
                  icon={paymentSortByDate === 'asc' ? <SyncOutlined /> : <SyncOutlined rotate={180} />}
                  onClick={togglePaymentSortDirection}
                  title={paymentSortByDate === 'asc' ? 'Сортировать по убыванию' : 'Сортировать по возрастанию'}
                  className="filter-button sort-button"
                >
                  По {paymentSortByDate === 'asc' ? 'возр.' : 'убыв.'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
      
      <Card className="table-card">
        <Table 
          dataSource={filteredPayments} 
          columns={paymentColumns}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total) => `Всего ${total} записей`,
            pageSizeOptions: ['10', '20', '50']
          }}
          size="middle"
          bordered
          className="payments-table"
        />
      </Card>
      
      {/* Модальное окно с деталями платежа */}
      <Drawer
        title={`Детали платежа №${paymentDetails?.id || ''}`}
        width={600}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                setDetailsVisible(false);
                if (paymentDetails) showEditPayment(paymentDetails);
              }}
            >
              Редактировать
            </Button>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => paymentDetails && printPaymentDetails(paymentDetails.id)}
              loading={paymentPrintLoading}
            >
              Печать
            </Button>
          </Space>
        }
        footer={
          <div style={{ textAlign: 'right' }}>
            {paymentDetails && paymentDetails.payment_status === PaymentStatus.PENDING && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  handleUpdatePaymentStatus(paymentDetails.id, PaymentStatus.COMPLETED);
                  setDetailsVisible(false);
                }}
                style={{ marginRight: 8 }}
              >
                Подтвердить платеж
              </Button>
            )}
            <Button 
              danger
              onClick={() => {
                if (paymentDetails) {
                  handleDeletePayment(paymentDetails.id);
                  setDetailsVisible(false);
                }
              }}
            >
              Удалить платеж
            </Button>
          </div>
        }
      >
        {paymentDetails && (
          <div>
            <Divider orientation="left">Основная информация</Divider>
            <Row gutter={[16, 8]}>
              <Col span={12}><strong>ID платежа:</strong></Col>
              <Col span={12}>{paymentDetails.id}</Col>
              
              {paymentDetails.order_id && (
                <>
                  <Col span={12}><strong>ID заказа:</strong></Col>
                  <Col span={12}>{paymentDetails.order_id}</Col>
                </>
              )}
              
              <Col span={12}><strong>Дата создания:</strong></Col>
              <Col span={12}>{formatDate(paymentDetails.created_at)}</Col>
              
              {paymentDetails.updated_at && (
                <>
                  <Col span={12}><strong>Дата обновления:</strong></Col>
                  <Col span={12}>{formatDate(paymentDetails.updated_at)}</Col>
                </>
              )}
              
              <Col span={12}><strong>Статус:</strong></Col>
              <Col span={12}>
                <Tag 
                  color={
                    paymentDetails.payment_status === PaymentStatus.COMPLETED ? 'success' :
                    paymentDetails.payment_status === PaymentStatus.PENDING ? 'warning' :
                    paymentDetails.payment_status === PaymentStatus.PROCESSING ? 'processing' :
                    paymentDetails.payment_status === PaymentStatus.REFUNDED ? 'cyan' :
                    'error'
                  }
                >
                  {getPaymentStatusText(paymentDetails.payment_status)}
                </Tag>
              </Col>
              
              <Col span={12}><strong>Метод оплаты:</strong></Col>
              <Col span={12}>{getPaymentMethodText(paymentDetails.payment_method)}</Col>
              
              <Col span={12}><strong>Сумма:</strong></Col>
              <Col span={12}>{formatPrice(paymentDetails.amount || 0)}</Col>
              
              <Col span={12}><strong>ID транзакции:</strong></Col>
              <Col span={12}>{paymentDetails.transaction_id || '-'}</Col>
            </Row>
            
            <Divider orientation="left">Информация о плательщике</Divider>
            <Row gutter={[16, 8]}>
              <Col span={12}><strong>Имя плательщика:</strong></Col>
              <Col span={12}>{paymentDetails.payer_name || paymentDetails.client_name || '-'}</Col>
              
              <Col span={12}><strong>Email плательщика:</strong></Col>
              <Col span={12}>{paymentDetails.payer_email || '-'}</Col>
            </Row>
            
            {paymentDetails.payment_details && (
              <>
                <Divider orientation="left">Дополнительная информация</Divider>
                <p>{paymentDetails.payment_details}</p>
              </>
            )}
          </div>
        )}
      </Drawer>
      
      {/* Модальное окно редактирования платежа */}
      <Drawer
        title={`Редактирование платежа №${paymentDetails?.id || ''}`}
        width={600}
        onClose={() => setPaymentEditVisible(false)}
        open={paymentEditVisible}
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
        open={newPaymentVisible}
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
            payment_method: 'online_card',
            payment_date: dayjs(CURRENT_DATE)
          }}
        >
          <Form.Item
            name="order_id"
            label="Связанный заказ"
          >
            <Select
              placeholder="Выберите заказ"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {ordersData.map(order => (
                <Option key={order.id} value={order.id}>
                  Заказ #{order.id} - {order.client_name} ({formatPrice(order.total_price)})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_type"
            label="Тип платежа"
            initialValue="income"
            rules={[{ required: true, message: 'Выберите тип платежа' }]}
          >
            <Select>
              <Option value="income">Доход (поступление средств)</Option>
              <Option value="expense">Расход (затраты)</Option>
              <Option value="refund">Возврат</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_category"
            label="Категория платежа"
          >
            <Select allowClear>
              <Option value="order_payment">Оплата товаров/услуг</Option>
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
            initialValue={dayjs(CURRENT_DATE)}
          >
            <DatePicker 
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Добавляем CSS для стилизации компонентов */}
      <style jsx>{`
        .payments-page {
          max-width: 100%;
          padding: 20px;
          margin: 0 auto;
          background-color: var(--snow-white);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .create-payment-btn {
          background-color: #0e6eab;
          border-color: #0e6eab;
        }
        
        .filter-card {
          margin-bottom: 20px;
          border-radius: 8px;
        }
        
        .filter-container {
          padding: 5px 0;
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        .filter-button {
          padding: 0 12px;
          height: 32px;
          display: inline-flex;
          align-items: center;
        }
        
        .sort-button {
          white-space: nowrap;
        }
        
        .table-card {
          border-radius: 8px;
        }
        
        .payments-table {
          margin-top: 0;
        }
        
        .search-input, .status-select, .date-picker {
          width: 100%;
        }
        
        .error-message {
          margin-bottom: 20px;
        }
        
        /* Адаптивные стили */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .create-payment-btn {
            width: 100%;
          }
          
          .filter-actions {
            margin-top: 10px;
            width: 100%;
          }
          
          .filter-button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Payments;