// Sever-Fish/frontend/src/pages/Auth.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPublicUser, loginWithPhone } from '../services/api';


// Компонент страницы авторизации и регистрации
const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Состояние для данных формы
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLoginMode) {
        // Логин
        console.log("Пытаемся войти с телефоном:", formData.phone);
        const result = await loginWithPhone(formData.phone, formData.password);
        console.log("Результат входа:", result);

        if (result.success) {
          // Сохраняем токен
          localStorage.setItem('token', result.data.access_token);
          // Перенаправляем на главную
          setSuccessMessage('Вход выполнен успешно!');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError(result.message);
        }
      } else {
        // Регистрация
        // Проверка на совпадение паролей
        if (formData.password !== formData.passwordConfirm) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }

        console.log("Пытаемся зарегистрировать:", formData.username);
        const result = await registerPublicUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.passwordConfirm
        });
        console.log("Результат регистрации:", result);

        if (result.success) {
          setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти.');
          // Переключаемся на режим входа
          setIsLoginMode(true);
          // Очищаем форму
          setFormData({
            username: '',
            email: '',
            phone: '',
            password: '',
            passwordConfirm: ''
          });
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      console.error('Непредвиденная ошибка:', err);
      setError('Произошла ошибка: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLoginMode ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Имя пользователя</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                required
              />
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
            required
          />
        </div>

        {!isLoginMode && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Подтверждение пароля</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : isLoginMode ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError('');
            setSuccessMessage('');
          }}
          className="text-blue-600 hover:underline"
        >
          {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
};

export default Auth;