/**
 * Модели данных для пользователей и заказов
 * @file src/models/types.ts
 * @author katarymba
 * @date 2025-05-03
 */

// Типы для пользователей
export interface User {
    id: number;
    username: string;
    email: string;
    phone: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
    role: string;
  }
  
  // Типы для элементов заказа
  export interface OrderItem {
    product_id: number;
    price: number;
    quantity: number;
  }
  
  // Типы для заказов
  export interface Order {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    client_name: string;
    delivery_address: string;
    order_items: OrderItem[];
  }
  
  // Константы для статусов заказа
  export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered'
  };
  
  // Получение русского текстового представления статуса
  export const getStatusText = (status: string): string => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'Ожидает обработки';
      case ORDER_STATUS.PROCESSING:
        return 'В обработке';
      case ORDER_STATUS.SHIPPED:
        return 'Отправлен';
      case ORDER_STATUS.DELIVERED:
        return 'Доставлен';
      default:
        return 'Неизвестный статус';
    }
  };
  
  // Получение класса CSS для статуса
  export const getStatusClass = (status: string): string => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'status-pending';
      case ORDER_STATUS.PROCESSING:
        return 'status-processing';
      case ORDER_STATUS.SHIPPED:
        return 'status-shipped';
      case ORDER_STATUS.DELIVERED:
        return 'status-delivered';
      default:
        return 'status-unknown';
    }
  };
  
  // Форматирование цены
  export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  // Форматирование даты
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };