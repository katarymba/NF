import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: number;
  weight?: string;
}

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
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
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
      // Пробуем оба возможных URL для корзины
      const cartApis = [
        `${API_BASE_URL}/cart/`,
        `${API_BASE_URL}/api/cart`
      ];
      
      let success = false;
      
      for (const api of cartApis) {
        try {
          console.log(`Попытка добавления товара в корзину по URL: ${api}`);
          await axios.post(
            api,
            { product_id: productId, quantity },
            { headers }
          );
          success = true;
          break;
        } catch (err) {
          console.error(`Ошибка при добавлении товара в корзину по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось добавить товар в корзину ни по одному из адресов');
      }
      
      // Обновляем корзину после добавления
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Ошибка при добавлении товара в корзину:', err);
      setError('Не удалось добавить товар в корзину');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItemQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для изменения корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для обновления корзины
      const cartItemApis = [
        `${API_BASE_URL}/cart/${cartItemId}`,
        `${API_BASE_URL}/api/cart/${cartItemId}`
      ];
      
      let success = false;
      
      for (const api of cartItemApis) {
        try {
          console.log(`Попытка обновления количества товара по URL: ${api}`);
          await axios.patch(
            api,
            { quantity },
            { headers }
          );
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
      console.error('Ошибка при изменении количества товара:', err);
      setError('Не удалось изменить количество товара');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    const headers = getAuthHeaders();
    
    if (!headers) {
      setError('Для удаления товаров из корзины необходимо авторизоваться');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем оба возможных URL для удаления товара из корзины
      const cartItemApis = [
        `${API_BASE_URL}/cart/${cartItemId}`,
        `${API_BASE_URL}/api/cart/${cartItemId}`
      ];
      
      let success = false;
      
      for (const api of cartItemApis) {
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
      // Пробуем оба возможных URL для очистки корзины
      const cartApis = [
        `${API_BASE_URL}/cart/`,
        `${API_BASE_URL}/api/cart`
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