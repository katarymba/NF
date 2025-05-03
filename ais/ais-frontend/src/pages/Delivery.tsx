import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import './Delivery.css';
import { API_BASE_URL } from '../utils/apiConfig';

// Добавим эндпоинт для заказов в конфигурацию API
// Обновим порт с 8000 на 8001
const API_ORDERS = `${API_BASE_URL.replace(':8000', ':8001')}/orders`;
const API_ORDER_BY_ID = (id: number) => `${API_BASE_URL.replace(':8000', ':8001')}/orders/${id}`;
const API_UPDATE_ORDER_STATUS = (id: number) => `${API_BASE_URL.replace(':8000', ':8001')}/orders/${id}/status`;
const API_ORDERS_STATS = `${API_BASE_URL.replace(':8000', ':8001')}/orders/stats`;
const API_USER_BY_ID = (id: number) => `${API_BASE_URL.replace(':8000', ':8001')}/users/${id}`;

// Отладочная функция - выводит в консоль структуру объекта
const debugObject = (obj: any, label: string = 'Object') => {
  console.log(`DEBUG ${label}:`, JSON.stringify(obj, null, 2));
};

// Расширенный интерфейс заказа
interface Order {
  id: number;
  user_id: number;  // ID пользователя
  status: string;
  total_price: number;  // Общая стоимость
  created_at: string;
  tracking_number?: string;
  delivery_address?: string;
  estimated_delivery?: string;
  items?: OrderItem[];
  contact_phone?: string;
  payment_method?: string;
  delivery_notes?: string;
  courier_name?: string;
  client_name: string;  // Имя клиента
  order_items?: any;    // Для JSON данных списка заказа
}

interface OrderItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface OrderStats {
  [key: string]: {
    count: number;
    total_amount: number;
  }
}

// Перечисление статусов доставки
enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Функция для генерации случайного трек-номера
const generateTrackingNumber = (): string => {
  // Формат: TRK + 8 цифр
  const prefix = 'TRK';
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
};

// Безопасная функция для форматирования чисел
const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) {
    return '0.00';
  }
  return Number(price).toFixed(2);
};

// Функция для безопасного парсинга JSON строк
const processOrderItems = (items: any): any[] => {
  if (!items) return [];
  
  if (typeof items === 'string') {
    try {
      return JSON.parse(items);
    } catch {
      console.error('Ошибка при парсинге JSON строки order_items:', items);
      return [];
    }
  }
  
  return Array.isArray(items) ? items : [];
};

