import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../utils/apiConfig';

// Компонент уведомления о необходимости авторизации
const AuthNotification = () => {
  const navigate = useNavigate();
  
  // Сохраняем текущий путь в localStorage для перенаправления после авторизации
  useEffect(() => {
    localStorage.setItem('redirectAfterAuth', '/cart');
  }, []);

  return (
    <div className="cart-container">
      <div className="auth-notification">
        <h2>Для доступа к корзине необходимо войти в аккаунт</h2>
        <p>Чтобы добавлять товары в корзину и оформлять заказы, пожалуйста, авторизуйтесь</p>
        <button 
          onClick={() => navigate('/auth')} 
          className="login-button">
          Войти в аккаунт
        </button>
      </div>
    </div>
  );
};

// Основной компонент корзины
const Cart = () => {
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart, isLoading: cartLoading, refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Проверка авторизации
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  // Эффект для обновления корзины при изменении состояния авторизации
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  // Эффект для загрузки профиля пользователя, если он авторизован
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('tokenType');
        
        if (!token || !tokenType) return;
        
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        setUserProfile(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);

  // Обработчик нажатия кнопки удаления товара
  const handleRemoveItem = useCallback(async (itemId) => {
    await removeFromCart(itemId);
  }, [removeFromCart]);

  // Обработчик изменения количества товара
  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItemQuantity(itemId, newQuantity);
  }, [updateCartItemQuantity]);

  // Обработчик нажатия кнопки очистки корзины
  const handleClearCart = useCallback(async () => {
    if (window.confirm("Вы уверены, что хотите очистить корзину?")) {
      await clearCart();
    }
  }, [clearCart]);

  // Обработчик нажатия кнопки оформления заказа
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setError("Для оформления заказа необходимо авторизоваться");
      return;
    }
    
    setShowCheckoutForm(true);
  };

  // Обработчик отмены оформления заказа
  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
  };

  // Обработчик отправки формы оформления заказа
  const handleSubmitOrder = async (formData) => {
    if (!isAuthenticated) {
      setError("Для оформления заказа необходимо авторизоваться");
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType');
      
      if (!token || !tokenType) {
        throw new Error("Не удалось получить токен авторизации");
      }
      
      // Подготавливаем данные для создания заказа
      const orderData = {
        delivery_address: formData.address,
        contact_phone: formData.phone,
        contact_email: formData.email,
        contact_name: `${formData.firstName} ${formData.lastName}`,
        delivery_date: formData.deliveryDate,
        payment_method: formData.paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
      
      // Пробуем разные URL для создания заказа
      const orderApis = [
        `${API_BASE_URL}/api/orders`,
        `${API_BASE_URL}/orders`,
        `${API_BASE_URL}/api/orders/`
      ];
      
      let success = false;
      
      for (const api of orderApis) {
        try {
          console.log(`Попытка создания заказа по URL: ${api}`);
          await axios.post(api, orderData, {
            headers: {
              'Authorization': `${tokenType} ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          success = true;
          console.log(`Заказ успешно создан по ${api}`);
          break;
        } catch (err) {
          console.error(`Ошибка при создании заказа по ${api}:`, err);
          // Продолжаем пробовать следующий URL
        }
      }
      
      if (!success) {
        throw new Error('Не удалось создать заказ ни по одному из адресов');
      }
      
      // Обновляем корзину и счетчик
      await refreshCart();
      
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
  const formatPrice = (price) => {
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

  if (loading && !cartItems.length) {
    return <div className="cart-container">Загрузка...</div>;
  }

  // Показываем ошибку, но продолжаем отображать корзину, если есть товары
  const showError = error && (
    <div className="error-container">
      <div className="error">{error}</div>
    </div>
  );

  // Если пользователь не авторизован, показываем уведомление
  if (!isAuthenticated) {
    return <AuthNotification />;
  }

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
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Ваша корзина</h1>
      
      {showError}
      
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            {item.product?.image_url && (
              <div className="item-image">
                <img src={item.product.image_url} alt={item.product.name} />
              </div>
            )}
            
            <div className="item-details">
              <div className="item-name">{item.product?.name}</div>
              <div className="item-price">
                {formatPrice(item.product?.price || 0)} за шт.
              </div>
              {item.product?.weight && (
                <div className="item-weight">
                  {item.product.weight}
                </div>
              )}
            </div>
            
            <div className="item-quantity">
              <button 
                className="quantity-button"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button 
                className="quantity-button"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= 99}
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              {formatPrice((item.product?.price || 0) * item.quantity)}
            </div>
            
            <button 
              className="remove-button"
              onClick={() => handleRemoveItem(item.id)}
              aria-label="Удалить товар"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-controls">
        <button 
          className="clear-cart-button"
          onClick={handleClearCart}
          disabled={cartItems.length === 0}
        >
          Очистить корзину
        </button>
      </div>
      
      <div className="cart-summary">
        <div className="total-items">
          Товаров в корзине: <span>{cartItems.length}</span>
        </div>
        <div className="total-price">
          Итого: <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
      
      <div className="cart-buttons">
        <button 
          className="checkout-button"
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || loading}
        >
          {loading ? 'Обработка...' : 'Оформить заказ'}
        </button>
        
        <button 
          className="continue-shopping"
          onClick={() => navigate('/products')}
        >
          Продолжить покупки
        </button>
      </div>
    </div>
  );
};

export default Cart;