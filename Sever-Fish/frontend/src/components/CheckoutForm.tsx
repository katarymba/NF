import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CheckoutForm.css';

interface CheckoutFormProps {
  onSubmit: (formData: CheckoutFormData) => void;
  onCancel: () => void;
  totalPrice: number;
  cartItems?: any[];
  prefillData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  postalCode?: string;
  paymentMethod: 'card' | 'cash';
  deliveryMethod: 'courier' | 'pickup';
  pickupLocation?: string;
  comment?: string;
}

// Интерфейс для пункта самовывоза
interface PickupLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
}

const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'ustjuzhenskaya',
    name: 'Север-Рыба',
    address: 'Устюженская ул., 8',
    phone: '+7 963 732-11-51',
    workingHours: 'Открыто ⋅ Закроется в 21:00'
  },
  {
    id: 'zarechenskiy',
    name: 'Север-Рыба',
    address: 'Мини-рынок "Зареченский", ул. Победы, 210',
    phone: '+7 820 251-71-09',
    workingHours: 'Открыто ⋅ Закроется в 21:00'
  },
  {
    id: 'gorodskoy-rynok',
    name: 'Северрыба',
    address: 'Городской рынок, ул. Максима Горького, 30',
    phone: '+7 963 732-11-51',
    workingHours: 'Открыто ⋅ Закроется в 19:00'
  },
  {
    id: 'pionerskaya',
    name: 'Север рыба',
    address: 'ул. Пионерская, 21',
    phone: '+7 963 732-11-51',
    workingHours: 'Открыто ⋅ Закроется в 21:00'
  },
  {
    id: 'medeo',
    name: 'Северрыба',
    address: 'ТЦ "Медео", ул. Победы, 107/1',
    phone: '+7 820 250-11-67',
    workingHours: 'Открыто ⋅ Закроется в 21:00'
  },
  {
    id: 'pervomayskaya',
    name: 'Северрыба',
    address: 'Первомайская ул., 21А',
    phone: '+7 820 224-00-79',
    workingHours: 'Открыто ⋅ Закроется в 20:00'
  }
];

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  onSubmit, 
  onCancel, 
  totalPrice, 
  cartItems = [], 
  prefillData 
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card',
    deliveryMethod: 'courier',
    comment: ''
  });

  const [selectedPickupLocation, setSelectedPickupLocation] = useState<PickupLocation | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Загрузка предварительных данных (остается без изменений)
  useEffect(() => {
    if (prefillData) {
      setFormData(prevData => ({
        ...prevData,
        firstName: prefillData.firstName || prevData.firstName,
        lastName: prefillData.lastName || prevData.lastName,
        email: prefillData.email || prevData.email,
        phone: prefillData.phone || prevData.phone,
      }));
    }
  }, [prefillData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Если изменяется способ доставки, сбрасываем выбранный пункт самовывоза
    if (name === 'deliveryMethod') {
      setSelectedPickupLocation(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку при изменении поля
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Обязательные поля
    const requiredFields = [
      { field: 'firstName', label: 'Имя' },
      { field: 'lastName', label: 'Фамилия' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Телефон' }
    ];
    
    // Проверка на заполнение обязательных полей
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field as keyof CheckoutFormData]) {
        errors[field] = `Поле "${label}" обязательно для заполнения`;
      }
    });
    
    // Проверка email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }
    
    // Проверка телефона (упрощенная валидация)
    if (formData.phone && !/^\+?[0-9\s\(\)-]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Телефон должен быть в корректном формате';
    }
    
    // Проверка адреса для доставки курьером
    if (formData.deliveryMethod === 'courier' && !formData.address) {
      errors.address = 'Укажите адрес доставки';
    }
    
    // Проверка пункта самовывоза
    if (formData.deliveryMethod === 'pickup' && !selectedPickupLocation) {
      errors.pickupLocation = 'Выберите пункт самовывоза';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePickupLocationSelect = (location: PickupLocation) => {
    setSelectedPickupLocation(location);
    
    // Обновляем данные формы
    setFormData(prev => ({
      ...prev,
      address: location.address,
      pickupLocation: location.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (validateForm()) {
      try {
        // В случае самовывоза, используем адрес выбранного пункта
        const submissionData = formData.deliveryMethod === 'pickup' 
          ? {
              ...formData,
              city: 'Череповец',
              address: selectedPickupLocation?.address || ''
            }
          : formData;
        
        // Если выбрана оплата картой, показываем форму оплаты
        if (formData.paymentMethod === 'card') {
          setShowPaymentForm(true);
        } else {
          // Для оплаты наличными сразу отправляем заказ
          onSubmit(submissionData);
        }
      } catch (error) {
        console.error("Ошибка при оформлении заказа:", error);
        
        setValidationErrors({ 
          general: "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже."
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Остальные методы (handlePayment, formatPrice и т.д.) остаются без изменений
  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + ' ₽';
  };

  // Форма оплаты картой и основная форма остаются без изменений
  // ... (предыдущая реализация)

  return (
    <div className="checkout-form-container">
      <h2 className="checkout-title">Оформление заказа</h2>
      
      {validationErrors.general && (
        <div className="general-error">
          {validationErrors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="checkout-form">
        {/* Личные данные */}
        <div className="form-section">
          <h3>Личные данные</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Имя*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={validationErrors.firstName ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.firstName && (
                <span className="error-message">{validationErrors.firstName}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Фамилия*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={validationErrors.lastName ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.lastName && (
                <span className="error-message">{validationErrors.lastName}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Телефон*</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
                className={validationErrors.phone ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.phone && (
                <span className="error-message">{validationErrors.phone}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Доставка */}
        <div className="form-section">
          <h3>Доставка</h3>
          
          <div className="form-group">
            <label>Способ доставки</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="courier"
                  checked={formData.deliveryMethod === 'courier'}
                  onChange={handleChange}
                  disabled={loading}
                />
                Курьером
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={formData.deliveryMethod === 'pickup'}
                  onChange={handleChange}
                  disabled={loading}
                />
                Самовывоз
              </label>
            </div>
          </div>
          
          {formData.deliveryMethod === 'courier' && (
            <div className="form-group">
              <label htmlFor="address">Адрес доставки*</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={validationErrors.address ? 'error' : ''}
                disabled={loading}
                placeholder="Введите полный адрес доставки"
              />
              {validationErrors.address && (
                <span className="error-message">{validationErrors.address}</span>
              )}
            </div>
          )}
          
          {formData.deliveryMethod === 'pickup' && (
            <div className="pickup-locations">
              <h4>Выберите пункт самовывоза</h4>
              {PICKUP_LOCATIONS.map(location => (
                <div 
                  key={location.id} 
                  className={`pickup-location ${selectedPickupLocation?.id === location.id ? 'selected' : ''}`}
                  onClick={() => handlePickupLocationSelect(location)}
                >
                  <div className="pickup-location-header">
                    <h5>{location.name}</h5>
                    {selectedPickupLocation?.id === location.id && (
                      <span className="selected-badge">✓</span>
                    )}
                  </div>
                  <p>{location.address}</p>
                  <p className="pickup-hours">{location.workingHours}</p>
                  <p className="pickup-phone">{location.phone}</p>
                </div>
              ))}
              {validationErrors.pickupLocation && (
                <span className="error-message">{validationErrors.pickupLocation}</span>
              )}
            </div>
          )}
        </div>

        {/* Оплата и прочие секции остаются без изменений */}
        {/* ... */}
        {/* Оплата */}
        <div className="form-section">
          <h3>Оплата</h3>
          
          <div className="form-group">
            <label>Способ оплаты</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  disabled={loading}
                />
                Картой онлайн
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  disabled={loading}
                />
                {formData.deliveryMethod === 'pickup' 
                  ? 'Наличными при получении' 
                  : 'Наличными курьеру'}
              </label>
            </div>
          </div>
        </div>

        {/* Список товаров */}
        {cartItems.length > 0 && (
          <div className="form-section">
            <h3>Ваш заказ</h3>
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <span className="order-item-name">{item.product.name}</span>
                  <span className="order-item-quantity">{item.quantity} шт.</span>
                  <span className="order-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Комментарий к заказу */}
        <div className="form-section">
          <h3>Комментарий к заказу</h3>
          
          <div className="form-group">
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              placeholder="Укажите дополнительную информацию к заказу, если необходимо"
              disabled={loading}
            ></textarea>
          </div>
        </div>
        
        {/* Итого */}
        <div className="order-summary">
          <h3>Итого к оплате: <span className="total-amount">{formatPrice(totalPrice)}</span></h3>
        </div>
        
        {/* Кнопки действий */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
            disabled={loading}
          >
            Вернуться в корзину
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Оформление заказа..." : "Подтвердить заказ"}
          </button>
        </div>
      </form>

      {/* Форма оплаты (осталась без изменений) */}
      {showPaymentForm && (
        <div className="payment-form-overlay">
          {/* Existing payment form code */}
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;