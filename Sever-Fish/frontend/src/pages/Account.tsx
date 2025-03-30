import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  full_name: string;
  birthday?: string;
}

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Account: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSection, setActiveSection] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthday: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Получение токена из localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    
    if (!token || !tokenType) {
      return null;
    }
    
    return {
      'Authorization': `${tokenType} ${token}`
    };
  };

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const authHeader = getAuthHeader();
    
    if (!authHeader) {
      navigate('/auth');
      return;
    }
    
    // Загрузка профиля пользователя
    fetchUserProfile();
    // Загрузка заказов пользователя
    fetchUserOrders();
  }, [navigate]);

  // Загрузка профиля пользователя
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const authHeader = getAuthHeader();
      
      if (!authHeader) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/auth/profile', {
        headers: {
          ...authHeader
        }
      });
      
      if (response.status === 401) {
        // Если токен истек или недействителен
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        navigate('/auth');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные пользователя');
      }
      
      const data = await response.json();
      setUserProfile(data);
      
      // Заполняем форму редактирования профиля
      setProfileForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        birthday: data.birthday || ''
      });
      
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке профиля пользователя');
      setLoading(false);
    }
  };

  // Загрузка заказов пользователя
  const fetchUserOrders = async () => {
    try {
      const authHeader = getAuthHeader();
      
      if (!authHeader) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/orders/', {
        headers: {
          ...authHeader
        }
      });
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
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

  // Форматирование даты рождения для отображения
  const formatBirthday = (dateString: string) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Форматирование статуса заказа
  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      'pending': 'В обработке',
      'processing': 'Обрабатывается',
      'completed': 'Выполнен',
      'cancelled': 'Отменен'
    };
    
    return statuses[status] || status;
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
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const authHeader = getAuthHeader();
      
      if (!authHeader) {
        navigate('/auth');
        return;
      }
      
      // Создаем копию формы, чтобы не менять оригинал
      const formData = {...profileForm};
      
      // Проверяем API-сервер - поддерживает ли он PATCH-метод
      // Если сервер не поддерживает метод PUT для обновления профиля с датой рождения,
      // можно попробовать метод PATCH или обновить только базовые поля
      
      // Удалим поле birthday, если оно пустое, чтобы не вызывать проблем на сервере
      if (!formData.birthday) {
        delete formData.birthday;
      }
      
      // Отправка данных на сервер
      const response = await fetch('http://127.0.0.1:8000/auth/profile', {
        method: 'PUT', // Можно заменить на 'PATCH', если сервер поддерживает
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(formData)
      });
      
      // Обрабатываем возможную ошибку Method Not Allowed (405)
      if (response.status === 405) {
        // Если метод не разрешен, попробуем отправить только основные поля без даты рождения
        const basicFormData = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        };
        
        const retryResponse = await fetch('http://127.0.0.1:8000/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          },
          body: JSON.stringify(basicFormData)
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.detail || 'Не удалось обновить профиль');
        }
        
        const data = await retryResponse.json();
        setUserProfile({...data, birthday: profileForm.birthday}); // Сохраняем дату рождения локально
        setEditMode(false);
        setError(null);
        alert('Профиль обновлен, но дату рождения не удалось сохранить на сервере.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось обновить профиль');
      }
      
      const data = await response.json();
      setUserProfile(data);
      setEditMode(false);
      setError(null);
      // Показываем сообщение об успешном обновлении
      alert('Профиль успешно обновлен!');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при обновлении профиля');
      }
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
      const authHeader = getAuthHeader();
      
      if (!authHeader) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось изменить пароль');
      }
      
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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при изменении пароля');
      }
    }
  };

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
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
  
  // Проверка наличия скидки в день рождения
  const isBirthdayDiscount = () => {
    if (!userProfile?.birthday) return false;
    
    const today = new Date();
    const birthday = new Date(userProfile.birthday);
    
    // Проверяем совпадение месяца и дня
    return today.getDate() === birthday.getDate() && 
           today.getMonth() === birthday.getMonth();
  };
  
  // Вычисление количества дней до дня рождения
  const getDaysToBirthday = () => {
    if (!userProfile?.birthday) return null;
    
    const today = new Date();
    const birthday = new Date(userProfile.birthday);
    
    // Устанавливаем текущий год
    birthday.setFullYear(today.getFullYear());
    
    // Если день рождения уже прошел в этом году, добавляем год
    if (today > birthday) {
      birthday.setFullYear(today.getFullYear() + 1);
    }
    
    // Разница в миллисекундах
    const diffTime = birthday.getTime() - today.getTime();
    // Преобразуем в дни
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h1 className="account-title">Личный кабинет</h1>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
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
      </div>
      
      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-container">
            <div className="profile-sidebar">
              <div 
                className={`sidebar-item ${activeSection === 'info' ? 'active' : ''}`}
                onClick={() => setActiveSection('info')}
              >
                Персональные данные
              </div>
              <div 
                className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => setActiveSection('security')}
              >
                Безопасность
              </div>
            </div>
            
            <div className="profile-main">
              {activeSection === 'info' && (
                <>
                  <div className="section-header">
                    <h2>Персональные данные</h2>
                    {!editMode && (
                      <button 
                        onClick={() => setEditMode(true)} 
                        className="edit-button"
                      >
                        Редактировать
                      </button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                      <div className="form-group">
                        <label htmlFor="full_name">ФИО</label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={profileForm.full_name}
                          onChange={handleProfileInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="phone">Телефон</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="birthday">Дата рождения</label>
                        <input
                          type="date"
                          id="birthday"
                          name="birthday"
                          value={profileForm.birthday}
                          onChange={handleProfileInputChange}
                        />
                        <small className="form-hint">
                          Укажите дату рождения для получения скидки 20% в течение недели
                        </small>
                        <small className="form-warning">
                          Обратите внимание: сохранение даты рождения может быть недоступно в текущей версии сервера
                        </small>
                      </div>
                      
                      <div className="profile-actions">
                        <button type="submit" className="save-button">
                          Сохранить
                        </button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => {
                            setEditMode(false);
                            // Восстанавливаем форму
                            if (userProfile) {
                              setProfileForm({
                                full_name: userProfile.full_name || '',
                                email: userProfile.email || '',
                                phone: userProfile.phone || '',
                                birthday: userProfile.birthday || ''
                              });
                            }
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info">
                      <div className="profile-field">
                        <span className="field-label">ФИО:</span>
                        <span className="field-value">{userProfile?.full_name || 'Не указано'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{userProfile?.email || 'Не указано'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <span className="field-label">Телефон:</span>
                        <span className="field-value">{userProfile?.phone || 'Не указан'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <span className="field-label">Дата рождения:</span>
                        <span className="field-value">
                          {userProfile?.birthday ? formatBirthday(userProfile.birthday) : 'Не указана'}
                        </span>
                      </div>
                      
                      {userProfile?.birthday && (
                        <div className="birthday-info">
                          {isBirthdayDiscount() ? (
                            <div className="birthday-discount active">
                              <span>🎁 С днем рождения! У вас скидка 20% на все товары!</span>
                            </div>
                          ) : (
                            <div className="birthday-countdown">
                              <span>До вашего дня рождения осталось {getDaysToBirthday()} дней</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {activeSection === 'security' && (
                <>
                  <div className="section-header">
                    <h2>Безопасность</h2>
                  </div>
                  
                  <form onSubmit={handlePasswordUpdate} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="current_password">Текущий пароль</label>
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
                      <label htmlFor="new_password">Новый пароль</label>
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={8}
                      />
                      <small className="form-hint">
                        Минимум 8 символов
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirm_password">Подтверждение пароля</label>
                      <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordInputChange}
                        required
                      />
                    </div>
                    
                    <div className="profile-actions">
                      <button type="submit" className="save-button">
                        Изменить пароль
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-container">
            <h2>Мои заказы</h2>
            
            {orders.length === 0 ? (
              <div className="empty-orders">
                <p>У вас пока нет заказов</p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="shop-button"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-number">Заказ №{order.id}</span>
                        <span className="order-date">от {formatDate(order.created_at)}</span>
                      </div>
                      <div className={`order-status status-${order.status}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    
                    <div className="order-body">
                      <div className="order-total">
                        <span>Сумма заказа:</span>
                        <span className="order-price">{order.total_price.toFixed(2)} ₽</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        /* Стили для страницы личного кабинета */
        .account-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 15px;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .account-title {
          color: #1a3a5c;
          font-size: 28px;
          margin: 0;
          font-weight: 600;
        }

        .logout-button {
          background-color: transparent;
          color: #6c757d;
          border: 1px solid #e0e0e0;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 40px 0;
          font-size: 16px;
          color: #647d98;
        }

        /* Табы */
        .account-tabs {
          display: flex;
          border-bottom: 1px solid #e0e8f0;
          margin-bottom: 20px;
        }

        .account-tabs button {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #647d98;
          transition: all 0.2s;
        }

        .account-tabs button.active {
          color: #1a5f7a;
          border-bottom-color: #1a5f7a;
          font-weight: 500;
        }

        .account-tabs button:hover:not(.active) {
          border-bottom-color: #e0e8f0;
          color: #1a3a5c;
        }

        /* Профиль */
        .profile-container {
          display: flex;
          gap: 20px;
        }

        .profile-sidebar {
          width: 240px;
          background-color: #fff;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .sidebar-item {
          padding: 14px 20px;
          font-size: 15px;
          color: #495057;
          cursor: pointer;
          border-bottom: 1px solid #f2f2f2;
          transition: all 0.2s;
        }

        .sidebar-item:hover {
          background-color: #f8f9fa;
        }

        .sidebar-item.active {
          background-color: #e6f2f5;
          color: #1a5f7a;
          font-weight: 500;
        }

        .profile-main {
          flex: 1;
          background-color: #fff;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e8f0;
        }

        .section-header h2 {
          margin: 0;
          color: #1a3a5c;
          font-size: 20px;
          font-weight: 600;
        }

        .edit-button {
          background-color: #f0f5fa;
          color: #1a5f7a;
          border: 1px solid #e0e8f0;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-button:hover {
          background-color: #e0e8f0;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .field-label {
          font-size: 14px;
          color: #647d98;
        }

        .field-value {
          font-size: 16px;
          color: #1a3a5c;
          font-weight: 500;
        }

        .birthday-info {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px dashed #e0e8f0;
        }

        .birthday-discount {
          padding: 12px 15px;
          background-color: #e8f5e9;
          color: #2e7d32;
          border-radius: 4px;
          font-weight: 500;
          text-align: center;
        }

        .birthday-countdown {
          color: #647d98;
          font-size: 14px;
        }

        /* Форма редактирования профиля */
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          color: #647d98;
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid #e0e8f0;
          border-radius: 4px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          border-color: #1a5f7a;
          outline: none;
        }

        .form-hint {
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }
        
        .form-warning {
          font-size: 12px;
          color: #e67700;
          margin-top: 4px;
          display: block;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .save-button, .cancel-button {
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-button {
          background-color: #1a5f7a;
          color: white;
          border: none;
        }

        .save-button:hover {
          background-color: #124759;
        }

        .cancel-button {
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #e0e8f0;
        }

        .cancel-button:hover {
          background-color: #e9ecef;
        }

        /* Заказы */
        .orders-container {
          background-color: #fff;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .orders-container h2 {
          margin: 0 0 20px 0;
          color: #1a3a5c;
          font-size: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e8f0;
        }

        .empty-orders {
          text-align: center;
          padding: 30px 0;
        }

        .empty-orders p {
          font-size: 16px;
          color: #647d98;
          margin-bottom: 20px;
        }

        .shop-button {
          background-color: #1a5f7a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .shop-button:hover {
          background-color: #124759;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-card {
          border: 1px solid #e0e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f7fafd;
          border-bottom: 1px solid #e0e8f0;
        }

        .order-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .order-number {
          font-weight: 600;
          color: #1a3a5c;
        }

        .order-date {
          font-size: 14px;
          color: #647d98;
        }

        .order-status {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-pending {
          background-color: #fff8e1;
          color: #f57c00;
        }

        .status-processing {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-completed {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .status-cancelled {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .order-body {
          padding: 15px;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          color: #1a3a5c;
        }

        .order-price {
          font-weight: 600;
          font-size: 18px;
        }

        /* Адаптивность */
        @media (max-width: 768px) {
          .profile-container {
            flex-direction: column;
          }
          
          .profile-sidebar {
            width: 100%;
            margin-bottom: 15px;
          }
          
          .sidebar-item {
            padding: 12px 15px;
          }
        }

        @media (max-width: 600px) {
          .account-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .logout-button {
            align-self: flex-end;
          }
          
          .account-tabs {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 5px;
          }
          
          .account-tabs button {
            padding: 10px 15px;
            font-size: 14px;
            white-space: nowrap;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .profile-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .save-button, .cancel-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Account;