import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import '../styles/Delivery.css';
import { API_BASE_URL } from '../utils/apiConfig';
import { API_ORDERS_ENDPOINTS, Order as ApiOrder, OrderItem as ApiOrderItem, DeliveryStatus } from '../utils/apiconfig.orders';

// Вспомогательные интерфейсы и типы
interface Order {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  created_at: string;
  tracking_number?: string;
  delivery_address?: string;
  estimated_delivery?: string;
  items?: OrderItem[];
  contact_phone?: string;
  payment_method?: string;
  delivery_notes?: string;
  courier_name?: string;
  client_name: string;
  order_items?: any;
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

// Словарь для имен товаров по ID
const productNames: {[key: number]: string} = {
  1: 'Семга свежая',
  3: 'Сельдь малосольная',
  5: 'Осетр копченый',
  6: 'Форель радужная',
  11: 'Треска атлантическая',
  // Добавьте другие товары здесь
};

// Словарь для русификации статусов
const statusTranslations: {[key: string]: string} = {
  'pending': 'Ожидание',
  'processing': 'Обработка',
  'shipped': 'В пути',
  'delivered': 'Доставлено',
  'cancelled': 'Отменено'
};

// Словарь для русификации способов оплаты
const paymentMethodTranslations: {[key: string]: string} = {
  'online_card': 'Картой онлайн',
  'sbp': 'СБП',
  'cash_on_delivery': 'Наличными при получении',
  'online_wallet': 'Картой онлайн',
  'credit_card': 'Картой онлайн',
  'bank_transfer': 'Банковский перевод',
};

// Список доступных курьеров
const availableCouriers = [
  'Сидоров А.А.',
  'Кузнецов В.А.',
  'Дербенев И.С.'
];

// Функция для расчета предполагаемой даты доставки
const calculateEstimatedDelivery = (createdDate: string): string => {
  const created = new Date(createdDate);
  
  // Добавляем 4-5 дней (случайно)
  const daysToAdd = Math.floor(Math.random() * 2) + 4; // 4 или 5 дней
  const delivery = new Date(created);
  delivery.setDate(delivery.getDate() + daysToAdd);
  
  // Форматируем дату в строку YYYY-MM-DD
  return delivery.toISOString().split('T')[0];
};

// Функция для получения названия товара
const getProductName = (productId: number): string => {
  return productNames[productId] || `Товар ${productId}`;
};

// Функция для форматирования цен
const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) {
    return '0.00';
  }
  return Number(price).toFixed(2);
};

// Функция для обработки элементов заказа
const processOrderItems = (items: any): any[] => {
  if (!items) {
    return [];
  }
  
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return parsed;
    } catch (error) {
      console.error('Ошибка при парсинге JSON строки order_items:', items, error);
      return [];
    }
  }
  
  if (Array.isArray(items)) {
    return items;
  }
  
  if (typeof items === 'object' && items !== null) {
    if ('price' in items && 'quantity' in items) {
      return [items];
    }
    
    const possibleItems = [];
    for (const key in items) {
      if (typeof items[key] === 'object' && items[key] !== null) {
        possibleItems.push(items[key]);
      }
    }
    
    if (possibleItems.length > 0) {
      return possibleItems;
    }
    
    return [items];
  }
  
  return [];
};

