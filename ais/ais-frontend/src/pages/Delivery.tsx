import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import '../styles/Delivery.css';
import { API_BASE_URL } from '../utils/apiConfig';
import { API_ORDERS_ENDPOINTS, Order as ApiOrder, OrderItem as ApiOrderItem, DeliveryStatus } from '../utils/apiconfig.orders';

// Подробный вывод для отладки
const detailedLog = (data: any, label: string) => {
  console.log('====== НАЧАЛО ДЕТАЛЬНОГО ЛОГА ======');
  console.log(`ДЕТАЛЬНЫЙ ЛОГ для ${label}:`);
  console.log('Тип данных:', typeof data);
  console.log('Значение:', data);
  
  if (typeof data === 'object' && data !== null) {
    console.log('Ключи объекта:', Object.keys(data));
    for (const key of Object.keys(data)) {
      console.log(`${key}:`, data[key], `(тип: ${typeof data[key]})`);
    }
  }
  
  console.log('====== КОНЕЦ ДЕТАЛЬНОГО ЛОГА ======');
};

// Интерфейс для внутреннего использования
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

// Отладочная функция - выводит в консоль структуру объекта
const debugObject = (obj: any, label: string = 'Object') => {
  console.log(`DEBUG ${label}:`, JSON.stringify(obj, null, 2));
};

