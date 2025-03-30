export const API_BASE_URL = 'http://localhost:8000';

const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    api: `${API_BASE_URL}/api`,
};

/**
 * Логин пользователя. Возвращает JWT токен.
 */
export async function login(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_ENDPOINTS.auth}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка авторизации');
    }
    const data = await response.json();
    return data.access_token;
}

/**
 * Регистрация нового пользователя (только для админа).
 */
export async function registerUser(
    user: { username: string; email: string; password: string },
    token: string
): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error('Ошибка регистрации пользователя');
    }
    return await response.json();
}

/**
 * Получение информации о текущем пользователе.
 */
export async function getCurrentUser(token: string): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения информации о пользователе');
    }
    return await response.json();
}

/**
 * Получение списка товаров (с возможностью фильтрации по категории).
 */
export async function getProducts(url: string = '/products'): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}${url}`);
    if (!response.ok) {
        throw new Error('Ошибка получения товаров');
    }
    return await response.json();
}

/**
 * Получение списка категорий.
 */
export async function getCategories(): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/categories`);
    if (!response.ok) {
        throw new Error('Ошибка получения категорий');
    }
    return await response.json();
}

/**
 * Получение списка заказов для текущего пользователя.
 */
export async function getOrders(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения заказов');
    }
    return await response.json();
}

/**
 * Получение списка платежей для текущего пользователя.
 */
export async function getPayments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения платежей');
    }
    return await response.json();
}

/**
 * Получение списка доставок для текущего пользователя.
 */
export async function getShipments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения доставок');
    }
    return await response.json();
}