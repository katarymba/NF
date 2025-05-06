/**
 * Конфигурация API для фронтенд-приложения
 * @file ais/ais-frontend/src/utils/apiConfig.ts
 * @author katarymba
 * @date 2025-05-06 16:44:22
 */

import axios from 'axios';

// Базовый URL API
export const API_BASE_URL = "http://127.0.0.1:8001";

// Создание экземпляра axios с базовым URL
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок аутентификации
    if (error.response && error.response.status === 401) {
      // Очистка токена и перенаправление на страницу входа
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Эндпоинты API
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/products/categories/`,
  PRODUCT_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (slug: string) => `${API_BASE_URL}/products/category/${slug}`,
  CART: `${API_BASE_URL}/cart/`,
};

// API эндпоинты для управления доставками
export const API_DELIVERY_ENDPOINTS = {
  // Получение списка заказов с доставкой
  GET_ORDERS: `${API_BASE_URL}/api/delivery/orders`,
  GET_ORDER_BY_ID: (id: number) => `${API_BASE_URL}/api/delivery/orders/${id}`,
  UPDATE_ORDER: (id: number) => `${API_BASE_URL}/api/delivery/orders/${id}`,
  GET_STATS: `${API_BASE_URL}/api/delivery/stats`,
  GET_COURIERS: `${API_BASE_URL}/api/delivery/couriers`,
  EXPORT_DATA: `${API_BASE_URL}/api/delivery/export`,
  
  // Функции-обертки для удобного использования
  getOrders: (params = {}) => apiClient.get('/api/delivery/orders', { params }),
  getOrderById: (id: number) => apiClient.get(`/api/delivery/orders/${id}`),
  updateDelivery: (id: number, data: any) => apiClient.put(`/api/delivery/orders/${id}`, data),
  getCouriers: () => apiClient.get('/api/delivery/couriers'),
  getStats: (params = {}) => apiClient.get('/api/delivery/stats', { params }),
  exportData: (params = {}) => apiClient.get('/api/delivery/export', { 
    params,
    responseType: 'blob' // Для скачивания файлов
  }),
};

// API эндпоинты для других функций приложения
export const API_ORDERS_ENDPOINTS = {
  // Получение всех заказов
  GET_ALL: `${API_BASE_URL}/api/orders`,
  GET_BY_ID: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  CREATE: `${API_BASE_URL}/api/orders`,
  UPDATE: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  DELETE: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Функции-обертки для удобного использования
  getAll: (params = {}) => apiClient.get('/api/orders', { params }),
  getById: (id: number) => apiClient.get(`/api/orders/${id}`),
  create: (data: any) => apiClient.post('/api/orders', data),
  update: (id: number, data: any) => apiClient.put(`/api/orders/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/orders/${id}`),
};

export const API_PRODUCTS_ENDPOINTS = {
  // Получение всех товаров
  GET_ALL: `${API_BASE_URL}/api/products`,
  GET_BY_ID: (id: number) => `${API_BASE_URL}/api/products/${id}`,
  CREATE: `${API_BASE_URL}/api/products`,
  UPDATE: (id: number) => `${API_BASE_URL}/api/products/${id}`,
  DELETE: (id: number) => `${API_BASE_URL}/api/products/${id}`,
  
  // Функции-обертки для удобного использования
  getAll: (params = {}) => apiClient.get('/api/products', { params }),
  getById: (id: number) => apiClient.get(`/api/products/${id}`),
  create: (data: any) => apiClient.post('/api/products', data),
  update: (id: number, data: any) => apiClient.put(`/api/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/products/${id}`),
};

// Интерфейсы для работы с доставками
export interface DeliveryStatus {
  PENDING: 'pending';
  PROCESSING: 'processing';
  SHIPPED: 'shipped';
  DELIVERED: 'delivered';
  CANCELLED: 'cancelled';
}

export interface Order {
  id: number;
  client_name: string;
  user_id?: number;
  status: string;
  total_price: number;
  created_at: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_address?: string;
  estimated_delivery?: string;
  delivery_notes?: string;
  contact_phone?: string;
  payment_method?: string;
  order_items?: OrderItem[];
  user_info?: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export interface OrderItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Courier {
  name: string;
  orders_count: number;
  last_active?: string;
}

export interface DeliveryUpdateData {
  status?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_address?: string;
  contact_phone?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
}

export interface DeliveryStatistics {
  period: {
    from_date: string;
    to_date: string;
  };
  status_counts: {
    [key: string]: number;
  };
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  courier_stats: Array<{
    name: string;
    orders_count: number;
  }>;
}

// Вспомогательные функции для работы с доставками
export const statusTranslations: Record<string, string> = {
  'pending': 'Ожидание',
  'processing': 'Обработка',
  'shipped': 'В пути',
  'delivered': 'Доставлено',
  'cancelled': 'Отменен'
};

export const paymentMethodTranslations: Record<string, string> = {
  'credit_card': 'Банковская карта',
  'cash': 'Наличные при получении',
  'online_wallet': 'Электронный кошелек',
  'online_card': 'Картой онлайн',
  'sbp': 'СБП',
  'cash_on_delivery': 'Наличными при получении',
  'bank_transfer': 'Банковский перевод'
};

// Форматирование даты для отображения
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Не указано';
  
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return 'Некорректная дата';
  }
};

// Форматирование цены для отображения
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '0 ₽';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

// Экспортируем все для удобного импорта в компонентах
export default {
  API_BASE_URL,
  apiClient,
  endpoints: {
    ...API_ENDPOINTS,
    delivery: API_DELIVERY_ENDPOINTS,
    orders: API_ORDERS_ENDPOINTS,
    products: API_PRODUCTS_ENDPOINTS
  },
  delivery: API_DELIVERY_ENDPOINTS,
  orders: API_ORDERS_ENDPOINTS,
  products: API_PRODUCTS_ENDPOINTS,
  statusTranslations,
  paymentMethodTranslations,
  formatDate,
  formatPrice
};