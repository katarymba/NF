import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

// Функция получения конфигурации для авторизации
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('access_token') || 
                sessionStorage.getItem('token');
                
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

// API для работы с поставками
export const suppliesApi = {
  // Получение всех поставок
  getAllSupplies: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/supplies`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении поставок:', error);
      throw error;
    }
  },

  // Получение поставки по ID
  getSupplyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/supplies/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении поставки ${id}:`, error);
      throw error;
    }
  },

  // Создание новой поставки
  createSupply: async (data) => {
    try {
      // Для отладки
      console.log('Отправка данных поставки:', JSON.stringify(data, null, 2));
      console.log('Заголовки:', getAuthHeaders());
      
      const response = await axios.post(`${API_BASE_URL}/api/supplies`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании поставки:', error);
      
      // Проверка, есть ли тело ответа в ошибке
      if (error.response) {
        console.error('Статус ошибки:', error.response.status);
        console.error('Данные ошибки:', error.response.data);
      }
      
      throw error;
    }
  },

  // Обработка поставки
  processSupply: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/supplies/${id}/process`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обработке поставки ${id}:`, error);
      throw error;
    }
  }
};

export default suppliesApi;