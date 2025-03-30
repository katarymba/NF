import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';
import CheckoutForm, { CheckoutFormData } from '../components/CheckoutForm';
import '../components/CheckoutForm.css';

// Добавляем стили для плавных переходов
const cartItemTransition = {
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
};

// Константа для максимального количества
const MAX_QUANTITY = 99;

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  user_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    weight?: string;
    category_id: number;
  };
}

interface CartProps {
  updateCartCount: () => void;
}

// Функция для создания debounce
const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setTimeoutId(
        setTimeout(() => {
          func(...args);
        }, delay)
      );
    }) as T,
    [func, delay]
  );
};

const Cart: React.FC<CartProps> = ({ updateCartCount }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  
  // Добавляем состояние для отображения формы оформления заказа
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Проверка аутентификации пользователя
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType');
      
      if (token && tokenType) {
        try {
          const response = await fetch('http://127.0.0.1:8000/auth/profile', {
            headers: {
              'Authorization': `${tokenType} ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsAuthenticated(true);
            setUserProfile(userData);
          } else {
            // Токен недействителен, удаляем его
            localStorage.removeItem('token');
            localStorage.removeItem('tokenType');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Ошибка при проверке аутентификации:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Функция для безопасной работы с fetch
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        // Пытаемся получить сообщение ошибки от сервера
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Ошибка статус: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Ошибка статус: ${response.status}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw error;
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      // Добавляем случайный параметр к запросу, чтобы избежать кэширования
      const cacheBuster = new Date().getTime();
      
      // Используем безопасный fetch с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // таймаут 5 секунд
      
      const data = await safeFetch(`http://127.0.0.1:8000/cart/?_=${cacheBuster}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Валидируем полученные данные
      if (!Array.isArray(data)) {
        throw new Error('Неверный формат данных от сервера');
      }
      
      setCartItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке корзины:', error);
      
      // Более конкретное сообщение об ошибке
      if (error.name === 'AbortError') {
        setError('Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.');
      } else {
        setError('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
      }
      
      // Устанавливаем пустой массив, чтобы можно было работать с пустой корзиной
      setCartItems([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 2;

    const loadCart = async () => {
      try {
        await fetchCartItems();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Попытка загрузки корзины ${retryCount} из ${maxRetries}...`);
          setTimeout(loadCart, 1000); // повторяем через 1 секунду
        }
      }
    };

    loadCart();
  }, []);

  const handleQuantityChange = useDebounce(async (itemId: number, newQuantity: number) => {
    // Проверка на допустимые значения
    if (newQuantity < 1) {
      setError('Количество товара не может быть меньше 1');
      return;
    }
    
    if (newQuantity > MAX_QUANTITY) {
      setError(`Максимальное количество товара - ${MAX_QUANTITY}`);
      return;
    }
    
    try {
      // Сброс ошибки при валидных данных
      setError(null);
      
      // Устанавливаем флаг обновления
      setIsUpdating(itemId);
      
      // Оптимистичное обновление UI
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Отправляем запрос на сервер
      await safeFetch(`http://127.0.0.1:8000/cart/${itemId}?quantity=${newQuantity}`, {
        method: 'PUT',
      });
      
      // Обновляем счетчик корзины
      updateCartCount();
    } catch (error) {
      console.error('Ошибка при обновлении количества:', error);
      setError(error.message || 'Не удалось обновить количество. Пожалуйста, попробуйте позже.');
      await fetchCartItems(); // Восстанавливаем предыдущие данные
    } finally {
      setIsUpdating(null);
    }
  }, 300);

  const handleRemoveItem = async (itemId: number) => {
    try {
      // Находим удаляемый товар для возможного восстановления
      const itemToRemove = cartItems.find(item => item.id === itemId);
      
      // Флаг обновления
      setIsUpdating(itemId);
      
      // Оптимистичное обновление UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      // Отправляем запрос
      await safeFetch(`http://127.0.0.1:8000/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      // Обновляем счетчик
      updateCartCount();
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      setError('Не удалось удалить товар. Пожалуйста, попробуйте позже.');
      
      // Восстанавливаем корзину
      await fetchCartItems();
    } finally {
      setIsUpdating(null);
    }
  };

  // Обновляем функцию оформления заказа для проверки аутентификации
  const handleShowCheckoutForm = () => {
    if (isAuthenticated) {
      setShowCheckoutForm(true);
    } else {
      // Показываем модальное окно с предложением авторизоваться
      setShowAuthModal(true);
    }
  };
  
  // Обработка перехода на страницу авторизации
  const handleGoToAuth = () => {
    // Сохраняем текущее состояние, чтобы вернуться после авторизации
    localStorage.setItem('redirectAfterAuth', '/cart');
    navigate('/auth');
  };
  
  // Функция для обработки отмены оформления заказа
  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
  };

  // Обновленная функция для отправки заказа с данными формы
  const handleSubmitOrder = async (formData: CheckoutFormData) => {
    try {
      setLoading(true);
      
      // Получаем токен аутентификации
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType');
      
      if (!token || !tokenType) {
        throw new Error('Вы не авторизованы');
      }
      
      // Подготавливаем данные для заказа
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price
        })),
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        delivery: {
          method: formData.deliveryMethod,
          address: formData.deliveryMethod === 'courier' ? {
            city: formData.city,
            street_address: formData.address,
            postal_code: formData.postalCode
          } : null
        },
        payment_method: formData.paymentMethod,
        comment: formData.comment || null,
        total_price: totalPrice
      };
      
      // Отправляем запрос с заголовком авторизации
      const response = await fetch('http://127.0.0.1:8000/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при оформлении заказа');
      }
      
      // Уведомляем пользователя об успешном оформлении заказа
      alert('Ваш заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
      
      // Обновляем корзину и счетчик
      await fetchCartItems();
      updateCartCount();
      
      setLoading(false);
      setShowCheckoutForm(false);
      navigate('/account');
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      setError('Не удалось оформить заказ. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price: number): string => {
    // Если цена целое число, возвращаем без десятичной части
    if (Number.isInteger(price)) {
      return `${price} ₽`;
    }
    // Иначе округляем до 2 знаков после запятой
    return `${price.toFixed(2)} ₽`;
  };

  // Вычисляем общую стоимость корзины
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return <div className="cart-container">Загрузка...</div>;
  }

  // Показываем ошибку, но продолжаем отображать корзину, если есть товары
  const showError = error && (
    <div className="error-container">
      <div className="error">{error}</div>
    </div>
  );

  // Если отображается форма оформления заказа
  if (showCheckoutForm) {
    // Предзаполняем форму данными пользователя, если они доступны
    const prefillData = userProfile ? {
      firstName: userProfile.full_name?.split(' ')[0] || '',
      lastName: userProfile.full_name?.split(' ')[1] || '',
      email: userProfile.email || '',
      phone: userProfile.phone || ''
    } : null;
    
    return (
      <CheckoutForm 
        onSubmit={handleSubmitOrder} 
        onCancel={handleCancelCheckout}
        totalPrice={totalPrice}
        cartItems={cartItems}
        prefillData={prefillData}
      />
    );
  }

  // Модальное окно авторизации
  const authModal = showAuthModal && (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <h2>Требуется авторизация</h2>
        <p>Для оформления заказа необходимо войти в аккаунт или зарегистрироваться.</p>
        <div className="auth-modal-buttons">
          <button 
            onClick={() => setShowAuthModal(false)} 
            className="cancel-button"
          >
            Отмена
          </button>
          <button 
            onClick={handleGoToAuth}
            className="auth-button"
          >
            Войти / Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        {showError}
        <div className="empty-cart">
          <h2>Ваша корзина пока пуста</h2>
          <p>Добавьте свежую рыбу и морепродукты, чтобы оформить заказ</p>
          <button onClick={() => navigate('/products')} className="continue-shopping">
            Перейти в каталог
          </button>
        </div>
        {authModal}
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Ваша корзина</h1>
      
      {showError}
      
      <div className="cart-items">
        {cartItems.map((item) => (
          <div 
            key={item.id} 
            className="cart-item"
            style={{...cartItemTransition}}>
            {item.product?.image_url && (
              <div className="item-image">
                <Link to={`/products/${item.product.id}`}>
                  <img src={item.product.image_url} alt={item.product?.name || 'Товар'} />
                </Link>
              </div>
            )}
            
            <div className="item-details">
              <Link to={`/products/${item.product.id}`}>
                <h3>{item.product?.name || 'Товар'}</h3>
              </Link>
              {item.product?.weight && <p className="item-weight">Вес: {item.product.weight}</p>}
              <p className="item-price">{formatPrice(item.product?.price || 0)}</p>
            </div>
            
            <div className="item-quantity">
              <button 
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                disabled={item.quantity <= 1 || isUpdating === item.id}
                className="quantity-btn"
                aria-label="Уменьшить количество"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.quantity}
                onChange={(e) => {
                  const newValue = e.target.value.replace(/[^0-9]/g, '');
                  const newQuantity = parseInt(newValue, 10) || 1;
                  
                  // Мгновенно обновляем UI
                  if (newQuantity >= 1 && newQuantity <= MAX_QUANTITY) {
                    setCartItems(prevItems => 
                      prevItems.map(cartItem => 
                        cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
                      )
                    );
                    
                    // Затем отправляем запрос с задержкой
                    handleQuantityChange(item.id, newQuantity);
                  } else if (newQuantity > MAX_QUANTITY) {
                    // Если превышено максимальное значение, ограничиваем его
                    setCartItems(prevItems => 
                      prevItems.map(cartItem => 
                        cartItem.id === item.id ? { ...cartItem, quantity: MAX_QUANTITY } : cartItem
                      )
                    );
                    setError(`Максимальное количество товара - ${MAX_QUANTITY}`);
                  }
                }}
                className="quantity-input"
                disabled={isUpdating === item.id}
                aria-label="Количество товара"
              />
              <button 
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={isUpdating === item.id || item.quantity >= MAX_QUANTITY}
                className="quantity-btn"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              <p>{formatPrice((item.product?.price || 0) * item.quantity)}</p>
            </div>
            
            <button 
              className="remove-button" 
              onClick={() => handleRemoveItem(item.id)}
              disabled={isUpdating === item.id}
              aria-label="Удалить товар"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <h2>Итого:</h2>
          <p className="total-price">{formatPrice(totalPrice)}</p>
        </div>
        
        <div className="cart-buttons">
          <button 
            onClick={handleShowCheckoutForm} 
            className="checkout-button"
            disabled={loading}
          >
            Оформить заказ
          </button>
          
          <button onClick={() => navigate('/products')} className="continue-shopping">
            Продолжить покупки
          </button>
        </div>
      </div>
      
      {authModal}
    </div>
  );
};

export default Cart;