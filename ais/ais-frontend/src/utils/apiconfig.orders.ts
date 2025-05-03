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

// Типы для работы с заказами
export interface Order {
  id: number;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  items?: OrderItem[];
  contactPhone?: string;
  paymentMethod?: string;
  deliveryNotes?: string;
  courierName?: string;
}

export interface OrderItem {
  id: number;
  name: string;
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