import { apiClient } from './apiClient';
import { API_ORDERS_ENDPOINTS, Order, DeliveryStatus } from '../utils/apiconfig.orders';

// Интерфейс для заказа с дополнительной информацией о платеже
export interface OrderWithPayment extends Order {
  payment_method?: string;
  payment_status?: string;
  transaction_id?: string;
  payment_created_at?: string;
}

// Получение всех заказов с информацией о платежах
export const getOrdersWithPayments = async (): Promise<OrderWithPayment[]> => {
  try {
    const response = await apiClient.get('/api/orders/with-payments');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении заказов с платежами:', error);
    throw error;
  }
};

// Получение информации о конкретном заказе с платежом
export const getOrderWithPaymentById = async (orderId: number): Promise<OrderWithPayment> => {
  try {
    const response = await apiClient.get(`/api/orders/${orderId}/with-payment`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении заказа #${orderId} с платежом:`, error);
    throw error;
  }
};

// Обновление статуса заказа
export const updateOrderStatus = async (orderId: number, status: DeliveryStatus): Promise<Order> => {
  try {
    const response = await apiClient.patch(
      API_ORDERS_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), 
      { status }
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении статуса заказа #${orderId}:`, error);
    throw error;
  }
};

// Обновление данных заказа
export const updateOrder = async (orderId: number, orderData: Partial<Order>): Promise<Order> => {
  try {
    const response = await apiClient.patch(
      API_ORDERS_ENDPOINTS.ORDER_BY_ID(orderId),
      orderData
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении заказа #${orderId}:`, error);
    throw error;
  }
};

// Экспорт заказов в Excel
export const exportOrdersToExcel = (): string => {
  return `${API_ORDERS_ENDPOINTS.ORDERS}/export?format=excel`;
};

// Поиск заказов по параметрам
export const searchOrders = async (params: {
  query?: string;
  status?: DeliveryStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Order[]; total: number }> => {
  try {
    const response = await apiClient.get(API_ORDERS_ENDPOINTS.ORDERS, { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при поиске заказов:', error);
    throw error;
  }
};