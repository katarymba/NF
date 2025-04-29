// Базовый URL API
export const API_BASE_URL = "http://127.0.0.1:8000";

// Эндпоинты API
export const API_ENDPOINTS = {
  // Товары и категории
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/products/categories/`,
  PRODUCT_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (slug: string) => `${API_BASE_URL}/products/category/${slug}`,
  
  // Корзина
  CART: `${API_BASE_URL}/cart/`,
  CART_ITEM: (id: number) => `${API_BASE_URL}/cart/${id}`,
  
  // Пользователи и аутентификация
  LOGIN: `${API_BASE_URL}/users/token`,
  REGISTER: `${API_BASE_URL}/users/register`,
  // Исправляем пути для профиля и заказов
  USER_PROFILE: `${API_BASE_URL}/users/me`,
  
  // Заказы
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id: number) => `${API_BASE_URL}/orders/${id}`,
};