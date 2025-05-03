// ais/ais-frontend/src/services/api.ts

// Исправление: используем относительные URL, чтобы работало с прокси
export const API_BASE_URL = '/ais';

// Добавляем объявление переменной API_ENDPOINTS, которая используется, но не определена
const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  api: `${API_BASE_URL}/api`,
};

// Единая функция для выполнения запросов с обработкой ошибок
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem('token');
    
    // Если нужна авторизация и токен есть
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    // Добавляем индикатор загрузки здесь если нужно
    const response = await fetch(url, options);
    
    // Проверка статуса ответа
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    // Для пустых ответов (например, DELETE запросы)
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error:`, error);
    throw error;
  }
}

/**
 * Вход администратора
 */
export async function loginAsAdmin(username: string, password: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('grant_type', 'password');

  const response = await fetch(`${API_BASE_URL}/administrators/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Ошибка авторизации администратора');
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Получение информации о текущем пользователе
 */
export async function getCurrentUser(): Promise<any> {
  return fetchWithAuth(`${API_BASE_URL}/auth/me`);
}

/**
 * Получение списка товаров
 */
export async function getProducts(categoryId?: number): Promise<any[]> {
  const url = categoryId 
    ? `${API_BASE_URL}/api/products?category_id=${categoryId}` 
    : `${API_BASE_URL}/api/products`;
  
  try {
    return await fetchWithAuth(url);
  } catch (error) {
    console.error('Error getting products:', error);
    // Возвращаем пустой массив в случае ошибки, чтобы не прерывать выполнение программы
    return [];
  }
}

/**
 * Получение списка категорий
 */
export async function getCategories(): Promise<any[]> {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/api/categories`);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

/**
 * Получение списка заказов
 */
export async function getOrders(): Promise<any[]> {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/api/orders`);
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

/**
 * Получение списка платежей
 */
export async function getPayments(): Promise<any[]> {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/api/payments`);
  } catch (error) {
    console.error('Error getting payments:', error);
    return [];
  }
}

/**
 * Получение списка доставок
 */
export async function getShipments(): Promise<any[]> {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/api/shipments`);
  } catch (error) {
    console.error('Error getting shipments:', error);
    return [];
  }
}

/**
 * Создание нового товара
 */
export async function createProduct(productData: any): Promise<any> {
 const response = await fetchWithAuth(`${API_ENDPOINTS.api}/products`, {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(productData)
 });
 
 return response;
}

/**
* Обновление существующего товара
*/
export async function updateProduct(productId: number, productData: any): Promise<any> {
 return fetchWithAuth(`${API_ENDPOINTS.api}/products/${productId}`, {
   method: 'PUT',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(productData)
 });
}

/**
* Удаление товара
*/
export async function deleteProduct(productId: number): Promise<void> {
 await fetchWithAuth(`${API_ENDPOINTS.api}/products/${productId}`, {
   method: 'DELETE'
 });
}

/**
 * Получение пользователя по ID
 */
export async function getUserById(userId: number): Promise<any> {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.api}/users/${userId}`);
  } catch (error) {
    console.error(`Error getting user #${userId}:`, error);
    throw error;
  }
}

/**
 * Получение заказа по ID
 */
export async function getOrderById(orderId: number): Promise<any> {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.api}/orders/${orderId}`);
  } catch (error) {
    console.error(`Error getting order #${orderId}:`, error);
    throw error;
  }
}

/**
 * Получение заказов пользователя
 */
export async function getUserOrders(userId: number): Promise<any[]> {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.api}/users/${userId}/orders`);
  } catch (error) {
    console.error(`Error getting orders for user #${userId}:`, error);
    return [];
  }
}

/**
 * Обновление статуса заказа
 */
export async function updateOrderStatus(orderId: number, status: string): Promise<any> {
  return fetchWithAuth(`${API_ENDPOINTS.api}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
}

/**
 * Обновление адреса доставки
 */
export async function updateDeliveryAddress(orderId: number, deliveryAddress: string): Promise<any> {
  return fetchWithAuth(`${API_ENDPOINTS.api}/orders/${orderId}/delivery-address`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ delivery_address: deliveryAddress })
  });
}