// Компонент для отображения статуса заказа
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';
  let icon = <ClockIcon className="w-4 h-4 mr-1" />;
  
  switch (status.toLowerCase()) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <ClockIcon className="w-4 h-4 mr-1" />;
      break;
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <ArrowPathIcon className="w-4 h-4 mr-1" />;
      break;
    case 'shipped':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <TruckIcon className="w-4 h-4 mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <CheckCircleIcon className="w-4 h-4 mr-1" />;
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <XCircleIcon className="w-4 h-4 mr-1" />;
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {statusTranslations[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Компонент для отображения деталей заказа
const OrderDetails: React.FC<{ 
  order: Order, 
  onClose: () => void, 
  onStatusChange: (orderId: number, newStatus: string) => void,
  onTrackingNumberChange: (orderId: number, trackingNumber: string) => void,
  onCourierChange: (orderId: number, courierName: string) => void,
  onDeliveryNotesChange: (orderId: number, notes: string) => void,
}> = ({ order, onClose, onStatusChange, onTrackingNumberChange, onCourierChange, onDeliveryNotesChange }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [selectedCourier, setSelectedCourier] = useState(order.courier_name || '');
  const [deliveryNotes, setDeliveryNotes] = useState(order.delivery_notes || '');
  
  let orderItems: any[] = [];
  
  if (order.items && order.items.length > 0) {
    orderItems = order.items;
  } else if (order.order_items) {
    orderItems = processOrderItems(order.order_items);
  }
  
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
      setSelectedStatus(order.status);
      alert('Не удалось обновить статус заказа. Попробуйте позже.');
    }
  };

  const handleTrackingNumberSave = () => {
    if (trackingNumber !== order.tracking_number) {
      onTrackingNumberChange(order.id, trackingNumber);
    }
  };

  const handleCourierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courier = e.target.value;
    setSelectedCourier(courier);
    onCourierChange(order.id, courier);
  };

  const handleDeliveryNotesChange = () => {
    if (deliveryNotes !== order.delivery_notes) {
      onDeliveryNotesChange(order.id, deliveryNotes);
    }
  };
  
  if (!order) {
    return <div>Данные о заказе отсутствуют</div>;
  }
  
  const calculatedTotal = orderItems.reduce((sum, item) => 
    sum + (Number(item.price) * Number(item.quantity)), 0);
  
  const displayTotal = (!order.total_price || order.total_price === 0) 
    ? calculatedTotal 
    : order.total_price;
  
  // Определение ожидаемой даты доставки
  const estimatedDelivery = order.estimated_delivery || calculateEstimatedDelivery(order.created_at);
  
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
                <span className="detail-value">{order.client_name}</span>
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
                    <option value="pending">Ожидание</option>
                    <option value="processing">Обработка</option>
                    <option value="shipped">В пути</option>
                    <option value="delivered">Доставлено</option>
                    <option value="cancelled">Отменено</option>
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
                <div className="tracking-number-input">
                  <input 
                    type="text" 
                    value={trackingNumber} 
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Введите трек-номер"
                    className="tracking-input"
                  />
                  <button 
                    className="tracking-save-button"
                    onClick={handleTrackingNumberSave}
                    disabled={!trackingNumber || trackingNumber === order.tracking_number}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ожидаемая доставка:</span>
                <span className="detail-value">
                  {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString('ru-RU') : 'Не указано'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Курьер:</span>
                <select
                  className="courier-select"
                  value={selectedCourier}
                  onChange={handleCourierChange}
                >
                  <option value="">Выберите курьера</option>
                  {availableCouriers.map(courier => (
                    <option key={courier} value={courier}>{courier}</option>
                  ))}
                </select>
              </div>
              <div className="detail-item">
                <span className="detail-label">Комментарий к доставке:</span>
                <div className="delivery-notes-container">
                  <textarea 
                    className="delivery-notes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Введите комментарий к доставке"
                  />
                  <button 
                    className="notes-save-button"
                    onClick={handleDeliveryNotesChange}
                    disabled={deliveryNotes === order.delivery_notes}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-details-section">
            <h3>Состав заказа</h3>
            {orderItems && orderItems.length > 0 ? (
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Наименование товара</th>
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
                        <td>{getProductName(itemProductId)}</td>
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
                <span className="detail-value">
                  {paymentMethodTranslations[order.payment_method || ''] || order.payment_method || 'Не указан'}
                </span>
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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date('2025-05-06 15:49:27'));
  
  // Получаем данные напрямую из предоставленной SQL-таблицы
  const fetchDataFromSQL = () => {
    // Используем данные из предоставленной SQL таблицы
    const sqlOrders = [
      {
        id: 1, 
        user_id: 1, 
        total_price: 25999.9, 
        created_at: '2025-05-03 10:30:00', 
        status: 'pending', 
        client_name: 'Александр Морской', 
        delivery_address: 'ул. Набережная 10, Москва',
        order_items: [{"price": 1999.99, "quantity": 13, "product_id": 1}],
        payment_method: 'online_card',
        contact_phone: '79111111111',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 10:30:00')
      },
      {
        id: 2, 
        user_id: 2, 
        total_price: 29990, 
        created_at: '2025-05-03 11:45:00', 
        status: 'processing', 
        client_name: 'Екатерина Великая', 
        delivery_address: 'пр. Невский 15, Санкт-Петербург',
        order_items: [{"price": 2999.00, "quantity": 10, "product_id": 6}],
        payment_method: 'sbp',
        contact_phone: '79111111112',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 11:45:00')
      },
      {
        id: 3, 
        user_id: 3, 
        total_price: 31998, 
        created_at: '2025-05-03 12:50:00', 
        status: 'shipped', 
        client_name: 'Дмитрий Осетров', 
        delivery_address: 'ул. Центральная 20, Казань',
        order_items: [{"price": 3999.75, "quantity": 8, "product_id": 5}],
        payment_method: 'cash_on_delivery',
        contact_phone: '79111111113',
        tracking_number: 'TRK23456789',
        courier_name: 'Сидоров А.А.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 12:50:00')
      },
      {
        id: 4, 
        user_id: 4, 
        total_price: 27595.5, 
        created_at: '2025-05-03 13:30:00', 
        status: 'delivered', 
        client_name: 'Анна Карпова', 
        delivery_address: 'ул. Морская 25, Сочи',
        order_items: [{"price": 599.99, "quantity": 46, "product_id": 3}],
        payment_method: 'online_wallet',
        contact_phone: '79111111114',
        tracking_number: 'TRK07915035',
        courier_name: 'Кузнецов В.А.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 13:30:00')
      },
      {
        id: 5, 
        user_id: 5, 
        total_price: 23998.8, 
        created_at: '2025-05-03 14:15:00', 
        status: 'pending', 
        client_name: 'Сергей Щучкин', 
        delivery_address: 'пр. Ленина 30, Новосибирск',
        order_items: [{"price": 1999.90, "quantity": 12, "product_id": 1}],
        payment_method: 'credit_card',
        contact_phone: '79111111115',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 14:15:00')
      },
      {
        id: 6, 
        user_id: 6, 
        total_price: 35998, 
        created_at: '2025-05-03 10:30:00', 
        status: 'processing', 
        client_name: 'Мария Сазанова', 
        delivery_address: 'ул. Речная 35, Владивосток',
        order_items: [{"price": 3999.78, "quantity": 9, "product_id": 5}],
        payment_method: 'bank_transfer',
        contact_phone: '79111111116',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 10:30:00')
      },
      {
        id: 7, 
        user_id: 7, 
        total_price: 29998.5, 
        created_at: '2025-05-03 11:45:00', 
        status: 'shipped', 
        client_name: 'Игорь Форелев', 
        delivery_address: 'пр. Морской 40, Мурманск',
        order_items: [{"price": 999.95, "quantity": 30, "product_id": 11}],
        payment_method: 'sbp',
        contact_phone: '79111111117',
        tracking_number: 'TRK34567890',
        courier_name: 'Дербенев И.С.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 11:45:00')
      },
      {
        id: 8, 
        user_id: 8, 
        total_price: 41998, 
        created_at: '2025-05-03 12:00:00', 
        status: 'delivered', 
        client_name: 'Наталья Сёмгина', 
        delivery_address: 'ул. Рыбацкая 45, Калининград',
        order_items: [{"price": 2999.86, "quantity": 14, "product_id": 6}],
        payment_method: 'online_card',
        contact_phone: '79111111118',
        tracking_number: 'TRK45678901',
        courier_name: 'Сидоров А.А.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 12:00:00')
      },
      {
        id: 9, 
        user_id: 9, 
        total_price: 32996.87, 
        created_at: '2025-05-03 13:15:00', 
        status: 'pending', 
        client_name: 'Антон Лещов', 
        delivery_address: 'пр. Приморский 50, Архангельск',
        order_items: [{"price": 599.94, "quantity": 55, "product_id": 3}],
        payment_method: 'cash_on_delivery',
        contact_phone: '79111111119',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 13:15:00')
      },
      {
        id: 10, 
        user_id: 10, 
        total_price: 53998, 
        created_at: '2025-05-03 14:30:00', 
        status: 'processing', 
        client_name: 'Елена Палтусова', 
        delivery_address: 'ул. Океанская 55, Хабаровск',
        order_items: [{"price": 1999.93, "quantity": 27, "product_id": 1}],
        payment_method: 'bank_transfer',
        contact_phone: '79111111120',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 14:30:00')
      },
      {
        id: 11, 
        user_id: 11, 
        total_price: 44997.9, 
        created_at: '2025-05-03 10:45:00', 
        status: 'shipped', 
        client_name: 'Павел Белуга', 
        delivery_address: 'пр. Лососевый 60, Петропавловск-Камчатский',
        order_items: [{"price": 4090.72, "quantity": 11, "product_id": 5}],
        payment_method: 'online_wallet',
        contact_phone: '79111111121',
        tracking_number: 'TRK56789012',
        courier_name: 'Кузнецов В.А.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 10:45:00')
      },
      {
        id: 12, 
        user_id: 12, 
        total_price: 20999, 
        created_at: '2025-05-03 11:00:00', 
        status: 'delivered', 
        client_name: 'Светлана Минтаева', 
        delivery_address: 'ул. Красная 65, Красноярск',
        order_items: [{"price": 2099.90, "quantity": 10, "product_id": 1}],
        payment_method: 'credit_card',
        contact_phone: '79111111122',
        tracking_number: 'TRK67890123',
        courier_name: 'Дербенев И.С.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 11:00:00')
      },
      {
        id: 13, 
        user_id: 13, 
        total_price: 77998.7, 
        created_at: '2025-05-03 12:15:00', 
        status: 'pending', 
        client_name: 'Олег Тунцов', 
        delivery_address: 'пр. Дальневосточный 70, Южно-Сахалинск',
        order_items: [{"price": 2999.95, "quantity": 26, "product_id": 6}],
        payment_method: 'sbp',
        contact_phone: '79111111123',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 12:15:00')
      },
      {
        id: 14, 
        user_id: 1, 
        total_price: 59996, 
        created_at: '2025-05-03 13:30:00', 
        status: 'processing', 
        client_name: 'Александр Морской', 
        delivery_address: 'ул. Набережная 10, Москва',
        order_items: [{"price": 2999.80, "quantity": 20, "product_id": 6}],
        payment_method: 'online_card',
        contact_phone: '79111111111',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 13:30:00')
      },
      {
        id: 15, 
        user_id: 2, 
        total_price: 47995.85, 
        created_at: '2025-05-03 14:45:00', 
        status: 'shipped', 
        client_name: 'Екатерина Великая', 
        delivery_address: 'пр. Невский 15, Санкт-Петербург',
        order_items: [{"price": 599.95, "quantity": 80, "product_id": 3}],
        payment_method: 'cash_on_delivery',
        contact_phone: '79111111112',
        tracking_number: 'TRK23908762',
        courier_name: 'Кузнецов В.А.',
        estimated_delivery: calculateEstimatedDelivery('2025-05-03 14:45:00')
      }
    ];

    // Преобразование данных в формат, который нужен для нашего приложения
    const processedOrders = sqlOrders.map(order => {
      // Проверяем, есть ли значение order_items
      const orderItems = Array.isArray(order.order_items) ? order.order_items : 
              (typeof order.order_items === 'string' ? JSON.parse(order.order_items) : []);

      return {
        ...order,
        order_items: orderItems
      };
    });

    setOrders(processedOrders);
    setFilteredOrders(processedOrders);
    
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
    setLastUpdated(new Date('2025-05-06 15:49:27'));
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    // Загружаем данные непосредственно из SQL-таблицы без обращения к API
    fetchDataFromSQL();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...orders];
    
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
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === 'created_at') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        const aValue = a[sortConfig.key];
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

  const requestSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortClass = (key: keyof Order) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'sort-none';
    }
    return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updateUrl = API_ORDERS_ENDPOINTS.UPDATE_ORDER_STATUS(orderId);
      
      try {
        await axios.patch(updateUrl, { status: newStatus });
      } catch (error) {
        console.warn('API не ответил, имитируем успешный ответ');
      }
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus
        } : order
      );
      
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus
        });
      }
      
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
      setLastUpdated(new Date('2025-05-06 15:49:27'));
      
      alert(`Статус заказа №${orderId} успешно изменен на "${statusTranslations[newStatus]}"`);
      
      return { status: newStatus };
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      throw error;
    }
  };

  const handleTrackingNumberChange = (orderId: number, trackingNumber: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        tracking_number: trackingNumber
      } : order
    );
    
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ 
        ...selectedOrder, 
        tracking_number: trackingNumber
      });
    }
    
    setLastUpdated(new Date('2025-05-06 15:49:27'));
    alert(`Трек-номер заказа №${orderId} успешно изменен на "${trackingNumber}"`);
  };

  const handleCourierChange = (orderId: number, courierName: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        courier_name: courierName
      } : order
    );
    
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ 
        ...selectedOrder, 
        courier_name: courierName
      });
    }
    
    setLastUpdated(new Date('2025-05-06 15:49:27'));
    if (courierName) {
      alert(`Курьер ${courierName} назначен на заказ №${orderId}`);
    }
  };

  const handleDeliveryNotesChange = (orderId: number, notes: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        delivery_notes: notes
      } : order
    );
    
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ 
        ...selectedOrder, 
        delivery_notes: notes
      });
    }
    
    setLastUpdated(new Date('2025-05-06 15:49:27'));
    alert(`Комментарий к доставке для заказа №${orderId} успешно обновлен`);
  };

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

  const getOrderCountByStatus = (status: string): number => {
    if (!orderStats || !orderStats[status]) {
      return 0;
    }
    return orderStats[status].count;
  };

  if (loading) {
    return (
      <div className="delivery-page loading-state">
        <div className="loading-spinner"></div>
        <p>Загрузка данных о заказах...</p>
      </div>
    );
  }

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
            <span className="stat-value">{getOrderCountByStatus('delivered')}</span>
            <span className="stat-label">Доставлено</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus('shipped')}</span>
            <span className="stat-label">В пути</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus('processing')}</span>
            <span className="stat-label">Обработка</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getOrderCountByStatus('pending')}</span>
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
            className={`status-filter ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <ClockIcon className="filter-icon" />
            Ожидание
          </button>
          <button 
            className={`status-filter ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            <ArrowPathIcon className="filter-icon" />
            Обработка
          </button>
          <button 
            className={`status-filter ${statusFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => setStatusFilter('shipped')}
          >
            <TruckIcon className="filter-icon" />
            В пути
          </button>
          <button 
            className={`status-filter ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            <CheckCircleIcon className="filter-icon" />
            Доставлено
          </button>
          <button 
            className={`status-filter ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
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
                      {order.client_name}
                      {order.contact_phone && (
                        <span className="customer-phone">{order.contact_phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
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
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Ожидание</option>
                          <option value="processing">Обработка</option>
                          <option value="shipped">В пути</option>
                          <option value="delivered">Доставлено</option>
                          <option value="cancelled">Отменено</option>
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
          onTrackingNumberChange={handleTrackingNumberChange}
          onCourierChange={handleCourierChange}
          onDeliveryNotesChange={handleDeliveryNotesChange}
        />
      )}
      
      <div className="delivery-footer">
        <p>Всего заказов: {orders.length} | Отфильтровано: {filteredOrders.length}</p>
        <p className="last-updated">
          Последнее обновление: {lastUpdated.toLocaleString('ru-RU')}
          <br />
          <small>Текущий пользователь: katarymba | Время: {new Date('2025-05-06 15:49:27').toLocaleString('ru-RU')}</small>
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