import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, api, getCurrentUser, updateUserProfile, changePassword } from '../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  birthday: string | null;
}

interface Order {
  id: number;
  order_date: string;
  total_price: number;
  status: string;
  delivery_address: string | null;
  products: OrderProduct[];
}

interface OrderProduct {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image_url: string | null;
}

interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  birthday: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Форма профиля пользователя
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone: '',
    birthday: ''
  });
  
  // Форма изменения пароля
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }
      
      try {
        // Загрузка профиля пользователя
        await fetchUserProfile();
        // Загрузка заказов пользователя
        await fetchUserOrders();
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        // Не удаляем токены при ошибке получения профиля
        // localStorage.removeItem('token');
        // localStorage.removeItem('tokenType');
        // navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Загрузка профиля пользователя
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const userResponse = await getCurrentUser();
      
      setUserProfile(userResponse);
      
      // Заполняем форму для редактирования данными пользователя
      setProfileForm({
        full_name: userResponse.full_name || '',
        email: userResponse.email || '',
        phone: userResponse.phone || '',
        birthday: userResponse.birthday ? new Date(userResponse.birthday).toISOString().split('T')[0] : ''
      });
      
      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setError('Ошибка при загрузке профиля пользователя');
      // Позволяем пользователю остаться на странице аккаунта даже если не удалось загрузить профиль
      
      // Используем данные из localStorage для заполнения профиля
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      
      if (userId && username) {
        const localUserProfile = {
          id: Number(userId),
          username: username,
          email: localStorage.getItem('userEmail'),
          phone: localStorage.getItem('userPhone'),
          full_name: localStorage.getItem('userFullName'),
          birthday: null
        };
        
        setUserProfile(localUserProfile);
        
        // Заполняем форму данными из localStorage
        setProfileForm({
          full_name: localUserProfile.full_name || '',
          email: localUserProfile.email || '',
          phone: localUserProfile.phone || '',
          birthday: ''
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Загрузка заказов пользователя
  const fetchUserOrders = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/orders`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 200) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      // Не показываем ошибку пользователю, просто оставляем пустой список заказов
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Обработчик изменения полей формы профиля
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };

  // Обработчик изменения полей формы пароля
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  // Обработчик отправки формы профиля
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Проверка на изменения
      if (
        profileForm.full_name === userProfile?.full_name &&
        profileForm.email === userProfile?.email &&
        profileForm.phone === userProfile?.phone &&
        profileForm.birthday === (userProfile?.birthday ? new Date(userProfile.birthday).toISOString().split('T')[0] : '')
      ) {
        setEditMode(false);
        return;
      }
      
      // Подготовка данных формы
      const formData = {
        full_name: profileForm.full_name,
        email: profileForm.email,
        phone: profileForm.phone,
        birthday: profileForm.birthday || null
      };
      
      // Отправка данных на сервер
      const updatedProfile = await updateUserProfile(formData);
      
      // Обновляем данные в localStorage
      if (formData.full_name) localStorage.setItem('userFullName', formData.full_name);
      if (formData.email) localStorage.setItem('userEmail', formData.email);
      if (formData.phone) localStorage.setItem('userPhone', formData.phone);
      
      setUserProfile({
        ...userProfile!,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday
      });
      
      setEditMode(false);
      setError(null);
      // Показываем сообщение об успешном обновлении
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setError('Произошла ошибка при обновлении профиля');
    }
  };

  // Обработчик отправки формы изменения пароля
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка совпадения паролей
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    try {
      // Отправка запроса на изменение пароля
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      // Очистка формы
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setError(null);
      // Показываем сообщение об успешном изменении пароля
      alert('Пароль успешно изменен!');
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      setError('Произошла ошибка при изменении пароля');
    }
  };

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userFullName');
    navigate('/');
  };

  // Проверка на загрузку
  if (loading) {
    return (
      <div className="account-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }
  
  // Для отображения страницы аккаунта используем данные из localStorage, если профиль не загружен
  if (!userProfile) {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId && username) {
      setUserProfile({
        id: Number(userId),
        username: username,
        email: localStorage.getItem('userEmail'),
        phone: localStorage.getItem('userPhone'),
        full_name: localStorage.getItem('userFullName'),
        birthday: null
      });
    } else {
      // Если нет данных даже в localStorage, перенаправляем на авторизацию
      navigate('/auth');
      return null;
    }
  }
  
  // Проверка наличия скидки в день рождения
  const isBirthdayDiscount = () => {
    if (!userProfile?.birthday) return false;
    
    const today = new Date();
    const birthday = new Date(userProfile.birthday);
    
    // Проверяем совпадение месяца и дня
    return today.getDate() === birthday.getDate() && 
           today.getMonth() === birthday.getMonth();
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Личный кабинет</h1>
        {isBirthdayDiscount() && (
          <div className="birthday-discount">
            <span>🎉 С днем рождения! Сегодня вам доступна скидка 10% на все товары! 🎁</span>
          </div>
        )}
      </div>
      
      <div className="account-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Мои заказы
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          Изменить пароль
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      
      {error && <div className="account-error">{error}</div>}
      
      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            {!editMode ? (
              <div className="profile-info">
                <h2>Информация о пользователе</h2>
                <p><strong>Имя пользователя:</strong> {userProfile?.username}</p>
                <p><strong>ФИО:</strong> {userProfile?.full_name || 'Не указано'}</p>
                <p><strong>Email:</strong> {userProfile?.email || 'Не указан'}</p>
                <p><strong>Телефон:</strong> {userProfile?.phone || 'Не указан'}</p>
                <p><strong>Дата рождения:</strong> {userProfile?.birthday ? formatDate(userProfile.birthday) : 'Не указана'}</p>
                <button className="edit-button" onClick={() => setEditMode(true)}>Редактировать</button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <h2>Редактирование профиля</h2>
                <div className="form-group">
                  <label htmlFor="full_name">ФИО:</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileInputChange}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Телефон:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="birthday">Дата рождения:</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={profileForm.birthday}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-button">Сохранить</button>
                  <button type="button" className="cancel-button" onClick={() => setEditMode(false)}>Отмена</button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>История заказов</h2>
            {orders.length === 0 ? (
              <p className="no-data">У вас пока нет заказов</p>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-number">Заказ №{order.id}</span>
                        <span className="order-date">от {formatDate(order.order_date)}</span>
                      </div>
                      <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status === 'new' ? 'Новый' : 
                         order.status === 'processing' ? 'В обработке' :
                         order.status === 'shipped' ? 'Отправлен' :
                         order.status === 'delivered' ? 'Доставлен' :
                         order.status === 'cancelled' ? 'Отменен' : order.status}
                      </span>
                    </div>
                    
                    <div className="order-products">
                      {order.products.map(item => (
                        <div key={item.product_id} className="order-product">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="product-thumbnail"
                            />
                          )}
                          <div className="product-details">
                            <span className="product-name">{item.name}</span>
                            <span className="product-price">{item.price} ₽ × {item.quantity} шт</span>
                          </div>
                          <span className="product-total">{item.total} ₽</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-footer">
                      <div className="delivery-address">
                        <strong>Адрес доставки:</strong> {order.delivery_address || 'Не указан'}
                      </div>
                      <div className="order-total">
                        <strong>Итого:</strong> {order.total_price} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="password-section">
            <h2>Изменение пароля</h2>
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label htmlFor="current_password">Текущий пароль:</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new_password">Новый пароль:</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordInputChange}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Подтвердите новый пароль:</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordInputChange}
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="change-password-button">Изменить пароль</button>
            </form>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .account-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 20px;
        }
        
        .account-header {
          margin-bottom: 30px;
        }
        
        .account-header h1 {
          color: #1a3a5c;
          margin-bottom: 10px;
        }
        
        .birthday-discount {
          background-color: #fff8e1;
          border: 1px solid #ffecb3;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
          color: #ff6f00;
          font-weight: 500;
          text-align: center;
        }
        
        .account-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 30px;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .account-tabs button {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          margin-right: 15px;
          cursor: pointer;
          font-weight: 500;
          color: #546e7a;
          transition: all 0.2s;
        }
        
        .account-tabs button.active {
          color: #1a5f7a;
          border-bottom-color: #1a5f7a;
        }
        
        .account-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .profile-info, .profile-form, .orders-section, .password-section {
          background-color: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .profile-info h2, .profile-form h2, .orders-section h2, .password-section h2 {
          margin-top: 0;
          color: #1a3a5c;
          font-size: 20px;
          margin-bottom: 20px;
        }
        
        .profile-info p {
          margin: 10px 0;
          line-height: 1.6;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #546e7a;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 15px;
        }
        
        .form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .edit-button, .save-button, .cancel-button, .change-password-button {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .edit-button, .save-button, .change-password-button {
          background-color: #1a5f7a;
          color: white;
        }
        
        .edit-button:hover, .save-button:hover, .change-password-button:hover {
          background-color: #124759;
        }
        
        .cancel-button {
          background-color: #e0e0e0;
          color: #424242;
        }
        
        .cancel-button:hover {
          background-color: #d5d5d5;
        }
        
        .logout-button {
          margin-left: auto;
          color: #f44336;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #546e7a;
        }
        
        .no-data {
          text-align: center;
          padding: 30px;
          color: #757575;
          font-style: italic;
        }
        
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .order-card {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f5f5f5;
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .order-number {
          font-weight: 600;
          color: #1a3a5c;
          margin-right: 10px;
        }
        
        .order-date {
          color: #757575;
          font-size: 14px;
        }
        
        .order-status {
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 14px;
        }
        
        .status-new {
          background-color: #e3f2fd;
          color: #1565c0;
        }
        
        .status-processing {
          background-color: #fff8e1;
          color: #ff6f00;
        }
        
        .status-shipped {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-delivered {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-cancelled {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .order-products {
          padding: 16px;
        }
        
        .order-product {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .order-product:last-child {
          border-bottom: none;
        }
        
        .product-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 16px;
        }
        
        .product-details {
          flex: 1;
        }
        
        .product-name {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .product-price {
          color: #757575;
          font-size: 14px;
        }
        
        .product-total {
          font-weight: 600;
          color: #1a3a5c;
        }
        
        .order-footer {
          padding: 12px 16px;
          background-color: #f5f5f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e0e0e0;
        }
        
        .delivery-address {
          font-size: 14px;
          color: #546e7a;
        }
        
        .order-total {
          font-weight: 600;
          color: #1a3a5c;
        }
        
        @media (max-width: 768px) {
          .account-tabs {
            flex-wrap: wrap;
          }
          
          .account-tabs button {
            flex-grow: 1;
            min-width: 120px;
            text-align: center;
          }
          
          .logout-button {
            order: 4;
            margin-left: 0;
            width: 100%;
            margin-top: 10px;
          }
          
          .order-header, .order-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .order-status, .order-total {
            margin-top: 8px;
          }
          
          .product-thumbnail {
            width: 40px;
            height: 40px;
          }
        }
      `}} />
    </div>
  );
};

export default Account;