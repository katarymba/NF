import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Базовый URL для API
  const baseUrl = 'http://127.0.0.1:8000';

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Добавляем параметр для предотвращения кэширования
      const timestamp = new Date().getTime();
      const res = await axios.get(`${baseUrl}/cart/?_=${timestamp}`, {
        // Добавляем timeout и повторные попытки для надежности
        timeout: 5000,
        retry: 2,
        retryDelay: 1000
      });
      setCartItems(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err);
      setError('Не удалось загрузить корзину');
      setIsLoading(false);
      // Установим пустой массив, чтобы приложение могло работать даже при ошибке
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product_id, quantity = 1) => {
    try {
      // Проверка максимального количества
      if (quantity > 99) {
        throw new Error('Максимальное количество товара - 99');
      }
      
      await axios.post(`${baseUrl}/cart/`, { product_id, quantity });
      await fetchCartItems();
    } catch (err) {
      console.error('Ошибка при добавлении товара в корзину:', err);
      // Не блокируем UI при ошибке
      await fetchCartItems();
    }
  };

  const removeFromCart = async (cart_id) => {
    try {
      await axios.delete(`${baseUrl}/cart/${cart_id}`);
      await fetchCartItems();
    } catch (err) {
      console.error('Ошибка при удалении товара из корзины:', err);
      // Не блокируем UI при ошибке
      await fetchCartItems();
    }
  };

  // Обработчик с логикой обновления количества
  const updateCartItemQuantity = async (cart_id, quantity) => {
    try {
      // Проверка допустимых значений
      if (quantity < 1) {
        throw new Error('Количество должно быть не менее 1');
      }
      
      if (quantity > 99) {
        throw new Error('Максимальное количество товара - 99');
      }
      
      await axios.put(`${baseUrl}/cart/${cart_id}?quantity=${quantity}`);
      await fetchCartItems();
    } catch (err) {
      console.error('Ошибка при обновлении количества:', err);
      // Не блокируем UI при ошибке
      await fetchCartItems();
    }
  };

  // Добавляем функцию очистки корзины
  const clearCart = async () => {
    try {
      await axios.delete(`${baseUrl}/cart/clear`);
      await fetchCartItems();
    } catch (err) {
      console.error('Ошибка при очистке корзины:', err);
      // Не блокируем UI при ошибке
      await fetchCartItems();
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateCartItemQuantity,
        clearCart,
        isLoading,
        error,
        refreshCart: fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};