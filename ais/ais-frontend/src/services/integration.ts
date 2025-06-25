// ais/ais-frontend/src/services/integration.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/ais';

// Проверка статуса интеграции
export const checkIntegrationStatus = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/integration/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking integration status:', error);
    throw error;
  }
};

// Отправка заказа в Север-Рыбу
export const sendOrderToSeverRyba = async (orderId: number, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/integration/orders/${orderId}/send`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error sending order ${orderId} to Sever-Ryba:`, error);
    throw error;
  }
};

// Запрос информации о наличии товаров
export const requestProductStock = async (productIds: number[], token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/integration/products/stock-request`,
      productIds,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error requesting product stock:', error);
    throw error;
  }
};

// Отправка платежа в Север-Рыбу
export const sendPaymentToSeverRyba = async (paymentId: number, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/integration/payments/${paymentId}/send`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error sending payment ${paymentId} to Sever-Ryba:`, error);
    throw error;
  }
};

// Переподключение к RabbitMQ
export const reconnectRabbitMQ = async (token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/integration/reconnect`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error reconnecting to RabbitMQ:', error);
    throw error;
  }
};

// Полная синхронизация данных
export const runFullSync = async (token: string) => {
  try {
    // Если токен не предоставлен, попытаемся получить его из локального хранилища
    const authToken = token || localStorage.getItem('token');

    if (!authToken) {
      console.error('Authentication token is missing for sync operation');
      throw new Error('Требуется авторизация для синхронизации');
    }

    const response = await axios.post(
        `${API_BASE_URL}/api/integration/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении полной синхронизации:', error);
    throw error;
  }
};