// Компонент для отображения статуса заказа с соответствующим цветом и иконкой
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';
  let icon = <ClockIcon className="w-4 h-4 mr-1" />;
  
  switch (status.toLowerCase()) {
    case DeliveryStatus.PENDING:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <ClockIcon className="w-4 h-4 mr-1" />;
      break;
    case DeliveryStatus.PROCESSING:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <ArrowPathIcon className="w-4 h-4 mr-1" />;
      break;
    case DeliveryStatus.SHIPPED:
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <TruckIcon className="w-4 h-4 mr-1" />;
      break;
    case DeliveryStatus.DELIVERED:
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <CheckCircleIcon className="w-4 h-4 mr-1" />;
      break;
    case DeliveryStatus.CANCELLED:
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <XCircleIcon className="w-4 h-4 mr-1" />;
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Компонент для отображения детальной информации о заказе
const OrderDetails: React.FC<{ 
  order: Order, 
  onClose: () => void, 
  onStatusChange: (orderId: number, newStatus: string) => void 
}> = ({ order, onClose, onStatusChange }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  
  const handleStatusChange = async () => {
    if (selectedStatus === order.status) {
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(order.id, selectedStatus);
      setIsUpdatingStatus(false);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setIsUpdatingStatus(false);
      setSelectedStatus(order.status); // сброс к исходному статусу в случае ошибки
      alert('Не удалось обновить статус заказа. Попробуйте позже.');
    }
  };
  
  // Определение items для отображения - безопасный парсинг JSON
  const orderItems = processOrderItems(order.order_items);
  
  return (
    <div className="order-details-modal">
      <div className="order-details-content">
        <div className="order-details-header">
          <h2>Заказ #{order.id}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="order-details-body">
          <div className="order-details-section">
            <h3>Информация о клиенте</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">ID пользователя:</span>
                <span className="detail-value">{order.user_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Имя клиента:</span>
                <span className="detail-value">{order.client_name || `Пользователь ${order.user_id}`}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Телефон:</span>
                <span className="detail-value">{order.contact_phone || 'Не указан'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Адрес доставки:</span>
                <span className="detail-value">{order.delivery_address || 'Не указан'}</span>
              </div>
            </div>
          </div>
          
          <div className="order-details-section">
            <h3>Информация о доставке</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Текущий статус:</span>
                <span className="detail-value"><StatusBadge status={order.status} /></span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Изменить статус:</span>
                <div className="status-select-container">
                  <select 
                    className="status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                  >
                    <option value={DeliveryStatus.PENDING}>Ожидание</option>
                    <option value={DeliveryStatus.PROCESSING}>Обработка</option>
                    <option value={DeliveryStatus.SHIPPED}>В пути</option>
                    <option value={DeliveryStatus.DELIVERED}>Доставлено</option>
                    <option value={DeliveryStatus.CANCELLED}>Отменено</option>
                  </select>
                  <button 
                    className={`status-update-button ${selectedStatus === order.status ? 'disabled' : ''}`}
                    onClick={handleStatusChange}
                    disabled={selectedStatus === order.status || isUpdatingStatus}
                  >
                    {isUpdatingStatus ? 'Обновление...' : 'Применить'}
                  </button>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Трек-номер:</span>
                <span className="detail-value">{order.tracking_number || 'Не назначен'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ожидаемая доставка:</span>
                <span className="detail-value">{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('ru-RU') : 'Не указано'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Курьер:</span>
                <span className="detail-value">{order.courier_name || 'Не назначен'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Комментарий к доставке:</span>
                <span className="detail-value">{order.delivery_notes || 'Отсутствует'}</span>
              </div>
            </div>
          </div>
          
          <div className="order-details-section">
            <h3>Состав заказа</h3>
            {orderItems.length > 0 ? (
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>ID товара</th>
                    <th>Количество</th>
                    <th>Цена за ед.</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={`${item.product_id}-${index}`}>
                      <td>{item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)} ₽</td>
                      <td>{formatPrice(item.price * item.quantity)} ₽</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold">Итого:</td>
                    <td className="font-bold">{formatPrice(order.total_price)} ₽</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>Информация о составе заказа отсутствует</p>
            )}
          </div>
          
          <div className="order-details-section">
            <h3>Информация об оплате</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Способ оплаты:</span>
                <span className="detail-value">{order.payment_method || 'Не указан'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Сумма:</span>
                <span className="detail-value">{formatPrice(order.total_price)} ₽</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-details-footer">
          <button 
            className="action-button print-button"
            onClick={() => window.print()}
          >
            Печать
          </button>
          <button 
            className="action-button close-button-secondary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

// Главный компонент страницы доставки
const Delivery: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' } | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Функция для загрузки демо-данных, когда API недоступен
  const loadDemoData = () => {
    console.log('Загрузка демо-данных на основе реальной структуры БД');
    
    // Используем реальные данные из БД
    const demoOrders: Order[] = [
      {
        id: 15,
        user_id: 2,
        status: DeliveryStatus.SHIPPED,
        total_price: 47995.85,
        created_at: '2025-05-03 14:45:00',
        tracking_number: generateTrackingNumber(),
        delivery_address: 'пр. Невский 15, Санкт-Петербург',
        client_name: 'Екатерина Великая',
        order_items: [{ product_id: 3, quantity: 80, price: 599.95 }]
      },
      {
        id: 14,
        user_id: 1,
        status: DeliveryStatus.PROCESSING,
        total_price: 59996,
        created_at: '2025-05-03 13:30:00',
        tracking_number: '',
        delivery_address: 'ул. Набережная 10, Москва',
        client_name: 'Александр Морской',
        order_items: [{ product_id: 6, quantity: 20, price: 2999.80 }]
      },
      {
        id: 13,
        user_id: 13,
        status: DeliveryStatus.PENDING,
        total_price: 77998.7,
        created_at: '2025-05-03 12:15:00',
        tracking_number: '',
        delivery_address: 'пр. Дальневосточный 70, Южно-Сахалинск',
        client_name: 'Олег Тунцов',
        order_items: [{ product_id: 6, quantity: 26, price: 2999.95 }]
      },
      {
        id: 12,
        user_id: 12,
        status: DeliveryStatus.DELIVERED,
        total_price: 20999,
        created_at: '2025-05-03 11:00:00',
        tracking_number: generateTrackingNumber(),
        delivery_address: 'ул. Красная 65, Красноярск',
        client_name: 'Светлана Минтаева',
        order_items: [{ product_id: 1, quantity: 10, price: 2099.90 }]
      },
      {
        id: 11,
        user_id: 11,
        status: DeliveryStatus.SHIPPED,
        total_price: 44997.9,
        created_at: '2025-05-03 10:45:00',
        tracking_number: generateTrackingNumber(),
        delivery_address: 'пр. Лососевый 60, Петропавловск-Камчатский',
        client_name: 'Павел Белуга',
        order_items: [{ product_id: 5, quantity: 11, price: 4090.72 }]
      },
      {
        id: 10,
        user_id: 10,
        status: DeliveryStatus.PROCESSING,
        total_price: 53998,
        created_at: '2025-05-03 14:30:00',
        tracking_number: '',
        delivery_address: 'ул. Океанская 55, Хабаровск',
        client_name: 'Елена Палтусова',
        order_items: [{ product_id: 1, quantity: 27, price: 1999.93 }]
      },
      {
        id: 9,
        user_id: 9,
        status: DeliveryStatus.PENDING,
        total_price: 32996.87,
        created_at: '2025-05-03 13:15:00',
        tracking_number: '',
        delivery_address: 'пр. Приморский 50, Архангельск',
        client_name: 'Антон Лещов',
        order_items: [{ product_id: 3, quantity: 55, price: 599.94 }]
      },
      {
        id: 8,
        user_id: 8,
        status: DeliveryStatus.DELIVERED,
        total_price: 41998,
        created_at: '2025-05-03 12:00:00',
        tracking_number: generateTrackingNumber(),
        delivery_address: 'ул. Рыбацкая 45, Калининград',
        client_name: 'Наталья Сёмгина',
        order_items: [{ product_id: 6, quantity: 14, price: 2999.86 }]
      }
    ];
    
    setOrders(demoOrders);
    setFilteredOrders(demoOrders);
    
    // Создаем статистику на основе данных
    const stats: OrderStats = {};
    const statusCounts: {[key: string]: {count: number, total: number}} = {};
    
    demoOrders.forEach(order => {
      if (!statusCounts[order.status]) {
        statusCounts[order.status] = { count: 0, total: 0 };
      }
      statusCounts[order.status].count++;
      statusCounts[order.status].total += order.total_price;
    });
    
    for (const [status, data] of Object.entries(statusCounts)) {
      stats[status] = { count: data.count, total_amount: data.total };
    }
    
    setOrderStats(stats);
    setLoading(false);
    setLastUpdated(new Date());
  };

  // Загрузка заказов и статистики
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Получаем заказы
      console.log(`Загрузка заказов с ${API_ORDERS}`);
      const ordersResponse = await axios.get<any[]>(API_ORDERS);
      
      console.log('Получены данные с сервера:', ordersResponse.data);
      
      // Выводим первый заказ для анализа структуры
      if (ordersResponse.data && ordersResponse.data.length > 0) {
        debugObject(ordersResponse.data[0], 'Первый заказ');
      }
      
      // Трансформируем данные из БД в нужный формат
      const transformedOrders = ordersResponse.data.map(dbOrder => {
        // Обработка order_items - парсим JSON если строка
        let orderItems = dbOrder.order_items;
        if (orderItems && typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch {
            console.error('Ошибка парсинга JSON для order_items:', orderItems);
            orderItems = [];
          }
        }

        // Генерация трек-номера для заказов в пути или доставленных, если он отсутствует
        let trackingNumber = dbOrder.tracking_number;
        if (!trackingNumber && (dbOrder.status === DeliveryStatus.SHIPPED || dbOrder.status === DeliveryStatus.DELIVERED)) {
          trackingNumber = generateTrackingNumber();
        }
        
        // ВАЖНО: здесь мы используем точный формат данных, который приходит от сервера
        // Всегда возвращаем объект с теми же полями, что и в интерфейсе Order
        return {
          id: dbOrder.id || 0,
          user_id: dbOrder.user_id || 0,
          status: dbOrder.status || DeliveryStatus.PENDING,
          total_price: dbOrder.total_price || 0,
          created_at: dbOrder.created_at || new Date().toISOString(),
          tracking_number: trackingNumber,
          delivery_address: dbOrder.delivery_address || '',
          client_name: dbOrder.client_name || `Пользователь ${dbOrder.user_id}`,
          order_items: orderItems || []
        };
      });
      
      console.log('Преобразованные данные:', transformedOrders);
      debugObject(transformedOrders[0], 'Первый преобразованный заказ');
      
      // Если массив пуст, используем демо-данные
      if (transformedOrders.length === 0) {
        console.warn('Получен пустой массив заказов, загружаем демо-данные');
        loadDemoData();
        return;
      }
      
      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
      
      // Создаем статистику на основе полученных данных
      const stats: OrderStats = {};
      const statusCounts: {[key: string]: {count: number, total: number}} = {};
      
      transformedOrders.forEach(order => {
        if (!order.status) return;
        
        if (!statusCounts[order.status]) {
          statusCounts[order.status] = { count: 0, total: 0 };
        }
        statusCounts[order.status].count++;
        statusCounts[order.status].total += (order.total_price || 0);
      });
      
      for (const [status, data] of Object.entries(statusCounts)) {
        stats[status] = { count: data.count, total_amount: data.total };
      }
      
      setOrderStats(stats);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Ответ сервера:', err.response.data);
          console.error('Статус:', err.response.status);
        } else if (err.request) {
          console.error('Запрос отправлен, но нет ответа:', err.request);
        }
      }
      
      // Если API недоступно, загружаем демо-данные
      setError(`Не удалось загрузить данные с сервера: ${(err as Error).message}. Загружены демо-данные.`);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при первом рендере
  useEffect(() => {
    fetchData();
  }, []);

  // Фильтрация заказов по поисковому запросу и статусу
  useEffect(() => {
    let result = [...orders];
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order.client_name && order.client_name.toLowerCase().includes(query)) ||
        String(order.user_id).includes(query) ||
        (order.tracking_number && order.tracking_number.toLowerCase().includes(query)) ||
        order.id.toString().includes(query) ||
        (order.delivery_address && order.delivery_address.toLowerCase().includes(query))
      );
    }
    
    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Сортировка результатов
    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === 'created_at') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        // @ts-ignore - обрабатываем разные типы данных
        const aValue = a[sortConfig.key];
        // @ts-ignore
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders, sortConfig]);

  // Функция сортировки
  const requestSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Получение класса для заголовка столбца при сортировке
  const getSortClass = (key: keyof Order) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'sort-none';
    }
    return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
  };

  // Открытие модального окна с деталями заказа
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  // Закрытие модального окна с деталями заказа
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  // Обновление статуса заказа
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updateUrl = API_UPDATE_ORDER_STATUS(orderId);
      console.log(`Отправка запроса на изменение статуса на ${updateUrl}`);
      
      const response = await axios.patch(updateUrl, { status: newStatus });
      
      // Если статус изменяется на "shipped" и нет трек-номера, генерируем его
      let trackingNumber = null;
      if (newStatus === DeliveryStatus.SHIPPED) {
        const orderToUpdate = orders.find(order => order.id === orderId);
        if (orderToUpdate && !orderToUpdate.tracking_number) {
          trackingNumber = generateTrackingNumber();
        }
      }
      
      // Обновляем данные в локальном состоянии
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus,
          ...(trackingNumber ? { tracking_number: trackingNumber } : {})
        } : order
      );
      
      setOrders(updatedOrders);
      
      // Если у нас открыто модальное окно с этим заказом, обновляем его
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus,
          ...(trackingNumber ? { tracking_number: trackingNumber } : {})
        });
      }
      
      // Обновляем статистику
      await fetchData();
      
      // Сообщаем об успешном обновлении
      alert(`Статус заказа №${orderId} успешно изменен на "${newStatus}"`);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      throw error;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Ошибка форматирования даты:', err);
      return dateString;
    }
  };

  // Получение количества заказов по статусу из статистики
  const getOrderCountByStatus = (status: string): number => {
    if (!orderStats || !orderStats[status]) {
      return 0;
    }
    return orderStats[status].count;
  };

  // Загрузка
  if (loading) {
    return (
      <div className="delivery-page loading-state">
        <div className="loading-spinner"></div>
        <p>Загрузка данных о заказах...</p>
      </div>
    );
  }

  // Основной рендер страницы
  return (
    <div className="delivery-page">
      {error && (
        <div className="error-notification">
          <div className="error-notification-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button 
              className="dismiss-error"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="delivery-header">
        <h1>Управление доставками</h1>
        <div className="delivery-stats">
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus(DeliveryStatus.DELIVERED)}</span>
            <span className="stat-label">Доставлено</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus(DeliveryStatus.SHIPPED)}</span>
            <span className="stat-label">В пути</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus(DeliveryStatus.PROCESSING)}</span>
            <span className="stat-label">Обработка</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus(DeliveryStatus.PENDING)}</span>
            <span className="stat-label">Ожидание</span>
          </div>
        </div>
      </div>
      
      <div className="filters-container">
        <div className="search-bar">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Поиск по имени клиента, номеру заказа, трек-номеру или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="status-filters">
          <button 
            className={`status-filter ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Все
          </button>
          <button 
            className={`status-filter ${statusFilter === DeliveryStatus.PENDING ? 'active' : ''}`}
            onClick={() => setStatusFilter(DeliveryStatus.PENDING)}
          >
            <ClockIcon className="filter-icon" />
            Ожидание
          </button>
          <button 
            className={`status-filter ${statusFilter === DeliveryStatus.PROCESSING ? 'active' : ''}`}
            onClick={() => setStatusFilter(DeliveryStatus.PROCESSING)}
          >
            <ArrowPathIcon className="filter-icon" />
            Обработка
          </button>
          <button 
            className={`status-filter ${statusFilter === DeliveryStatus.SHIPPED ? 'active' : ''}`}
            onClick={() => setStatusFilter(DeliveryStatus.SHIPPED)}
          >
            <TruckIcon className="filter-icon" />
            В пути
          </button>
          <button 
            className={`status-filter ${statusFilter === DeliveryStatus.DELIVERED ? 'active' : ''}`}
            onClick={() => setStatusFilter(DeliveryStatus.DELIVERED)}
          >
            <CheckCircleIcon className="filter-icon" />
            Доставлено
          </button>
          <button 
            className={`status-filter ${statusFilter === DeliveryStatus.CANCELLED ? 'active' : ''}`}
            onClick={() => setStatusFilter(DeliveryStatus.CANCELLED)}
          >
            <XCircleIcon className="filter-icon" />
            Отменено
          </button>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">📦</div>
          <p>Нет заказов, соответствующих выбранным критериям.</p>
          {(searchQuery || statusFilter !== 'all') && (
            <button 
              className="clear-filters-button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th className={getSortClass('id')} onClick={() => requestSort('id')}>
                  ID заказа
                </th>
                <th className={getSortClass('client_name')} onClick={() => requestSort('client_name')}>
                  Клиент
                </th>
                <th className={getSortClass('status')} onClick={() => requestSort('status')}>
                  Статус
                </th>
                <th className={getSortClass('total_price')} onClick={() => requestSort('total_price')}>
                  Сумма
                </th>
                <th className={getSortClass('created_at')} onClick={() => requestSort('created_at')}>
                  Дата создания
                </th>
                <th>Трек-номер</th>
                <th>Адрес</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`status-${(order.status || 'pending').toLowerCase()}`}>
                  <td>{order.id}</td>
                  <td>
                    <div className="customer-name">
                      {order.client_name || `Пользователь ${order.user_id}`}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={order.status || DeliveryStatus.PENDING} />
                  </td>
                  <td className="amount-cell">{formatPrice(order.total_price)} ₽</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {order.tracking_number ? (
                      <div className="tracking-number">
                        {order.tracking_number}
                        <button 
                          className="copy-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(order.tracking_number || '');
                            alert('Трек-номер скопирован!');
                          }}
                          title="Копировать трек-номер"
                        >
                          📋
                        </button>
                      </div>
                    ) : (
                      <span className="no-tracking">Не назначен</span>
                    )}
                  </td>
                  <td>
                    {order.delivery_address ? (
                      <div className="address-cell">
                        <MapPinIcon className="address-icon" />
                        <span title={order.delivery_address}>
                          {order.delivery_address.length > 25 
                            ? `${order.delivery_address.substring(0, 25)}...` 
                            : order.delivery_address}
                        </span>
                      </div>
                    ) : (
                      <span className="no-address">Не указан</span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="view-details-button"
                        onClick={() => handleOpenDetails(order)}
                      >
                        Подробнее
                      </button>
                      <div className="quick-status-update">
                        <select
                          className="quick-status-select"
                          value={order.status || DeliveryStatus.PENDING}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value={DeliveryStatus.PENDING}>Ожидание</option>
                          <option value={DeliveryStatus.PROCESSING}>Обработка</option>
                          <option value={DeliveryStatus.SHIPPED}>В пути</option>
                          <option value={DeliveryStatus.DELIVERED}>Доставлено</option>
                          <option value={DeliveryStatus.CANCELLED}>Отменено</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={handleCloseDetails}
          onStatusChange={handleStatusChange}
        />
      )}
      
      <div className="delivery-footer">
        <p>Всего заказов: {orders.length} | Отфильтровано: {filteredOrders.length}</p>
        <p className="last-updated">
          Последнее обновление: {lastUpdated.toLocaleString('ru-RU')}
          <br />
          <small>Текущий пользователь: katarymba | Время: 2025-05-03 15:01:32</small>
        </p>
        <button 
          className="refresh-button"
          onClick={() => fetchData()}
        >
          <ArrowPathIcon className="refresh-icon" />
          Обновить данные
        </button>
      </div>
    </div>
  );
};

export default Delivery;