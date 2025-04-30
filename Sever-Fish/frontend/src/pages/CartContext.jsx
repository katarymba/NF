import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { Product } from './ProductContext';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем токен аутентификации
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    
    if (!token) {
      return null;
    }
    
    return {
      Authorization: `${tokenType} ${token}`
    };
  };

  // Функция для получения корзины с сервера
  const fetchCart = useCallback(async () => {
    const headers = getAuthHeaders();
    
    // Если пользователь не авторизован, не загружаем корзину
    if (!headers) {
      setCartItems([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Список возможных API для получения корзины
    const cartApis = [
      `${API_BASE_URL}/cart`,
      `${API_BASE_URL}/api/cart`,
      `${API_BASE_URL}/cart/`
    ];
    
    for (const api of cartApis) {
      try {
        console.log(`Попытка запроса корзины по адресу: ${api}`);
        const res = await axios.get(api, { headers });
        console.log("Данные корзины:", res.data);
        
        // Проверяем формат данных и обрабатываем разные варианты ответа
        if (Array.isArray(res.data)) {
          // Если сервер вернул массив, используем его напрямую
          setCartItems(res.data);
        } else if (res.data && Array.isArray(res.data.items)) {
          // Если сервер вернул объект с массивом items
          setCartItems(res.data.items);
        } else if (res.data && Array.isArray(res.data.cart_items)) {
          // Если сервер вернул объект с массивом cart_items
          setCartItems(res.data.cart_items);
        } else {
          // Если ни один формат не подошел, просто логируем данные
          console.log("Неизвестный формат данных корзины:", res.data);
          setCartItems([]);
        }
        
        return; // Успешно получили данные
      } catch (err) {
        console.error(`Ошибка при запросе корзины по ${api}:`, err);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    console.error('Не удалось загрузить корзину ни по одному адресу.');
    setError('Не удалось загрузить корзину');
    setCartItems([]);
    
    setIsLoading(false);
  }, []);

  // Загружаем корзину при инициализации и при изменении токена
  useEffect(() => {
    fetchCart();
    
    // Проверяем наличие токена для повторной загрузки при его изменении
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [fetchCart]);

  // Добавление товара в корзину
  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для добавления товаров в корзину необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Список возможных API для добавления товара
    const cartApis = [
      `${API_BASE_URL}/cart`,
      `${API_BASE_URL}/api/cart`,
      `${API_BASE_URL}/cart/`
    ];
    
    for (const api of cartApis) {
      try {
        console.log(`Попытка добавления товара ${productId} в корзину по адресу: ${api}`);
        await axios.post(
          api,
          { product_id: productId, quantity },
          { headers }
        );
        
        // Обновляем корзину после добавления
        await fetchCart();
        return true;
      } catch (err) {
        console.error(`Ошибка при добавлении товара в корзину по ${api}:`, err);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    setError('Не удалось добавить товар в корзину');
    setIsLoading(false);
    return false;
  };

  // Обновление количества товара в корзине
  const updateCartItemQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для изменения корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Список возможных API для обновления товара
    const updateApis = [
      `${API_BASE_URL}/cart/${cartItemId}`,
      `${API_BASE_URL}/api/cart/${cartItemId}`,
      `${API_BASE_URL}/cart/item/${cartItemId}`
    ];
    
    for (const api of updateApis) {
      try {
        console.log(`Попытка обновления товара ${cartItemId} в корзине по адресу: ${api}`);
        await axios.put(
          api,
          { quantity },
          { headers }
        );
        
        // Обновляем корзину после изменения
        await fetchCart();
        return true;
      } catch (err) {
        console.error(`Ошибка при обновлении товара в корзине по ${api}:`, err);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    setError('Не удалось изменить количество товара');
    setIsLoading(false);
    return false;
  };

  // Удаление товара из корзины
  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для удаления товаров из корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Список возможных API для удаления товара
    const deleteApis = [
      `${API_BASE_URL}/cart/${cartItemId}`,
      `${API_BASE_URL}/api/cart/${cartItemId}`,
      `${API_BASE_URL}/cart/item/${cartItemId}`
    ];
    
    for (const api of deleteApis) {
      try {
        console.log(`Попытка удаления товара ${cartItemId} из корзины по адресу: ${api}`);
        await axios.delete(api, { headers });
        
        // Обновляем корзину после удаления
        await fetchCart();
        return true;
      } catch (err) {
        console.error(`Ошибка при удалении товара из корзины по ${api}:`, err);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    setError('Не удалось удалить товар из корзины');
    setIsLoading(false);
    return false;
  };

  // Очистка корзины
  const clearCart = async (): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для очистки корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Список возможных API для очистки корзины
    const clearApis = [
      `${API_BASE_URL}/cart`,
      `${API_BASE_URL}/api/cart`,
      `${API_BASE_URL}/cart/clear`
    ];
    
    for (const api of clearApis) {
      try {
        console.log(`Попытка очистки корзины по адресу: ${api}`);
        await axios.delete(api, { headers });
        setCartItems([]);
        setIsLoading(false);
        return true;
      } catch (err) {
        console.error(`Ошибка при очистке корзины по ${api}:`, err);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    setError('Не удалось очистить корзину');
    setIsLoading(false);
    return false;
  };

  // Обновление корзины (экспортируем для внешнего использования)
  const refreshCart = async (): Promise<void> => {
    await fetchCart();
  };

  // Вычисляем общее количество товаров в корзине
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      isLoading,
      error,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};