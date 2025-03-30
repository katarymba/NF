import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Интерфейсы для форм
interface RegisterFormData {
  email: string;
  phone: string;
  full_name: string;
  password: string;
  password_confirm: string;
}

interface LoginFormData {
  phone: string;
  password: string;
}

const Auth: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Форма регистрации (убрано поле username)
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    phone: '',
    full_name: '',
    password: '',
    password_confirm: ''
  });

  // Форма входа
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    phone: '',
    password: ''
  });

  // Обработчик изменения полей регистрации
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value
    });
  };

  // Обработчик изменения полей входа
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
  };

  // Форматирование телефонного номера
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифры
    const phoneNumber = value.replace(/\D/g, '');
    
    // Форматируем номер в виде +7 (XXX) XXX-XX-XX
    if (phoneNumber.length <= 1) {
      return phoneNumber;
    } else if (phoneNumber.length <= 4) {
      return `+7 (${phoneNumber.slice(1)}`;
    } else if (phoneNumber.length <= 7) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    } else if (phoneNumber.length <= 9) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    } else {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
    }
  };

  // Обработка изменения телефона с форматированием
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isLogin: boolean) => {
    const { value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    
    if (isLogin) {
      setLoginForm({
        ...loginForm,
        phone: formattedValue
      });
    } else {
      setRegisterForm({
        ...registerForm,
        phone: formattedValue
      });
    }
  };

  // Обработчик регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Проверка совпадения паролей
    if (registerForm.password !== registerForm.password_confirm) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    // Очищаем номер телефона от форматирования
    const phoneNumber = registerForm.phone.replace(/\D/g, '');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerForm.email.split('@')[0], // Используем часть email как username
          email: registerForm.email,
          phone: phoneNumber,
          full_name: registerForm.full_name,
          password: registerForm.password,
          password_confirm: registerForm.password_confirm
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка при регистрации');
      }

      // После успешной регистрации переходим на форму входа
      setIsLoginMode(true);
      alert('Регистрация успешна! Теперь вы можете войти в систему.');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработчик входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Очищаем номер телефона от форматирования
    const phoneNumber = loginForm.phone.replace(/\D/g, '');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          password: loginForm.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка при входе');
      }

      // Сохраняем токен в localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tokenType', data.token_type);

      // Перенаправляем на страницу аккаунта
      navigate('/account');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}</h1>
          <div className="auth-mode-switch">
            <button
              className={isLoginMode ? 'active' : ''}
              onClick={() => setIsLoginMode(true)}
              type="button"
            >
              Вход
            </button>
            <button
              className={!isLoginMode ? 'active' : ''}
              onClick={() => setIsLoginMode(false)}
              type="button"
            >
              Регистрация
            </button>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {isLoginMode ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={loginForm.phone}
                onChange={(e) => handlePhoneChange(e, true)}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                placeholder="Введите пароль"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Выполняется вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="full_name">ФИО</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={registerForm.full_name}
                onChange={handleRegisterInputChange}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={registerForm.phone}
                onChange={(e) => handlePhoneChange(e, false)}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterInputChange}
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterInputChange}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Подтверждение пароля</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={registerForm.password_confirm}
                onChange={handleRegisterInputChange}
                placeholder="Повторите пароль"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Стили для страницы авторизации и регистрации */
        .auth-container {
          max-width: 500px;
          margin: 40px auto;
          padding: 0 15px;
        }

        .auth-card {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 30px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .auth-header h1 {
          color: #1a3a5c;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .auth-mode-switch {
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e0e8f0;
          margin: 0 auto;
          max-width: 300px;
        }

        .auth-mode-switch button {
          flex: 1;
          background: none;
          border: none;
          padding: 12px 0;
          cursor: pointer;
          font-weight: 500;
          color: #647d98;
          transition: all 0.2s;
        }

        .auth-mode-switch button.active {
          background-color: #1a5f7a;
          color: white;
        }

        .auth-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 6px;
          font-size: 14px;
          color: #647d98;
          font-weight: 500;
        }

        .form-group input {
          padding: 12px;
          border: 1px solid #e0e8f0;
          border-radius: 6px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          border-color: #1a5f7a;
          outline: none;
        }

        .auth-submit {
          margin-top: 10px;
          padding: 14px;
          background-color: #1a5f7a;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .auth-submit:hover {
          background-color: #124759;
        }

        .auth-submit:disabled {
          background-color: #90a4ae;
          cursor: not-allowed;
        }

        /* Адаптивность */
        @media (max-width: 480px) {
          .auth-card {
            padding: 20px 15px;
          }
          
          .auth-header h1 {
            font-size: 20px;
          }
          
          .form-group input {
            padding: 10px;
          }
          
          .auth-submit {
            padding: 12px;
          }
        }
      `}} />
    </div>
  );
};

export default Auth;