import React, { useState } from 'react';
import './CheckoutForm.css';

interface CheckoutFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  totalPrice: number;
  cartItems: any[];
  prefillData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  onSubmit, 
  onCancel, 
  totalPrice, 
  cartItems,
  prefillData 
}) => {
  // Состояние формы
  const [formData, setFormData] = useState({
    firstName: prefillData?.firstName || '',
    lastName: prefillData?.lastName || '',
    email: prefillData?.email || '',
    phone: prefillData?.phone || '',
    address: '',
    deliveryDate: '',
    paymentMethod: 'cash',
    comment: ''
  });

  // Состояние валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очищаем ошибку для измененного поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price: number) => {
    // Если цена целое число, возвращаем без десятичной части
    if (Number.isInteger(price)) {
      return `${price} ₽`;
    }
    // Иначе округляем до 2 знаков после запятой
    return `${price.toFixed(2)} ₽`;
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Необходимо указать имя';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Необходимо указать фамилию';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Необходимо указать email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Необходимо указать телефон';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Необходимо указать адрес доставки';
    }
    
    if (!formData.deliveryDate.trim()) {
      newErrors.deliveryDate = 'Необходимо указать дату доставки';
    } else {
      // Проверяем, что дата доставки не в прошлом
      const selectedDate = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.deliveryDate = 'Дата доставки не может быть в прошлом';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Получаем минимальную дату для выбора (сегодня)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="checkout-container">
      <h1>Оформление заказа</h1>
      
      <div className="checkout-form-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Контактная информация</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Имя *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Фамилия *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (___) ___-__-__"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Информация о доставке</h2>
            
            <div className="form-group">
              <label htmlFor="address">Адрес доставки *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Город, улица, дом, квартира"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deliveryDate">Дата доставки *</label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={errors.deliveryDate ? 'error' : ''}
                />
                {errors.deliveryDate && <span className="error-message">{errors.deliveryDate}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Способ оплаты *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="cash">Наличными при получении</option>
                  <option value="card">Картой при получении</option>
                  <option value="online">Онлайн оплата</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Комментарий к заказу</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Дополнительная информация для курьера"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Ваш заказ</h2>
            
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span className="item-name">{item.product?.name}</span>
                  <span className="item-quantity">{item.quantity} шт.</span>
                  <span className="item-price">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <span>Итого:</span>
              <span className="total-price">{formatPrice(totalPrice)}</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Назад к корзине
            </button>
            <button type="submit" className="submit-button">
              Подтвердить заказ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;