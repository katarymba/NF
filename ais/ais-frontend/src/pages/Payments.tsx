import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Select, Input, DatePicker, Typography, Space, Spin, Tooltip, Modal, Form, notification, Row, Col, InputNumber, Alert } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  EditOutlined, 
  ExportOutlined, 
  PlusOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { formatPrice, formatDate } from '../utils/apiconfig.orders';
import dayjs from 'dayjs';
import '../styles/Payments.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Обновляем интерфейс Payment согласно структуре БД
interface Payment {
  id: number;
  order_id: number; // Обязательное поле
  payment_method: string;
  payment_status: string; // Соответствует payment_status в БД
  transaction_id?: string;
  created_at: string;
}

// Добавляем интерфейс для заказов
interface Order {
  id: number;
  user_id: number;
  total_price: number;
  created_at: string;
  status: string;
  client_name?: string;
  delivery_address?: string;
  order_items?: string | any[]; // Может быть строкой JSON или уже распарсенным массивом
  payment_method?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  delivery_status?: string;
}

interface PaymentsProps {
  token: string;
}

const Payments: React.FC<PaymentsProps> = ({ token }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentEditVisible, setPaymentEditVisible] = useState<boolean>(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [paymentForm] = Form.useForm();
  const [paymentDetailVisible, setPaymentDetailVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Важно! Проверьте, что это правильный URL для вашего API
  const API_BASE_URL = 'http://localhost:8001';
  
  // Добавим текущего пользователя
  const currentUser = {
    login: 'katarymba',
    currentDate: '2025-05-08 13:02:38'
  };

  // Улучшенная функция для логирования
  const logInfo = (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  };

  // Получение всех платежей с детальным логированием
  const fetchPayments = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
      logInfo(`Запрос платежей: ${API_BASE_URL}/api/payments`);
      
      // Добавим вывод заголовков для отладки
      const response = await axios.get(`${API_BASE_URL}/api/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logInfo('Ответ сервера:', response);
      
      if (response.data) {
        logInfo('Загруженные платежи:', response.data);
        
        // Убедимся, что данные имеют правильный формат
        const formattedPayments = Array.isArray(response.data) ? response.data : [];
        
        // Проверка соответствия формата данных
        if (formattedPayments.length > 0) {
          logInfo('Первый платеж в ответе:', formattedPayments[0]);
        }
        
        setPayments(formattedPayments);
      } else {
        logInfo('Данные платежей не получены, response.data пуст');
        
        // Тестовые данные для отладки - используем данные из БД
        const testPayments = [
          { id: 1, order_id: 1, payment_method: 'online_card', payment_status: 'pending', transaction_id: 'TXN202505030001', created_at: '2025-05-03 10:35:00' },
          { id: 2, order_id: 2, payment_method: 'sbp', payment_status: 'processing', transaction_id: 'TXN202505030002', created_at: '2025-05-03 11:50:00' },
          { id: 3, order_id: 3, payment_method: 'cash_on_delivery', payment_status: 'completed', transaction_id: 'TXN202505030003', created_at: '2025-05-03 12:55:00' },
          { id: 4, order_id: 4, payment_method: 'online_wallet', payment_status: 'completed', transaction_id: 'TXN202505030004', created_at: '2025-05-03 13:35:00' },
        ];
        
        logInfo('Используем тестовые данные для отладки:', testPayments);
        setPayments(testPayments);
        
        notification.info({
          message: 'Используются тестовые данные',
          description: 'API вернул пустой результат. Используются тестовые данные для отображения интерфейса.'
        });
      }
    } catch (error) {
      console.error('Ошибка при получении платежей:', error);
      
      logInfo('Ошибка получения платежей:', error);
      
      // Тестовые данные для отладки - используем данные из БД
      const testPayments = [
        { id: 1, order_id: 1, payment_method: 'online_card', payment_status: 'pending', transaction_id: 'TXN202505030001', created_at: '2025-05-03 10:35:00' },
        { id: 2, order_id: 2, payment_method: 'sbp', payment_status: 'processing', transaction_id: 'TXN202505030002', created_at: '2025-05-03 11:50:00' },
        { id: 3, order_id: 3, payment_method: 'cash_on_delivery', payment_status: 'completed', transaction_id: 'TXN202505030003', created_at: '2025-05-03 12:55:00' },
        { id: 4, order_id: 4, payment_method: 'online_wallet', payment_status: 'completed', transaction_id: 'TXN202505030004', created_at: '2025-05-03 13:35:00' },
      ];
      
      logInfo('Используем тестовые данные при ошибке:', testPayments);
      setPayments(testPayments);
      
      setErrorMessage(`Ошибка при загрузке платежей. ${axios.isAxiosError(error) ? `Статус: ${error.response?.status}. ${error.message}` : 'Проверьте консоль для подробностей.'}`);
      
      notification.info({
        message: 'Используются тестовые данные',
        description: 'Ошибка при получении данных с API. Используются тестовые данные для отображения интерфейса.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Получение списка заказов для выбора в форме
  const fetchOrders = async () => {
    if (!token) {
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    
    try {
      logInfo(`Запрос заказов: ${API_BASE_URL}/api/orders`);
      
      const response = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logInfo('Ответ сервера для заказов:', response);
      
      if (response.data) {
        logInfo('Загруженные заказы:', response.data);
        
        // Убедимся, что данные имеют правильный формат
        const formattedOrders = Array.isArray(response.data) ? response.data : [];
        
        // Проверка соответствия формата данных
        if (formattedOrders.length > 0) {
          logInfo('Первый заказ в ответе:', formattedOrders[0]);
        }
        
        setOrders(formattedOrders);
      } else {
        logInfo('Данные заказов не получены, response.data пуст');
        
        // Тестовые данные для отладки - используем данные из БД
        const testOrders = [
          { id: 1, user_id: 1, total_price: 25999.9, created_at: '2025-05-03 10:30:00', status: 'shipped', client_name: 'Александр Морской', delivery_address: 'ул. Набережная 10, Москва', payment_method: 'online_card', tracking_number: 'TRK03660847', delivery_status: 'in_transit' },
          { id: 2, user_id: 2, total_price: 29990, created_at: '2025-05-03 11:45:00', status: 'processing', client_name: 'Екатерина Великая', delivery_address: 'пр. Невский 15, Санкт-Петербург', payment_method: 'sbp' },
          { id: 3, user_id: 3, total_price: 31998, created_at: '2025-05-03 12:50:00', status: 'shipped', client_name: 'Дмитрий Осетров', delivery_address: 'ул. Центральная 20, Казань', payment_method: 'cash_on_delivery' },
          { id: 4, user_id: 4, total_price: 27595.5, created_at: '2025-05-03 13:30:00', status: 'delivered', client_name: 'Анна Карпова', delivery_address: 'ул. Морская 25, Сочи', payment_method: 'online_wallet' }
        ];
        
        logInfo('Используем тестовые данные для заказов:', testOrders);
        setOrders(testOrders);
        
        notification.info({
          message: 'Используются тестовые данные',
          description: 'API заказов вернул пустой результат. Используются тестовые данные для отображения интерфейса.'
        });
      }
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      
      logInfo('Ошибка получения заказов:', error);
      
      // Тестовые данные для отладки - используем данные из БД
      const testOrders = [
        { id: 1, user_id: 1, total_price: 25999.9, created_at: '2025-05-03 10:30:00', status: 'shipped', client_name: 'Александр Морской', delivery_address: 'ул. Набережная 10, Москва', payment_method: 'online_card', tracking_number: 'TRK03660847', delivery_status: 'in_transit' },
        { id: 2, user_id: 2, total_price: 29990, created_at: '2025-05-03 11:45:00', status: 'processing', client_name: 'Екатерина Великая', delivery_address: 'пр. Невский 15, Санкт-Петербург', payment_method: 'sbp' },
        { id: 3, user_id: 3, total_price: 31998, created_at: '2025-05-03 12:50:00', status: 'shipped', client_name: 'Дмитрий Осетров', delivery_address: 'ул. Центральная 20, Казань', payment_method: 'cash_on_delivery' },
        { id: 4, user_id: 4, total_price: 27595.5, created_at: '2025-05-03 13:30:00', status: 'delivered', client_name: 'Анна Карпова', delivery_address: 'ул. Морская 25, Сочи', payment_method: 'online_wallet' }
      ];
      
      logInfo('Используем тестовые данные при ошибке для заказов:', testOrders);
      setOrders(testOrders);
      
      notification.info({
        message: 'Используются тестовые данные',
        description: 'Ошибка при получении данных заказов с API. Используются тестовые данные для отображения интерфейса.'
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchOrders();
  }, [token]);

  // Создание нового платежа
  const handleCreatePayment = async (values: any) => {
    if (!values.order_id) {
      notification.error({
        message: 'Ошибка валидации',
        description: 'ID заказа обязателен для создания платежа'
      });
      return;
    }

    try {
      // Адаптируем данные под структуру таблицы БД
      const paymentData = {
        order_id: values.order_id,
        payment_method: values.payment_method,
        payment_status: values.payment_status || 'pending', // используем payment_status вместо status
        transaction_id: values.transaction_id || `TXN${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`
        // created_at будет задано автоматически на сервере
      };
      
      logInfo('Отправляемые данные платежа:', paymentData);
      
      // Перебираем различные методы, если один не работает
      let response;
      
      // Сначала пробуем PUT
      try {
        response = await axios({
          method: 'put',
          url: `${API_BASE_URL}/api/payments`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: paymentData
        });
        
        logInfo('Ответ на PUT запрос:', response);
      } catch (putError) {
        logInfo('Ошибка PUT запроса:', putError);
        
        // Если PUT не работает, пробуем POST
        response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/api/payments`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: paymentData
        });
        
        logInfo('Ответ на POST запрос:', response);
      }
      
      if (response && (response.status === 200 || response.status === 201)) {
        notification.success({
          message: 'Платеж добавлен',
          description: `Новый платеж для заказа №${values.order_id} успешно создан`
        });
        
        paymentForm.resetFields();
        setPaymentModalVisible(false);
        
        // Добавляем новый платеж в локальный массив, чтобы не ждать перезагрузки с сервера
        const newPayment: Payment = {
          id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
          order_id: values.order_id,
          payment_method: values.payment_method,
          payment_status: values.payment_status || 'pending',
          transaction_id: paymentData.transaction_id,
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        
        setPayments([...payments, newPayment]);
      } else {
        throw new Error(`Сервер вернул статус ${response ? response.status : 'неизвестный'}`);
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      logInfo('Ошибка создания платежа:', error);
      
      // Симулируем создание платежа, если API недоступен
      const newPayment: Payment = {
        id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
        order_id: values.order_id,
        payment_method: values.payment_method,
        payment_status: values.payment_status || 'pending',
        transaction_id: `TXN${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      
      setPayments([...payments, newPayment]);
      
      notification.info({
        message: 'Платеж добавлен локально',
        description: 'API недоступен, но платеж добавлен в локальную таблицу.'
      });
    }
  };

  // Редактирование платежа
  const handleEditPayment = async (values: any) => {
    if (!currentPayment?.id) return;
    
    if (!values.order_id) {
      notification.error({
        message: 'Ошибка валидации',
        description: 'ID заказа обязателен для обновления платежа'
      });
      return;
    }
    
    try {
      // Адаптируем данные под структуру таблицы БД
      const paymentData = {
        order_id: values.order_id,
        payment_method: values.payment_method,
        payment_status: values.payment_status || 'pending', // используем payment_status вместо status
        transaction_id: values.transaction_id || null
        // created_at не обновляем
      };
      
      logInfo('Отправляемые данные для обновления:', paymentData);
      
      // Перебираем различные методы, если один не работает
      let response;
      
      // Сначала пробуем PATCH
      try {
        response = await axios({
          method: 'patch',
          url: `${API_BASE_URL}/api/payments/${currentPayment.id}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: paymentData
        });
        
        logInfo('Ответ на PATCH запрос:', response);
      } catch (patchError) {
        logInfo('Ошибка PATCH запроса:', patchError);
        
        // Если PATCH не работает, пробуем PUT
        response = await axios({
          method: 'put',
          url: `${API_BASE_URL}/api/payments/${currentPayment.id}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: paymentData
        });
        
        logInfo('Ответ на PUT запрос (обновление):', response);
      }
      
      if (response && response.status === 200) {
        notification.success({
          message: 'Платеж обновлен',
          description: `Платеж №${currentPayment.id} успешно обновлен`
        });
        setPaymentEditVisible(false);
        
        // Обновляем платеж в локальном массиве
        const updatedPayments = payments.map(p => 
          p.id === currentPayment.id ? { ...p, ...paymentData } : p
        );
        setPayments(updatedPayments);
      } else {
        throw new Error(`Сервер вернул статус ${response ? response.status : 'неизвестный'}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении платежа:', error);
      logInfo('Ошибка обновления платежа:', error);
      
      // Симулируем обновление, если API недоступен
      const updatedPayments = payments.map(p => 
        p.id === currentPayment.id ? { 
          ...p, 
          payment_method: values.payment_method,
          payment_status: values.payment_status,
          order_id: values.order_id,
          transaction_id: values.transaction_id || p.transaction_id
        } : p
      );
      
      setPayments(updatedPayments);
      setPaymentEditVisible(false);
      
      notification.info({
        message: 'Платеж обновлен локально',
        description: 'API недоступен, но платеж обновлен в локальной таблице.'
      });
    }
  };

  // Удаление платежа
  const handleDeletePayment = async (paymentId: number) => {
    try {
      logInfo(`Удаление платежа с ID: ${paymentId}`);
      
      const response = await axios.delete(`${API_BASE_URL}/api/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      logInfo('Ответ на DELETE запрос:', response);
      
      if (response.status === 200 || response.status === 204) {
        notification.success({
          message: 'Платеж удален',
          description: `Платеж №${paymentId} успешно удален`
        });
        
        // Обновляем локальный массив
        setPayments(payments.filter(p => p.id !== paymentId));
      } else {
        throw new Error(`Сервер вернул статус ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении платежа:', error);
      logInfo('Ошибка удаления платежа:', error);
      
      // Симулируем удаление, если API недоступен
      setPayments(payments.filter(p => p.id !== paymentId));
      
      notification.info({
        message: 'Платеж удален локально',
        description: 'API недоступен, но платеж удален из локальной таблицы.'
      });
    }
  };

  // Открытие модального окна для редактирования платежа
  const showPaymentEditForm = (payment: Payment) => {
    setCurrentPayment(payment);
    paymentForm.setFieldsValue({
      payment_method: payment.payment_method,
      order_id: payment.order_id,
      payment_status: payment.payment_status,
      transaction_id: payment.transaction_id
    });
    setPaymentEditVisible(true);
  };

  // Открытие модального окна для просмотра деталей платежа
  const showPaymentDetails = (payment: Payment) => {
    setCurrentPayment(payment);
    setPaymentDetailVisible(true);
  };

  // Экспорт данных в Excel
  const exportToExcel = () => {
    notification.info({
      message: 'Экспорт данных',
      description: 'Подготовка файла для экспорта платежей...'
    });

    try {
      window.open(`${API_BASE_URL}/api/payments/export?format=excel&token=${encodeURIComponent(token)}`, '_blank');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      
      notification.error({
        message: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать данные платежей'
      });
    }
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setDateRange(null);
  };

  // Функция для получения названия клиента по ID заказа
  const getClientNameByOrderId = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    return order?.client_name || 'Нет данных';
  };

  // Функция для получения суммы заказа по ID
  const getOrderAmountByOrderId = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    return order?.total_price || 0;
  };

  // Применение фильтров к платежам
  const filteredPayments = payments.filter(payment => {
    // Фильтр по строке поиска для платежей
    const searchMatch = !searchText || 
      payment.id.toString().includes(searchText) || 
      payment.order_id.toString().includes(searchText) ||
      (payment.transaction_id && payment.transaction_id.includes(searchText)) ||
      getClientNameByOrderId(payment.order_id).toLowerCase().includes(searchText.toLowerCase());
    
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

  // Колонки таблицы платежей
  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Payment, b: Payment) => a.id - b.id,
    },
    {
      title: 'Заказ',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId: number) => (
        <div>
          <div><strong>№{orderId}</strong></div>
          <div style={{ fontSize: '12px' }}>{getClientNameByOrderId(orderId)}</div>
        </div>
      ),
    },
    {
      title: 'Сумма заказа',
      key: 'order_amount',
      render: (_, record: Payment) => formatPrice(getOrderAmountByOrderId(record.order_id)),
      sorter: (a: Payment, b: Payment) => 
        getOrderAmountByOrderId(a.order_id) - getOrderAmountByOrderId(b.order_id),
    },
    {
      title: 'Способ оплаты',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => (
        <Tag>{method === 'online_card' ? 'Онлайн картой' : 
             method === 'sbp' ? 'СБП' : 
             method === 'cash_on_delivery' ? 'При получении' :
             method === 'cash' ? 'Наличными' : 
             method === 'online_wallet' ? 'Онлайн кошелек' :
             method === 'bank_transfer' ? 'Банковский перевод' :
             method === 'credit_card' ? 'Кредитная карта' :
             method === 'other' ? 'Другой способ' : method}</Tag>
      ),
      filters: [
        { text: 'Онлайн картой', value: 'online_card' },
        { text: 'СБП', value: 'sbp' },
        { text: 'При получении', value: 'cash_on_delivery' },
        { text: 'Наличными', value: 'cash' },
        { text: 'Онлайн кошелек', value: 'online_wallet' },
        { text: 'Банковский перевод', value: 'bank_transfer' },
        { text: 'Кредитная карта', value: 'credit_card' }
      ],
      onFilter: (value: string | number | boolean, record: Payment) => record.payment_method === value,
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
          {status === 'completed' ? 'Выполнен' : 
           status === 'processing' ? 'В обработке' : 
           status === 'pending' ? 'Ожидает' : 
           status === 'refunded' ? 'Возвращен' : status}
        </Tag>
      ),
      filters: [
        { text: 'Выполнен', value: 'completed' },
        { text: 'В обработке', value: 'processing' },
        { text: 'Ожидает', value: 'pending' },
        { text: 'Возвращен', value: 'refunded' }
      ],
      onFilter: (value: string | number | boolean, record: Payment) => record.payment_status === value,
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
          <Tooltip title="Просмотр">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => showPaymentDetails(record)}
            />
          </Tooltip>
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

  return (
    <div className="payments-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={3}>Управление платежами</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                fetchPayments();
                fetchOrders();
              }}
              loading={loading || ordersLoading}
            >
              Обновить
            </Button>
            <Button 
              type="default" 
              icon={<PlusOutlined />}
              onClick={() => {
                paymentForm.resetFields();
                setPaymentModalVisible(true);
              }}
              disabled={orders.length === 0} // Блокируем, если нет заказов
            >
              Новый платеж
            </Button>
            <Button 
              type="default" 
              icon={<ExportOutlined />} 
              onClick={exportToExcel}
              disabled={payments.length === 0} // Блокируем, если нет платежей
            >
              Экспорт в Excel
            </Button>
          </Space>
        </div>

        {errorMessage && (
          <Alert 
            message="Ошибка" 
            description={errorMessage} 
            type="error" 
            showIcon 
            closable 
            style={{ marginBottom: '20px' }}
            onClose={() => setErrorMessage(null)} 
          />
        )}

        {orders.length === 0 && !ordersLoading && (
          <Alert
            message="Нет доступных заказов"
            description="Для создания платежей необходимо наличие хотя бы одного заказа в системе."
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

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
              value={statusFilter}
              onChange={setStatusFilter}
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
          </Space>
        </div>

        <Spin spinning={loading || ordersLoading}>
          {payments.length === 0 && !loading ? (
            <Alert
              message="Нет платежей"
              description="В системе пока нет платежей. Нажмите 'Новый платеж' для создания."
              type="info"
              showIcon
            />
          ) : (
            <Table 
              dataSource={filteredPayments}
              columns={paymentColumns}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true, 
                showTotal: (total) => `Всего: ${total} платежей`,
                pageSizeOptions: ['10', '20', '50']
              }}
            />
          )}
        </Spin>
      </Card>

      {/* Модальное окно для создания нового платежа */}
      <Modal
        title="Создание нового платежа"
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
            label="Заказ"
            rules={[{ required: true, message: 'Выберите заказ для оплаты' }]}
          >
            <Select
              loading={ordersLoading}
              placeholder="Выберите заказ"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => 
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {orders.map(order => (
                <Option key={order.id} value={order.id}>
                  {`№${order.id} - ${order.client_name || 'Без имени'} - ${formatPrice(order.total_price || 0)}`}
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
              <Option value="online_card">Онлайн картой</Option>
              <Option value="sbp">СБП</Option>
              <Option value="cash_on_delivery">При получении</Option>
              <Option value="cash">Наличными</Option>
              <Option value="online_wallet">Онлайн кошелек</Option>
              <Option value="bank_transfer">Банковский перевод</Option>
              <Option value="credit_card">Кредитная карта</Option>
              <Option value="other">Другой способ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_status"
            label="Статус платежа"
            initialValue="pending"
          >
            <Select>
              <Option value="completed">Выполнен</Option>
              <Option value="processing">В обработке</Option>
              <Option value="pending">Ожидает</Option>
              <Option value="refunded">Возвращен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="transaction_id"
            label="ID транзакции (необязательно)"
          >
            <Input placeholder="Например: TXN202505080001" />
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

      {/* Модальное окно для редактирования платежа */}
      <Modal
        title="Редактирование платежа"
        open={paymentEditVisible}
        onCancel={() => setPaymentEditVisible(false)}
        footer={null}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleEditPayment}
        >
          <Form.Item
            name="order_id"
            label="Заказ"
            rules={[{ required: true, message: 'Выберите заказ для оплаты' }]}
          >
            <Select
              loading={ordersLoading}
              placeholder="Выберите заказ"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => 
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {orders.map(order => (
                <Option key={order.id} value={order.id}>
                  {`№${order.id} - ${order.client_name || 'Без имени'} - ${formatPrice(order.total_price || 0)}`}
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
              <Option value="online_card">Онлайн картой</Option>
              <Option value="sbp">СБП</Option>
              <Option value="cash_on_delivery">При получении</Option>
              <Option value="cash">Наличными</Option>
              <Option value="online_wallet">Онлайн кошелек</Option>
              <Option value="bank_transfer">Банковский перевод</Option>
              <Option value="credit_card">Кредитная карта</Option>
              <Option value="other">Другой способ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_status"
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

          <Form.Item
            name="transaction_id"
            label="ID транзакции (необязательно)"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPaymentEditVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Обновить платеж
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для просмотра деталей платежа */}
      <Modal
        title={`Детали платежа №${currentPayment?.id}`}
        open={paymentDetailVisible}
        onCancel={() => setPaymentDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPaymentDetailVisible(false)}>
            Закрыть
          </Button>,
          <Button 
            key="edit" 
            type="primary"
            onClick={() => {
              setPaymentDetailVisible(false);
              if (currentPayment) showPaymentEditForm(currentPayment);
            }}
          >
            Редактировать
          </Button>
        ]}
      >
        {currentPayment && (
          <div className="payment-details">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>ID платежа:</strong> {currentPayment.id}</p>
                <p><strong>Связанный заказ:</strong> №{currentPayment.order_id}</p>
                <p><strong>Клиент:</strong> {getClientNameByOrderId(currentPayment.order_id)}</p>
                <p><strong>Сумма заказа:</strong> {formatPrice(getOrderAmountByOrderId(currentPayment.order_id))}</p>
              </Col>
              <Col span={12}>
                <p><strong>Способ оплаты:</strong> {
                  currentPayment.payment_method === 'online_card' ? 'Онлайн картой' : 
                  currentPayment.payment_method === 'sbp' ? 'СБП' : 
                  currentPayment.payment_method === 'cash_on_delivery' ? 'При получении' :
                  currentPayment.payment_method === 'cash' ? 'Наличными' : 
                  currentPayment.payment_method === 'online_wallet' ? 'Онлайн кошелек' :
                  currentPayment.payment_method === 'bank_transfer' ? 'Банковский перевод' :
                  currentPayment.payment_method === 'credit_card' ? 'Кредитная карта' :
                  currentPayment.payment_method === 'other' ? 'Другой способ' : currentPayment.payment_method
                }</p>
                <p><strong>Статус:</strong> {
                  <Tag color={
                    currentPayment.payment_status === 'completed' ? 'green' : 
                    currentPayment.payment_status === 'processing' ? 'blue' : 
                    currentPayment.payment_status === 'pending' ? 'orange' : 
                    currentPayment.payment_status === 'refunded' ? 'red' : 'default'
                  }>
                    {currentPayment.payment_status === 'completed' ? 'Выполнен' : 
                     currentPayment.payment_status === 'processing' ? 'В обработке' : 
                     currentPayment.payment_status === 'pending' ? 'Ожидает' : 
                     currentPayment.payment_status === 'refunded' ? 'Возвращен' : currentPayment.payment_status}
                  </Tag>
                }</p>
                <p><strong>ID транзакции:</strong> {currentPayment.transaction_id || 'Не указан'}</p>
                <p><strong>Дата создания:</strong> {formatDate(currentPayment.created_at)}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;