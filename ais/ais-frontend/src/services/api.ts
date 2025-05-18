import { getAuthToken, clearAuthToken } from './auth';

// Базовый URL API Gateway
export const API_BASE_URL = 'http://localhost:8080';

// Типы для API данных
export interface Product {
    id: number;
    name: string;
    description: string;
    category_id: number;
    price: number;
    stock_quantity: number;
    created_at: string;
    updated_at: string;
    image_url?: string;
    category_name?: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    parent_id?: number;
}

export interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    product_name: string;
}

// Функции для работы с API
export class APIError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

/**
 * Выполняет запрос к API с токеном авторизации
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`API Request: ${API_BASE_URL}${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            
            // Если 401 - нужна повторная авторизация
            if (response.status === 401) {
                console.log('Clearing auth token due to 401');
                clearAuthToken();
                window.location.href = '/login';
            }
            
            throw new APIError(`API Error: ${response.status} ${response.statusText}`, response.status);
        }

        // Проверка Content-Type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error instanceof APIError ? error : new Error('API Error: ' + error);
    }
};

// API функции для продуктов
export const getProducts = async () => {
    try {
        return await fetchWithAuth('/ais/api/products');
    } catch (error) {
        console.error('Error getting products:', error);
        throw error;
    }
};

export const getProduct = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/products/${id}`);
    } catch (error) {
        console.error(`Error getting product ${id}:`, error);
        throw error;
    }
};

export const createProduct = async (productData: Partial<Product>) => {
    try {
        return await fetchWithAuth('/ais/api/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
        return await fetchWithAuth(`/ais/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
};

export const deleteProduct = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/products/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
};

// API функции для категорий
export const getCategories = async () => {
    try {
        return await fetchWithAuth('/ais/api/categories');
    } catch (error) {
        console.error('Error getting categories:', error);
        throw error;
    }
};

export const getCategory = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/categories/${id}`);
    } catch (error) {
        console.error(`Error getting category ${id}:`, error);
        throw error;
    }
};

export const createCategory = async (categoryData: Partial<Category>) => {
    try {
        return await fetchWithAuth('/ais/api/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
        return await fetchWithAuth(`/ais/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/categories/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw error;
    }
};

// API функции для заказов
export const getOrders = async () => {
    try {
        return await fetchWithAuth('/ais/api/orders');
    } catch (error) {
        console.error('Error getting orders:', error);
        throw error;
    }
};

export const getOrder = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/orders/${id}`);
    } catch (error) {
        console.error(`Error getting order ${id}:`, error);
        throw error;
    }
};

export const createOrder = async (orderData: Partial<Order>) => {
    try {
        return await fetchWithAuth('/ais/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const updateOrder = async (id: number, orderData: Partial<Order>) => {
    try {
        return await fetchWithAuth(`/ais/api/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        throw error;
    }
};

export const deleteOrder = async (id: number) => {
    try {
        return await fetchWithAuth(`/ais/api/orders/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw error;
    }
};