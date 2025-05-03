// Базовый URL API
export const API_BASE_URL = "http://127.0.0.1:8001";

// Эндпоинты API
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/products/categories/`,
  PRODUCT_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (slug: string) => `${API_BASE_URL}/products/category/${slug}`,
  CART: `${API_BASE_URL}/cart/`,
};