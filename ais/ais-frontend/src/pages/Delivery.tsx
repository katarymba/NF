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

// Расширенный интерфейс заказа
interface Order {
  id: number;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  tracking_number: string;
  delivery_address?: string;
  estimated_delivery?: string;
  items?: OrderItem[];
  contact_phone?: string;
  payment_method?: string;
  delivery_notes?: string;
  courier_name?: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
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
                <span className="detail-label">Имя:</span>
                <span className="detail-value">{order.customer_name}</span>
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
                <span className="detail-value">{order.tracking_number || 'Не указан'}</span>
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
            {order.items && order.items.length > 0 ? (
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Количество</th>
                    <th>Цена за ед.</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price.toFixed(2)} ₽</td>
                      <td>{(item.quantity * item.price).toFixed(2)} ₽</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold">Итого:</td>
                    <td className="font-bold">{order.total_amount.toFixed(2)} ₽</td>
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
                <span className="detail-value">{order.total_amount.toFixed(2)} ₽</span>
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
    console.log('Загрузка демо-данных вместо API');
    const demoOrders: Order[] = [
      {
        id: 10001,
        customer_name: 'Иванов Иван',
        status: DeliveryStatus.DELIVERED,
        total_amount: 3250,
        created_at: '2025-05-01T10:30:00',
        tracking_number: 'TRK78956321',
        delivery_address: 'г. Москва, ул. Ленина, д. 42, кв. 56',
        estimated_delivery: '2025-05-03',
        contact_phone: '+7 (999) 123-45-67',
        payment_method: 'Онлайн оплата',
        courier_name: 'Петров В.А.',
        items: [
          { id: 1, name: 'Семга свежая', quantity: 2, price: 850 },
          { id: 2, name: 'Креветки тигровые', quantity: 1, price: 1550 }
        ]
      },
      {
        id: 10002,
        customer_name: 'Смирнова Екатерина',
        status: DeliveryStatus.SHIPPED,
        total_amount: 5100,
        created_at: '2025-05-02T12:15:00',
        tracking_number: 'TRK78956322',
        delivery_address: 'г. Санкт-Петербург, пр. Невский, д. 128, кв. 35',
        estimated_delivery: '2025-05-04',
        contact_phone: '+7 (999) 765-43-21',
        payment_method: 'Наличные при получении',
        delivery_notes: 'Позвонить за час до доставки',
        items: [
          { id: 3, name: 'Устрицы свежие', quantity: 12, price: 300 },
          { id: 4, name: 'Лосось филе', quantity: 1, price: 1500 }
        ]
      },
      {
        id: 10003,
        customer_name: 'Петров Алексей',
        status: DeliveryStatus.PROCESSING,
        total_amount: 2800,
        created_at: '2025-05-03T09:45:00',
        tracking_number: 'TRK78956323',
        delivery_address: 'г. Екатеринбург, ул. Мира, д. 15, кв. 7',
        estimated_delivery: '2025-05-05',
        contact_phone: '+7 (999) 222-33-44',
        payment_method: 'Онлайн оплата',
        items: [
          { id: 5, name: 'Форель охлажденная', quantity: 2, price: 750 },
          { id: 6, name: 'Морской коктейль', quantity: 1, price: 1300 }
        ]
      },
      {
        id: 10004,
        customer_name: 'Козлова Анна',
        status: DeliveryStatus.PENDING,
        total_amount: 4200,
        created_at: '2025-05-03T11:20:00',
        tracking_number: '',
        delivery_address: 'г. Новосибирск, ул. Советская, д. 62, кв. 18',
        estimated_delivery: '2025-05-06',
        contact_phone: '+7 (999) 555-66-77',
        payment_method: 'Наличные при получении',
        delivery_notes: 'Не звонить в дверь, написать СМС по прибытии',
        items: [
          { id: 7, name: 'Краб камчатский', quantity: 1, price: 2800 },
          { id: 8, name: 'Мидии в раковине', quantity: 2, price: 700 }
        ]
      },
      {
        id: 10005,
        customer_name: 'Соколов Дмитрий',
        status: DeliveryStatus.CANCELLED,
        total_amount: 3650,
        created_at: '2025-05-02T15:30:00',
        tracking_number: 'TRK78956325',
        delivery_address: 'г. Казань, ул. Пушкина, д. 23, кв. 44',
        estimated_delivery: '2025-05-04',
        contact_phone: '+7 (999) 888-99-00',
        payment_method: 'Онлайн оплата',
        delivery_notes: 'Клиент отменил заказ',
        items: [
          { id: 9, name: 'Тунец стейк', quantity: 2, price: 1200 },
          { id: 10, name: 'Кальмары', quantity: 1, price: 1250 }
        ]
      }
    ];
    
    setOrders(demoOrders);
    setFilteredOrders(demoOrders);
    
    // Создаем демо-статистику
    const demoStats: OrderStats = {
      [DeliveryStatus.PENDING]: { count: 1, total_amount: 4200 },
      [DeliveryStatus.PROCESSING]: { count: 1, total_amount: 2800 },
      [DeliveryStatus.SHIPPED]: { count: 1, total_amount: 5100 },
      [DeliveryStatus.DELIVERED]: { count: 1, total_amount: 3250 },
      [DeliveryStatus.CANCELLED]: { count: 1, total_amount: 3650 }
    };
    setOrderStats(demoStats);
    
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
      const ordersResponse = await axios.get<Order[]>(API_ORDERS);
      
      // Получаем статистику
      console.log(`Загрузка статистики с ${API_ORDERS_STATS}`);
      const statsResponse = await axios.get<OrderStats>(API_ORDERS_STATS);
      
      setOrders(ordersResponse.data);
      setFilteredOrders(ordersResponse.data);
      setOrderStats(statsResponse.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      
      // Если API недоступно, загружаем демо-данные
      setError('Не удалось загрузить данные с сервера. Отображены демонстрационные данные.');
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
        order.customer_name.toLowerCase().includes(query) ||
        (order.tracking_number && order.tracking_number.toLowerCase().includes(query)) ||
        order.id.toString().includes(query) ||
        (order.delivery_address && order.delivery_address.toLowerCase().includes(query))
      );
    }
    
    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
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
      
      // Обновляем данные в локальном состоянии
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      
      // Если у нас открыто модальное окно с этим заказом, обновляем его
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
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
            placeholder="Поиск по клиенту, номеру заказа, трек-номеру или адресу..."
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
                <th className={getSortClass('customer_name')} onClick={() => requestSort('customer_name')}>
                  Клиент
                </th>
                <th className={getSortClass('status')} onClick={() => requestSort('status')}>
                  Статус
                </th>
                <th className={getSortClass('total_amount')} onClick={() => requestSort('total_amount')}>
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
                <tr key={order.id} className={`status-${order.status.toLowerCase()}`}>
                  <td>{order.id}</td>
                  <td>
                    <div className="customer-name">
                      {order.customer_name}
                      {order.contact_phone && (
                        <span className="customer-phone">{order.contact_phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="amount-cell">{order.total_amount.toFixed(2)} ₽</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {order.tracking_number ? (
                      <div className="tracking-number">
                        {order.tracking_number}
                        <button 
                          className="copy-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(order.tracking_number);
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
                          value={order.status}
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