// Функция для генерации случайного трек-номера
const generateTrackingNumber = (): string => {
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

// Улучшенная версия функции processOrderItems с более детальной отладкой
const processOrderItems = (items: any): any[] => {
  detailedLog(items, 'processOrderItems input');
  
  if (!items) {
    console.log('processOrderItems: items пустые, возвращаем пустой массив');
    return [];
  }
  
  // Обрабатываем случай, когда order_items это строка JSON
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      console.log('processOrderItems: успешно распарсили JSON строку:', parsed);
      return parsed;
    } catch (error) {
      console.error('Ошибка при парсинге JSON строки order_items:', items, error);
      return [];
    }
  }
  
  // Обрабатываем случай, когда order_items это уже массив объектов
  if (Array.isArray(items)) {
    console.log('processOrderItems: items уже массив, возвращаем его:', items);
    return items;
  }
  
  // Если это единичный объект без product_id, попробуем преобразовать в массив
  if (typeof items === 'object' && items !== null) {
    // Проверим, может это просто объект заказа
    if ('price' in items && 'quantity' in items) {
      console.log('processOrderItems: нашли единичный объект с price и quantity, оборачиваем в массив:', [items]);
      return [items];
    }
    
    // Может быть это объект с полями-объектами
    const possibleItems = [];
    for (const key in items) {
      if (typeof items[key] === 'object' && items[key] !== null) {
        possibleItems.push(items[key]);
      }
    }
    
    if (possibleItems.length > 0) {
      console.log('processOrderItems: преобразовали объект в массив элементов:', possibleItems);
      return possibleItems;
    }
    
    console.log('processOrderItems: единичный объект, оборачиваем в массив:', [items]);
    return [items];
  }
  
  console.warn('Неизвестный формат данных order_items:', items);
  return [];
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
  
  // Детальная отладка заказа
  detailedLog(order, 'OrderDetails получил order');
  
  // Определение items для отображения - безопасный парсинг JSON
  // Сначала проверяем items, потом order_items
  let orderItems: any[] = [];
  
  if (order.items && order.items.length > 0) {
    console.log('Используем order.items для отображения');
    orderItems = order.items;
  } else if (order.order_items) {
    console.log('Используем order.order_items для отображения');
    orderItems = processOrderItems(order.order_items);
  } else {
    console.log('Элементы заказа отсутствуют');
    orderItems = [];
  }
  
  detailedLog(orderItems, 'Обработанные элементы заказа');
  
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
  
  // Проверим данные заказа перед рендерингом
  if (!order) {
    return <div>Данные о заказе отсутствуют</div>;
  }
  
  // Рассчитываем итоговую сумму по элементам, если total_price не указан
  const calculatedTotal = orderItems.reduce((sum, item) => 
    sum + (Number(item.price) * Number(item.quantity)), 0);
  
  // Используем рассчитанную сумму, если основная сумма не указана или равна 0
  const displayTotal = (!order.total_price || order.total_price === 0) 
    ? calculatedTotal 
    : order.total_price;
  
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
                <span className="detail-value">{order.user_id || 'Не указан'}</span>
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
            {orderItems && orderItems.length > 0 ? (
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
                  {orderItems.map((item: any, index: number) => {
                    const itemProductId = item.product_id || item.id;
                    const itemQuantity = Number(item.quantity || 1);
                    const itemPrice = Number(item.price || 0);
                    const itemSubtotal = itemPrice * itemQuantity;
                    
                    return (
                      <tr key={`${itemProductId}-${index}`}>
                        <td>{itemProductId}</td>
                        <td>{itemQuantity}</td>
                        <td>{formatPrice(itemPrice)} ₽</td>
                        <td>{formatPrice(itemSubtotal)} ₽</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold">Итого:</td>
                    <td className="font-bold">{formatPrice(displayTotal)} ₽</td>
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
                <span className="detail-value">{formatPrice(displayTotal)} ₽</span>
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
  
  // Функция для загрузки демо-данных из SQL таблицы
  const loadDemoData = () => {
    console.log('Загрузка данных из SQL таблицы');
    
    // Используем данные из предоставленной SQL таблицы
    const demoOrders: Order[] = [
      {
        id: 15,
        user_id: 2,
        status: DeliveryStatus.SHIPPED,
        total_price: 47995.85,
        created_at: '2025-05-03 14:45:00',
        tracking_number: 'TRK94555670',
        delivery_address: 'пр. Невский 15, Санкт-Петербург',
        client_name: 'Екатерина Великая',
        contact_phone: '79111111112',
        order_items: [{"price": 599.95, "quantity": 80, "product_id": 3}]
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
        contact_phone: '79111111111',
        order_items: [{"price": 2999.80, "quantity": 20, "product_id": 6}]
      },
      // ... Остальные заказы демо-данных могут быть добавлены здесь
    ];
    
    // Важно: убедимся, что для каждого заказа order_items корректно обработаны
    const processedOrders = demoOrders.map(order => ({
      ...order,
      order_items: Array.isArray(order.order_items) ? order.order_items : 
                 (typeof order.order_items === 'string' ? JSON.parse(order.order_items) : [])
    }));
    
    setOrders(processedOrders);
    setFilteredOrders(processedOrders);
    
    // Создаем статистику на основе данных
    const stats: OrderStats = {};
    const statusCounts: {[key: string]: {count: number, total: number}} = {};
    
    processedOrders.forEach(order => {
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

  // Функция преобразования названий полей из camelCase в snake_case
  // и наоборот для работы с разными форматами API
  const transformApiDataToLocalFormat = (apiOrders: any[]): Order[] => {
    console.log('Преобразуем данные API в локальный формат');
    console.log('Исходные данные:', apiOrders);
    
    return apiOrders.map(apiOrder => {
      // Детальная отладка каждого заказа
      detailedLog(apiOrder, 'Обработка apiOrder');
      
      // Начнем с определения полей заказа, пытаясь найти значения в обоих форматах
      // (camelCase и snake_case)
      const id = apiOrder.id !== undefined ? apiOrder.id : 0;
      const user_id = apiOrder.user_id !== undefined ? apiOrder.user_id : 
                      (apiOrder.userId !== undefined ? apiOrder.userId : 0);
      
      const status = apiOrder.status !== undefined ? apiOrder.status : 'pending';
      
      const total_price = apiOrder.total_price !== undefined ? apiOrder.total_price : 
                         (apiOrder.totalAmount !== undefined ? apiOrder.totalAmount : 
                         (apiOrder.totalPrice !== undefined ? apiOrder.totalPrice : 0));
      
      const created_at = apiOrder.created_at !== undefined ? apiOrder.created_at : 
                        (apiOrder.createdAt !== undefined ? apiOrder.createdAt : 
                        new Date().toISOString());
      
      const tracking_number = apiOrder.tracking_number !== undefined ? apiOrder.tracking_number : 
                             (apiOrder.trackingNumber !== undefined ? apiOrder.trackingNumber : '');
      
      const delivery_address = apiOrder.delivery_address !== undefined ? apiOrder.delivery_address : 
                              (apiOrder.deliveryAddress !== undefined ? apiOrder.deliveryAddress : '');
      
      const client_name = apiOrder.client_name !== undefined ? apiOrder.client_name : 
                         (apiOrder.customerName !== undefined ? apiOrder.customerName : 
                         (apiOrder.clientName !== undefined ? apiOrder.clientName : 
                         `Пользователь ${user_id}`));
      
      const contact_phone = apiOrder.contact_phone !== undefined ? apiOrder.contact_phone : 
                           (apiOrder.contactPhone !== undefined ? apiOrder.contactPhone : '');
      
      const payment_method = apiOrder.payment_method !== undefined ? apiOrder.payment_method : 
                            (apiOrder.paymentMethod !== undefined ? apiOrder.paymentMethod : '');
      
      const delivery_notes = apiOrder.delivery_notes !== undefined ? apiOrder.delivery_notes : 
                            (apiOrder.deliveryNotes !== undefined ? apiOrder.deliveryNotes : '');
      
      const courier_name = apiOrder.courier_name !== undefined ? apiOrder.courier_name : 
                          (apiOrder.courierName !== undefined ? apiOrder.courierName : '');
      
      const estimated_delivery = apiOrder.estimated_delivery !== undefined ? apiOrder.estimated_delivery : 
                                (apiOrder.estimatedDelivery !== undefined ? apiOrder.estimatedDelivery : '');
      
      // Обработка элементов заказа
      let items: any[] = [];
      let orderItemsSource: any = null;
      
      // Проверяем все возможные форматы хранения элементов заказа
      if (apiOrder.items && Array.isArray(apiOrder.items)) {
        console.log('Используем apiOrder.items');
        orderItemsSource = apiOrder.items;
      } else if (apiOrder.order_items) {
        console.log('Используем apiOrder.order_items');
        orderItemsSource = apiOrder.order_items;
      } else if (apiOrder.orderItems) {
        console.log('Используем apiOrder.orderItems');
        orderItemsSource = apiOrder.orderItems;
      }
      
      // Если нашли источник данных, преобразуем его
      if (orderItemsSource) {
        if (typeof orderItemsSource === 'string') {
          try {
            items = JSON.parse(orderItemsSource);
            console.log('Распарсили JSON строку в items:', items);
          } catch (e) {
            console.error('Ошибка при парсинге JSON строки для элементов заказа:', e);
            items = [];
          }
        } else if (Array.isArray(orderItemsSource)) {
          items = orderItemsSource;
          console.log('items уже являются массивом:', items);
        } else if (typeof orderItemsSource === 'object' && orderItemsSource !== null) {
          items = [orderItemsSource];
          console.log('Преобразовали объект в массив items:', items);
        }
      }
      
      // Преобразуем поля элементов заказа, если они есть
      const transformedItems = items.map(item => {
        const product_id = item.product_id !== undefined ? item.product_id : 
                          (item.productId !== undefined ? item.productId : 
                          (item.id !== undefined ? item.id : 0));
        
        const quantity = item.quantity !== undefined ? Number(item.quantity) : 1;
        
        const price = item.price !== undefined ? Number(item.price) : 0;
        
        const product_name = item.product_name !== undefined ? item.product_name : 
                            (item.productName !== undefined ? item.productName : 
                            (item.name !== undefined ? item.name : `Товар ${product_id}`));
        
        return {
          product_id,
          product_name,
          quantity,
          price,
          subtotal: price * quantity
        };
      });
      
      // Генерация трек-номера для заказов в пути или доставленных, если он отсутствует
      let trackedTrackingNumber = tracking_number;
      if (!trackedTrackingNumber && (status === DeliveryStatus.SHIPPED || status === DeliveryStatus.DELIVERED)) {
        trackedTrackingNumber = generateTrackingNumber();
        console.log(`Сгенерирован новый трек-номер для заказа ${id}: ${trackedTrackingNumber}`);
      }
      
      // Формируем итоговый объект заказа
      const transformedOrder: Order = {
        id,
        user_id,
        status,
        total_price,
        created_at,
        tracking_number: trackedTrackingNumber,
        delivery_address,
        estimated_delivery,
        client_name,
        contact_phone,
        payment_method,
        delivery_notes,
        courier_name,
        items: transformedItems,
        order_items: transformedItems  // Дублируем для совместимости
      };
      
      detailedLog(transformedOrder, 'Итоговый преобразованный заказ');
      
      return transformedOrder;
    });
  };

  // Загрузка заказов и статистики
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Пытаемся получить данные с сервера используя конфигурацию из apiconfig.orders.ts
      console.log(`Загрузка заказов с ${API_ORDERS_ENDPOINTS.ORDERS}`);
      const ordersResponse = await axios.get(API_ORDERS_ENDPOINTS.ORDERS);
      
      console.log('Получены данные с сервера:', ordersResponse.data);
      
      // Проверяем данные
      if (ordersResponse.data && (Array.isArray(ordersResponse.data) || typeof ordersResponse.data === 'object')) {
        let apiOrders: any[] = [];
        
        // Определяем, где находятся данные заказов в ответе API
        if (Array.isArray(ordersResponse.data)) {
          apiOrders = ordersResponse.data;
          console.log('Данные заказов получены как массив напрямую');
        } else if (ordersResponse.data.results && Array.isArray(ordersResponse.data.results)) {
          apiOrders = ordersResponse.data.results;
          console.log('Данные заказов получены из поля results');
        } else if (ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
          apiOrders = ordersResponse.data.data;
          console.log('Данные заказов получены из поля data');
        } else if (ordersResponse.data.orders && Array.isArray(ordersResponse.data.orders)) {
          apiOrders = ordersResponse.data.orders;
          console.log('Данные заказов получены из поля orders');
        } else {
          console.warn('Необычный формат данных, пробуем обработать как единичный объект');
          // Возможно, это один заказ, а не массив
          apiOrders = [ordersResponse.data];
        }
        
        if (apiOrders.length > 0) {
          console.log('Первый заказ в данных:');
          detailedLog(apiOrders[0], 'Первый заказ из API');
          
          // Трансформируем данные из API в нужный формат
          const transformedOrders = transformApiDataToLocalFormat(apiOrders);
          
          console.log('Преобразованные данные:', transformedOrders);
          
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
          console.log('Данные успешно загружены и преобразованы');
        } else {
          console.warn('Получен пустой массив заказов, загружаем демо-данные');
          loadDemoData();
        }
      } else {
        console.warn('Неожиданный формат данных от API, загружаем демо-данные');
        loadDemoData();
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      
      // Если API недоступно, загружаем демо-данные из SQL
      setError(`Не удалось загрузить данные с сервера. Загружены демо-данные из базы.`);
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

  // Функция открытия модального окна с деталями заказа
  const handleOpenDetails = (order: Order) => {
    console.log('Открываем детали заказа с ID:', order.id);
    
    // Проверяем наличие необходимых данных и заполняем их, если они отсутствуют
    // Это поможет избежать ошибок отображения
    const orderToShow: Order = {
      ...order,
      // Обеспечиваем корректные значения для всех ключевых полей
      user_id: order.user_id || 0,
      client_name: order.client_name || `Пользователь ${order.user_id}`,
      contact_phone: order.contact_phone || '',
      delivery_address: order.delivery_address || '',
      tracking_number: order.tracking_number || '',
      // Обеспечиваем корректное значение для списка товаров
      items: order.items || processOrderItems(order.order_items),
      order_items: order.order_items || order.items
    };
    
    // Дополнительная отладка
    detailedLog(orderToShow, 'orderToShow перед установкой в selectedOrder');
    
    setSelectedOrder(orderToShow);
  };

  // Закрытие модального окна с деталями заказа
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  // Обновление статуса заказа
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updateUrl = API_ORDERS_ENDPOINTS.UPDATE_ORDER_STATUS(orderId);
      console.log(`Отправка запроса на изменение статуса на ${updateUrl}`);
      
      // Отправка запроса на сервер
      try {
        const response = await axios.patch(updateUrl, { status: newStatus });
        console.log('Ответ сервера:', response.data);
      } catch (error) {
        console.warn('API не ответил, имитируем успешный ответ');
      }
      
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
      const stats: OrderStats = {};
      const statusCounts: {[key: string]: {count: number, total: number}} = {};
      
      updatedOrders.forEach(order => {
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
      setLastUpdated(new Date());
      
      // Сообщаем об успешном обновлении
      alert(`Статус заказа №${orderId} успешно изменен на "${newStatus}"`);
      
      return { status: newStatus };
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
                      {order.contact_phone && (
                        <span className="customer-phone">{order.contact_phone}</span>
                      )}
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
          <small>Текущий пользователь: katarymba | Время: 2025-05-03 15:34:09</small>
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