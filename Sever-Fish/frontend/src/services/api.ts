import axios from 'axios';

// Устанавливаем базовый URL, соответствующий вашему бэкенду
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Создаем экземпляр axios с общими настройками
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Интерцептор для добавления токена авторизации ко всем запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType') || 'bearer';
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  api: `${API_BASE_URL}/api`,
};

/**
 * Получение заголовков авторизации
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `${tokenType} ${token}`
  };
}

/**
 * Логин пользователя. Возвращает JWT токен.
 */
export async function login(username: string, password: string): Promise<any> {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error('Ошибка авторизации');
  }
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(
  userData: { 
    username: string; 
    email: string; 
    password: string;
    phone?: string;
    full_name?: string;
  }
): Promise<any> {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error('Ошибка регистрации пользователя');
  }
}

/**
 * Получение информации о текущем пользователе.
 * ПРИМЕЧАНИЕ: В этой системе информация о пользователе возвращается при логине,
 * поэтому мы используем сохраненные данные вместо дополнительного запроса к API.
 */
export async function getCurrentUser(): Promise<any> {
  try {
    // Проверяем, есть ли у нас данные о пользователе в localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!userId || !username) {
      throw new Error('Данные пользователя не найдены');
    }
    
    // Если у нас есть сохраненные данные пользователя на клиенте
    // Мы можем использовать их вместо запроса к API
    // В этом случае мы возвращаем базовую информацию о пользователе
    return {
      id: Number(userId),
      username: username,
      // Если нужны другие поля, их можно также добавить в localStorage при входе
      email: localStorage.getItem('userEmail') || null,
      phone: localStorage.getItem('userPhone') || null,
      full_name: localStorage.getItem('userFullName') || null
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Ошибка получения информации о пользователе');
  }
}

/**
 * Получение списка товаров (с возможностью фильтрации по категории).
 */
export async function getProducts(categoryId?: number): Promise<any> {
  try {
    const url = categoryId 
      ? `/api/products?category_id=${categoryId}`
      : '/api/products';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Ошибка получения списка товаров');
  }
}

/**
 * Получение информации о товаре по ID.
 */
export async function getProductById(productId: number): Promise<any> {
  try {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error('Ошибка получения информации о товаре');
  }
}

/**
 * Получение корзины пользователя.
 */
export async function getCart(): Promise<any> {
  try {
    const response = await api.get('/api/cart');
    return response.data;
  } catch (error) {
    throw new Error('Ошибка получения корзины');
  }
}

/**
 * Добавление товара в корзину.
 */
export async function addToCart(productId: number, quantity: number = 1): Promise<any> {
  try {
    const response = await api.post('/api/cart/add', {
      product_id: productId,
      quantity
    });
    return response.data;
  } catch (error) {
    throw new Error('Ошибка добавления товара в корзину');
  }
}

/**
 * Обновление профиля пользователя.
 */
export async function updateUserProfile(profileData: any): Promise<any> {
  try {
    const response = await api.put('/auth/profile', profileData);
    
    // Обновляем данные в localStorage при успешном обновлении профиля
    if (profileData.full_name) localStorage.setItem('userFullName', profileData.full_name);
    if (profileData.email) localStorage.setItem('userEmail', profileData.email);
    if (profileData.phone) localStorage.setItem('userPhone', profileData.phone);
    
    return response.data;
  } catch (error) {
    throw new Error('Ошибка обновления профиля');
  }
}

/**
 * Изменение пароля пользователя.
 */
export async function changePassword(passwordData: { current_password: string, new_password: string }): Promise<any> {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error('Ошибка изменения пароля');
  }
}