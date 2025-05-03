import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
  amount?: number;
  customer_name?: string;
}

export interface PaymentCreateDTO {
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  amount: number;
  created_at?: string;
}

export interface PaymentUpdateDTO {
  order_id?: number;
  payment_method?: string;
  payment_status?: string;
  transaction_id?: string;
  amount?: number;
  created_at?: string;
}

export interface PaymentFilters {
  paymentMethod?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  searchText?: string;
}

class PaymentService {
  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.paymentMethod) params.append('payment_method', filters.paymentMethod);
        if (filters.paymentStatus) params.append('payment_status', filters.paymentStatus);
        if (filters.dateFrom) params.append('date_from', filters.dateFrom);
        if (filters.dateTo) params.append('date_to', filters.dateTo);
        if (filters.searchText) params.append('search', filters.searchText);
      }
      
      const response = await axios.get(`${API_URL}/api/payments`, { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке платежей:', error);
      throw error;
    }
  }

  async getPaymentById(id: number): Promise<Payment> {
    try {
      const response = await axios.get(`${API_URL}/api/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при загрузке платежа с ID ${id}:`, error);
      throw error;
    }
  }

  async createPayment(payment: PaymentCreateDTO): Promise<Payment> {
    try {
      const response = await axios.post(`${API_URL}/api/payments`, payment);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      throw error;
    }
  }

  async updatePayment(id: number, payment: PaymentUpdateDTO): Promise<Payment> {
    try {
      const response = await axios.put(`${API_URL}/api/payments/${id}`, payment);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении платежа с ID ${id}:`, error);
      throw error;
    }
  }

  async deletePayment(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/payments/${id}`);
    } catch (error) {
      console.error(`Ошибка при удалении платежа с ID ${id}:`, error);
      throw error;
    }
  }

  async getPaymentStatistics(): Promise<{
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    processingPayments: number;
    totalAmount: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/api/payments/statistics`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке статистики платежей:', error);
      throw error;
    }
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}/payments`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при загрузке платежей для заказа с ID ${orderId}:`, error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;