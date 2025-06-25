import { getAuthToken, clearAuthToken } from './auth';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Константы для текущей даты и пользователя
export const CURRENT_DATE = '2025-05-25 19:37:40';
export const CURRENT_USER = 'katarymba';

// Базовые URL API с учетом Docker окружения
export const API_BASE_URL = 'http://localhost:8080/ais';
export const API_FULL_URL = `${API_BASE_URL}/api`;

// API Gateway URL - обновляем на порт 8001
const API_GATEWAY_URL = 'http://localhost:8001';

// Auth URL для входа и работы с токенами
export const AUTH_URL = 'http://localhost:8001';

// Создание конфигурации для разных API
export const API_ENDPOINTS = {
    // Основной API Gateway
    gateway: {
        baseURL: '/ais/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders',
        payments: '/payments',
        stocks: '/stocks',
        warehouses: '/warehouses',
        supplies: '/supplies',
        stockMovements: '/stock-movements'
    },
    // Прямое подключение к backend API
    backend: {
        baseURL: 'http://localhost:8001/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders',
        payments: '/payments',
        stocks: '/stocks',
        warehouses: '/warehouses',
        supplies: '/supplies',
        stockMovements: '/stock-movements'
    },
    // API Север-Рыба
    severRyba: {
        baseURL: 'http://localhost:8000/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders'
    },
    // Auth endpoints
    auth: {
        baseURL: 'http://localhost:8001/ais',
        token: '/administrators/token',
        refresh: '/administrators/refresh',
        me: '/auth/me'
    }
};

// Типы для API данных
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category_id?: number;
    stock_quantity: number;
    image_url?: string;
    created_at: string;
    updated_at?: string;
    sku?: string;
    supplier?: string;
    sr_stock_quantity?: number;
    sr_sync?: boolean;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Order {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
    status: string;
    client_name?: string;
    delivery_address?: string;
    order_items: OrderItem[];
    payment_method?: string;
    payment_status?: string;
}

export interface OrderItem {
    product_id: number;
    quantity: number;
    price: number;
}

// Функции для работы с API
export class APIError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

// Функция для получения токена напрямую из localStorage для отладки
const getTokenDirectly = (): string | null => {
    const TOKEN_KEY = 'token'; // Используем тот же ключ, что в App.tsx
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("getTokenDirectly: token from localStorage:", token ? `${token.substring(0, 10)}...` : "null");
    return token;
};

// Получение токена - убедимся, что всегда берем актуальный токен
const getActualToken = (): string | null => {
    // Пытаемся получить токен через функцию из auth.ts
    const token = getAuthToken();
    
    // Если токен не получен, пробуем взять напрямую из localStorage
    if (!token) {
        const directToken = getTokenDirectly();
        if (directToken) {
            console.warn("Токен получен напрямую из localStorage, но не через getAuthToken()");
            return directToken;
        }
    }
    
    return token;
};

// Создаем единый экземпляр axios с перехватчиками для авторизации
export const apiClient: AxiosInstance = axios.create({
    timeout: 15000, // 15 секунд таймаут
    headers: {
        'Content-Type': 'application/json',
    }
});

