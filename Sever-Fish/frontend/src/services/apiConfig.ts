// Базовый URL API
export const API_BASE_URL = "http://127.0.0.1:8000";

// Эндпоинты API
export const API_ENDPOINTS = {
  // Товары и категории
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/products/categories/`,
  PRODUCT_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (slug: string) => `${API_BASE_URL}/products/category/${slug}`,
  
  // Корзина - поддержка обоих возможных путей
  CART: `${API_BASE_URL}/api/cart`,
  CART_ITEM: (id: number) => `${API_BASE_URL}/api/cart/${id}`,
  
  // Альтернативные пути для корзины
  CART_ALT: `${API_BASE_URL}/cart/`,
  CART_ITEM_ALT: (id: number) => `${API_BASE_URL}/cart/${id}`,
  
  // Пользователи и аутентификация
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  USER_PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Заказы - поддержка обоих возможных путей
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDERS_ALT: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  ORDER_BY_ID_ALT: (id: number) => `${API_BASE_URL}/orders/${id}`,
};