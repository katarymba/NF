// ais/ais-frontend/src/services/api.ts

export const API_BASE_URL = 'http://localhost:8080/ais';

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

// ais/ais-frontend/src/services/api.ts - Добавить следующие методы

export async function createProduct(productData: any, token: string): Promise<any> {
 const response = await fetch(`${API_ENDPOINTS.api}/products`, {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify(productData)
 });
 
 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(errorData.detail || 'Ошибка при создании товара');
 }
 
 return await response.json();
}

/**
* Обновление существующего товара
*/
export async function updateProduct(productId: number, productData: any, token: string): Promise<any> {
 const response = await fetch(`${API_ENDPOINTS.api}/products/${productId}`, {
   method: 'PUT',
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify(productData)
 });
 
 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(errorData.detail || 'Ошибка при обновлении товара');
 }
 
 return await response.json();
}

/**
* Удаление товара
*/
export async function deleteProduct(productId: number, token: string): Promise<void> {
 const response = await fetch(`${API_ENDPOINTS.api}/products/${productId}`, {
   method: 'DELETE',
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
 
 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(errorData.detail || 'Ошибка при удалении товара');
 }
}