// Добавляем перехватчик запросов для автоматического добавления токена
apiClient.interceptors.request.use(
    (config) => {
        // Получаем актуальный токен при каждом запросе
        const token = getActualToken();
        
        if (token) {
            // Удостоверяемся, что заголовки существуют
            if (!config.headers) {
                config.headers = {};
            }
            
            // Устанавливаем заголовок авторизации с токеном
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('API request with token:', config.url);
        } else {
            console.warn('API request without token:', config.url);
            
            // Для отладки: проверяем все ключи в localStorage
            const allKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    allKeys.push(`${key}: ${value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'null'}`);
                }
            }
            console.log("Все ключи в localStorage:", allKeys);
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Добавляем перехватчик ответов для обработки ошибок авторизации
apiClient.interceptors.response.use(
    (response) => {
        console.log('API response success:', response.config.url);
        return response;
    },
    (error) => {
        console.error('API response error:', error.config?.url, error.response?.status);
        
        // Проверяем на 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.warn('Получен 401 Unauthorized, обновление токена');
            
            // Проверяем, не находимся ли мы на странице входа
            if (typeof window !== 'undefined' && 
                window.location && 
                !window.location.pathname.includes('login')) {
                
                // Получаем текущий токен
                const currentToken = getActualToken();
                
                if (!currentToken) {
                    // Если токен уже отсутствует, перенаправляем на страницу входа
                    console.warn('Токен отсутствует, перенаправление на страницу входа');
                    window.location.href = '/login';
                } else {
                    // Если токен есть, но он недействителен - очищаем и перенаправляем
                    console.warn('Токен недействителен, очищаем и перенаправляем на страницу входа');
                    clearAuthToken();
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// Функция для работы с аутентификацией
export const loginUser = async (username: string, password: string) => {
    try {
        // Пробуем несколько разных URL для входа
        const loginEndpoints = [
            `${AUTH_URL}/administrators/token`,
            `http://localhost:8001/ais/administrators/token`,
            `http://localhost:8001/administrators/token`,
            `/ais/administrators/token`
        ];
        
        let lastError = null;
        
        for (const endpoint of loginEndpoints) {
            try {
                console.log(`Trying login at: ${endpoint}`);
                
                const response = await axios.post(endpoint, {
                    username,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Login successful!');
                return response.data;
            } catch (error) {
                console.warn(`Login failed at ${endpoint}:`, error.message);
                lastError = error;
            }
        }
        
        throw lastError || new Error('Не удалось выполнить вход. Все попытки соединения не удались.');
    } catch (error) {
        console.error('Login function error:', error);
        throw error;
    }
};

// ВАЖНО! Оставляем для обратной совместимости с существующими компонентами
export const getAxiosAuthConfig = (): AxiosRequestConfig => {
    const token = getActualToken();
    
    // Логируем состояние токена для диагностики
    if (token) {
        console.log('getAxiosAuthConfig: token present');
    } else {
        console.warn('getAxiosAuthConfig: no token available');
    }
    
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    };
};

// Функция для создания авторизованного axios - оставляем для обратной совместимости
export const createAuthenticatedAxios = () => {
    // Логирование для диагностики
    const token = getActualToken();
    console.log('createAuthenticatedAxios called, token present:', !!token);
    
    // Создаем новый экземпляр axios с текущим токеном
    return axios.create({
        headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    });
};

// Функция для безопасного выполнения API-запросов с пробованием нескольких URL
export const trySeveralEndpoints = async <T>(
    endpoints: string[],
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    data?: any,
    config: AxiosRequestConfig = {}
): Promise<T> => {
    // Проверяем наличие токена перед запросом
    const token = getActualToken();
    console.log(`trySeveralEndpoints (${method}): token ${token ? 'present' : 'missing'}`);
    
    // Добавляем токен в заголовки конфигурации
    const headers = {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
        ...(config.headers || {})
    };
    
    let lastError = null;
    
    // Пробуем каждый эндпоинт с авторизацией
    for (const endpoint of endpoints) {
        try {
            console.log(`Trying ${method.toUpperCase()} request to: ${endpoint}`);
            
            const response = await axios({
                method,
                url: endpoint,
                data,
                ...config,
                headers  // Явно добавляем заголовки с токеном
            });

            console.log(`Successfully got response from ${endpoint}`);
            return response.data;
        } catch (error) {
            console.log(`Failed ${method.toUpperCase()} request to ${endpoint}:`, error.message);
            if (error.response) {
                console.log(`Status code: ${error.response.status}, message: ${error.response.data}`);
            }
            lastError = error;
        }
    }

    // Если все эндпоинты не сработали, проверим не 401 ли ошибка
    if (lastError?.response?.status === 401) {
        console.error('Authentication failed for all endpoints - redirecting to login');
        clearAuthToken();
        
        if (typeof window !== 'undefined' && window.location && !window.location.pathname.includes('login')) {
            window.location.href = '/login';
        }
    }
    
    // Для обеспечения обратной совместимости с кодом,
    // который ожидает пустой массив при ошибке
    console.warn('All API endpoints failed, returning empty array');
    return [] as unknown as T;
};

// Функция для работы с API с поддержкой авторизации через fetch
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    // Получаем актуальный токен
    const token = getActualToken();
    
    const finalEndpoint = endpoint.startsWith('/')
        ? `${API_FULL_URL}${endpoint}`
        : `${API_FULL_URL}/${endpoint}`;

    // Добавляем заголовки с токеном авторизации
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        console.log(`Fetching from: ${finalEndpoint}, token: ${token ? 'present' : 'missing'}`);
        
        const response = await fetch(finalEndpoint, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Если ответ 401 (Unauthorized), очищаем токен и перенаправляем на страницу входа
            if (response.status === 401) {
                console.error('fetchWithAuth: 401 Unauthorized received');
                clearAuthToken();
                
                // Проверяем, что мы не на странице логина
                if (typeof window !== 'undefined' && 
                    window.location && 
                    !window.location.pathname.includes('login')) {
                    window.location.href = '/login';
                }
                throw new Error('Unauthorized: Please login again');
            }

            const errorText = await response.text();
            console.error(`API Error ${response.status}: ${errorText}`);
            throw new APIError(`API Error: ${response.status} ${response.statusText}`, response.status);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error, 'Endpoint:', finalEndpoint);
        throw error;
    }
};

// API функции для продуктов - с проверкой нескольких URL
export const getProducts = async (categoryId?: number) => {
    console.log("Fetching products...");
    
    // Изменяем приоритеты URL и удаляем порт 8080
    const endpoints = [
        `http://localhost:8001/api/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `${API_FULL_URL}/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `${API_BASE_URL}/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `/api/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `/products${categoryId ? `?category_id=${categoryId}` : ''}`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getProduct = async (id: number) => {
    const endpoints = [
        `http://localhost:8001/api/products/${id}`,
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

export const createProduct = async (productData: Partial<Product>) => {
    const endpoints = [
        `http://localhost:8001/api/products`,
        `${API_FULL_URL}/products`,
        `${API_BASE_URL}/products`,
        `/api/products`,
        `/products`
    ];

    return trySeveralEndpoints(endpoints, 'post', productData);
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
    const endpoints = [
        `http://localhost:8001/api/products/${id}`,
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`
    ];

    return trySeveralEndpoints(endpoints, 'put', productData);
};

export const deleteProduct = async (id: number) => {
    const endpoints = [
        `http://localhost:8001/api/products/${id}`,
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`
    ];

    return trySeveralEndpoints(endpoints, 'delete');
};

// API функции для категорий
export const getCategories = async () => {
    console.log("Fetching categories...");

    // Изменяем приоритеты URL и используем преимущественно прямой URL к бэкенду
    const endpoints = [
        `http://localhost:8001/api/categories/`,
        `${API_FULL_URL}/categories/`,
        `${API_BASE_URL}/categories/`,
        `/api/categories/`,
        `/categories/`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getCategory = async (id: number) => {
    const endpoints = [
        `http://localhost:8001/api/categories/${id}`,
        `${API_FULL_URL}/categories/${id}`,
        `${API_BASE_URL}/categories/${id}`,
        `/api/categories/${id}`,
        `/categories/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

// API функции для заказов
export const getOrders = async () => {
    const endpoints = [
        `http://localhost:8001/api/orders`,
        `${API_FULL_URL}/orders`,
        `${API_BASE_URL}/orders`,
        `/api/orders`,
        `/orders`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getOrder = async (id: number) => {
    const endpoints = [
        `http://localhost:8001/api/orders/${id}`,
        `${API_FULL_URL}/orders/${id}`,
        `${API_BASE_URL}/orders/${id}`,
        `/api/orders/${id}`,
        `/orders/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

// API функции для платежей
export const getPayments = async () => {
    const endpoints = [
        `http://localhost:8001/api/payments`,
        `${API_FULL_URL}/payments`,
        `${API_BASE_URL}/payments`,
        `/api/payments`,
        `/payments`
    ];

    return trySeveralEndpoints(endpoints);
};

// Дополнительные функции для склада
export const getStocks = async () => {
    console.log("Fetching stocks...");
    
    // Получаем токен явно перед запросом
    const token = getActualToken();
    console.log("Using auth token for stocks:", token ? "Token present" : "No token");
    
    // Если токен отсутствует, пытаемся получить его снова
    if (!token) {
        // Специальная обработка для /api/stocks
        console.warn("Токен отсутствует при запросе stocks, пытаемся обновить");
        
        // Для отладки выведем сообщение с просьбой проверить localStorage
        console.log("Пожалуйста, проверьте, сохранен ли токен: localStorage.getItem('token')");
        
        // Задержка перед продолжением, чтобы гарантировать применение всех предыдущих изменений
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Создаем специальные заголовки для этого запроса, гарантируя наличие токена
    const headers = {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
    };

    // Используем комбинации URL для /stocks с приоритетом прямого подключения к бэкенду
    const endpoints = [
        `http://localhost:8001/api/stocks/`,
        `http://localhost:8001/api/stocks`,
        `${API_FULL_URL}/stocks/`,
        `${API_BASE_URL}/stocks/`,
        `/api/stocks/`,
        `/stocks/`
    ];

    return trySeveralEndpoints(endpoints, 'get', undefined, { headers });
};

export const getWarehouses = async () => {
    console.log("Fetching warehouses...");

    // Получаем токен явно перед запросом
    const token = getActualToken();
    console.log("Using auth token for warehouses:", token ? "Token present" : "No token");
    
    // Создаем специальные заголовки для этого запроса, гарантируя наличие токена
    const headers = {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
    };

    // Изменяем приоритеты URL и используем суффикс "/" для всех вариантов
    const endpoints = [
        `http://localhost:8001/api/warehouses/`,
        `http://localhost:8001/api/warehouses`,
        `${API_FULL_URL}/warehouses/`,
        `${API_FULL_URL}/warehouses`,
        `${API_BASE_URL}/warehouses/`,
        `${API_BASE_URL}/warehouses`,
        `/api/warehouses/`,
        `/api/warehouses`,
        `/warehouses/`,
        `/warehouses`
    ];

    return trySeveralEndpoints(endpoints, 'get', undefined, { headers });
};

export const getSupplies = async () => {
    const endpoints = [
        `http://localhost:8001/api/supplies/`,
        `http://localhost:8001/api/supplies`,
        `${API_FULL_URL}/supplies/`,
        `${API_FULL_URL}/supplies`,
        `${API_BASE_URL}/supplies/`,
        `${API_BASE_URL}/supplies`,
        `/api/supplies/`,
        `/api/supplies`,
        `/supplies/`,
        `/supplies`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getSuppliers = async () => {
    try {
        const response = await axios.get(`${API_FULL_URL}/suppliers`, getAxiosAuthConfig());
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении поставщиков:', error);
        throw error;
    }
};


export const getStockMovements = async () => {
    const endpoints = [
        `http://localhost:8001/api/stock-movements/`,
        `http://localhost:8001/api/stock-movements`,
        `${API_FULL_URL}/stock-movements/`,
        `${API_FULL_URL}/stock-movements`,
        `${API_BASE_URL}/stock-movements/`,
        `${API_BASE_URL}/stock-movements`,
        `/api/stock-movements/`,
        `/api/stock-movements`,
        `/stock-movements/`,
        `/stock-movements`
    ];

    return trySeveralEndpoints(endpoints);
};

// Текущие пользовательские данные - обновляем с актуальной датой из логов
export const getCurrentDate = () => {
    return CURRENT_DATE; 
};

export const getCurrentUser = () => {
    return CURRENT_USER;
};