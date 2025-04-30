import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Базовый URL API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Типы
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: number;
  stock_quantity?: number;
  weight?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  user_id?: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateCartItemQuantity: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
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
    const tokenType = localStorage.getItem('tokenType');
    
    if (!token || !tokenType) {
      return null;
    }
    
    return {
      Authorization: `${tokenType} ${token}`
    };
  };

  // Загружаем корзину при инициализации
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const headers = getAuthHeaders();
    
    // Если пользователь не авторизован, не загружаем корзину
    if (!headers) {
      setCartItems([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для корзины
      const cartApis = [
        `${API_BASE_URL}/cart/`,
        `${API_BASE_URL}/api/cart`
      ];
      
      let success = false;
      
      for (const api of cartApis) {
        try {
          console.log(`Попытка получения корзины по URL: ${api}`);
          const res = await axios.get(api, { headers });
          setCartItems(res.data);
          success = true;
          break;
        } catch (err) {
          console.error(`Ошибка при запросе корзины по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось загрузить корзину ни по одному из адресов');
      }
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err);
      setError('Не удалось загрузить корзину');
      
      // Если ошибка авторизации, очищаем корзину
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setCartItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для добавления товаров в корзину необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Добавление товара ${productId} в корзину по адресу: ${API_BASE_URL}/api/cart`);
      
      // Сначала пробуем основной API
      try {
        await axios.post(
          `${API_BASE_URL}/api/cart`,
          { product_id: productId, quantity },
          { headers }
        );
        await fetchCart();
        return true;
      } catch (err) {
        console.error(`Ошибка при добавлении в корзину по ${API_BASE_URL}/api/cart:`, err);
        
        // Если основной API не сработал, пробуем резервный
        console.log(`Добавление товара ${productId} в корзину по адресу: ${API_BASE_URL}/cart/`);
        await axios.post(
          `${API_BASE_URL}/cart/`,
          { product_id: productId, quantity },
          { headers }
        );
        
        await fetchCart();
        return true;
      }
    } catch (err) {
      console.error(`Ошибка при добавлении в корзину по ${API_BASE_URL}/cart/:`, err);
      setError('Не удалось добавить товар в корзину');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItemQuantity = async (cartId: number, quantity: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для изменения количества товара необходимо авторизоваться');
      return false;
    }
    
    if (quantity < 1) {
      return await removeFromCart(cartId);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для корзины
      const cartApis = [
        `${API_BASE_URL}/cart/${cartId}?quantity=${quantity}`,
        `${API_BASE_URL}/api/cart/${cartId}?quantity=${quantity}`
      ];
      
      let success = false;
      
      for (const api of cartApis) {
        try {
          console.log(`Попытка обновления количества товара по URL: ${api}`);
          await axios.put(api, {}, { headers });
          success = true;
          break;
        } catch (err) {
          console.error(`Ошибка при обновлении количества товара по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось обновить количество товара ни по одному из адресов');
      }
      
      // Обновляем корзину после изменения
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении количества товара:', err);
      setError('Не удалось обновить количество товара');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartId: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для удаления товара из корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для корзины
      const cartApis = [
        `${API_BASE_URL}/cart/${cartId}`,
        `${API_BASE_URL}/api/cart/${cartId}`
      ];
      
      let success = false;
      
      for (const api of cartApis) {
        try {
          console.log(`Попытка удаления товара из корзины по URL: ${api}`);
          await axios.delete(api, { headers });
          success = true;
          break;
        } catch (err) {
          console.error(`Ошибка при удалении товара из корзины по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось удалить товар из корзины ни по одному из адресов');
      }
      
      // Обновляем корзину после удаления
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Ошибка при удалении товара из корзины:', err);
      setError('Не удалось удалить товар из корзины');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для очистки корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для корзины
      const cartApis = [
        `${API_BASE_URL}/cart/clear`,
        `${API_BASE_URL}/api/cart/clear`
      ];
      
      let success = false;
      
      for (const api of cartApis) {
        try {
          console.log(`Попытка очистки корзины по URL: ${api}`);
          await axios.delete(api, { headers });
          success = true;
          break;
        } catch (err) {
          console.error(`Ошибка при очистке корзины по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось очистить корзину ни по одному из адресов');
      }
      
      // Обновляем корзину после очистки
      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Ошибка при очистке корзины:', err);
      setError('Не удалось очистить корзину');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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