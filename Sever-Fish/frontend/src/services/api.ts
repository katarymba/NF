import axios from 'axios';
// Устанавливаем базовый URL, соответствующий вашему бэкенду
export const API_BASE_URL = 'http://127.0.0.1:8000';

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
 * Проверяет несколько маршрутов, чтобы найти рабочий.
 */
export async function getProducts(url: string = '/products'): Promise<any[]> {
    // Список возможных путей для проверки
    const possiblePaths = [
        `${API_ENDPOINTS.api}${url}`,
        `${API_BASE_URL}${url}`,
        `${API_BASE_URL}/api${url}`
    ];
    
    let lastError = null;
    
    // Пробуем каждый путь по очереди
    for (const path of possiblePaths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log(`Ошибка при запросе к ${path}:`, error);
            lastError = error;
        }
    }
    
    // Если все попытки не удались, бросаем последнюю ошибку
    throw new Error(`Ошибка получения товаров: ${lastError?.message || 'Не удалось найти рабочий маршрут API'}`);
}

/**
 * Получение списка категорий.
 * Проверяет несколько маршрутов, чтобы найти рабочий.
 */
export async function getCategories(): Promise<any[]> {
    // Список возможных путей для проверки
    const possiblePaths = [
        `${API_ENDPOINTS.api}/categories`,
        `${API_BASE_URL}/categories`,
        `${API_BASE_URL}/api/categories`,
        `${API_BASE_URL}/products/categories`
    ];
    
    let lastError = null;
    
    // Пробуем каждый путь по очереди
    for (const path of possiblePaths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log(`Ошибка при запросе категорий к ${path}:`, error);
            lastError = error;
        }
    }
    
    // Если все попытки не удались, бросаем последнюю ошибку
    throw new Error(`Ошибка получения категорий: ${lastError?.message || 'Не удалось найти рабочий маршрут API'}`);
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

/**
 * Проверяет доступность различных маршрутов API и возвращает рабочий маршрут.
 * Полезно для отладки проблем с API.
 */
export async function checkApiRoutes() {
    const routes = [
        { name: 'Корень API', path: API_BASE_URL },
        { name: 'Статус здоровья', path: `${API_BASE_URL}/health` },
        { name: 'API продуктов (с префиксом)', path: `${API_BASE_URL}/api/products` },
        { name: 'API продуктов (без префикса)', path: `${API_BASE_URL}/products` },
        { name: 'API категорий (с префиксом)', path: `${API_BASE_URL}/api/categories` },
        { name: 'API категорий (без префикса)', path: `${API_BASE_URL}/categories` },
        { name: 'API категорий (альт. путь)', path: `${API_BASE_URL}/products/categories` }
    ];
    
    const results = [];
    
    for (const route of routes) {
        try {
            const response = await fetch(route.path);
            results.push({
                name: route.name,
                path: route.path,
                status: response.status,
                ok: response.ok,
                data: response.ok ? await response.json() : null
            });
        } catch (error) {
            results.push({
                name: route.name,
                path: route.path,
                error: error.message
            });
        }
    }
    
    return results;
}