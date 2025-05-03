// Импортируем базовую конфигурацию API
import { API_BASE_URL } from './apiConfig';

// Расширяем конфигурацию для заказов
export const API_ORDERS_ENDPOINTS = {
  // Получить все заказы
  ORDERS: `${API_BASE_URL}/orders`,
  
  // Получить заказ по ID
  ORDER_BY_ID: (id: number) => `${API_BASE_URL}/orders/${id}`,
  
  // Обновить статус заказа
  UPDATE_ORDER_STATUS: (id: number) => `${API_BASE_URL}/orders/${id}/status`,
  
  // Получить статистику по заказам
  ORDERS_STATS: `${API_BASE_URL}/orders/stats`,
  
  // Создать новый заказ
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  
  // Получить заказы по статусу
  ORDERS_BY_STATUS: (status: string) => `${API_BASE_URL}/orders/status/${status}`,
  
  // Получить заказы клиента
  ORDERS_BY_CUSTOMER: (customerId: number) => `${API_BASE_URL}/customers/${customerId}/orders`,
};

// Интерфейс заказа, адаптированный для соответствия бэкенду
export interface Order {
  id: number;
  
  // Основные поля для соответствия бэкенду
  customer_name?: string;
  client_name?: string;
  user_id?: number;
  status: string;
  total_amount?: number;
  total_price?: number;
  created_at?: string;
  tracking_number?: string;
  delivery_address?: string;
  estimated_delivery?: string;
  contact_phone?: string;
  payment_method?: string;
  delivery_notes?: string;
  courier_name?: string;
  items?: OrderItem[];
  order_items?: any;
  
  // Эти поля добавлены для обратной совместимости, если где-то
  // в коде используются camelCase имена
  customerName?: string;
  totalAmount?: number;
  createdAt?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  contactPhone?: string;
  paymentMethod?: string;
  deliveryNotes?: string;
  courierName?: string;
}

export interface OrderItem {
  id: number;
  product_id?: number;     // Для совместимости с бэкендом
  name: string;
  product_name?: string;   // Для совместимости с бэкендом
  quantity: number;
  price: number;
}

// Перечисление статусов доставки
export enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}