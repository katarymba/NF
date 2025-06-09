import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/auth'; // Импортируем функцию для сохранения токена

interface LoginFormProps {
    onToken: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // ais/ais-frontend/src/components/LoginForm.tsx
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Очищаем ошибки перед новой попыткой
        setIsLoading(true);

        try {
            console.group('Вход администратора');
            console.log('Входные данные:', {
                username,
                passwordLength: password.length
            });

            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('grant_type', 'password');

            console.log('Отправляемые данные:', Object.fromEntries(formData));

            // Пробуем разные URL для входа
            const loginEndpoints = [
                'http://localhost:8001/administrators/token',
                'http://localhost:8001/ais/administrators/token',
                '/administrators/token',
                '/ais/administrators/token'
            ];

            let response = null;
            let responseText = '';
            
            // Пробуем каждый URL для входа
            for (const endpoint of loginEndpoints) {
                try {
                    console.log(`Пробуем авторизацию по адресу: ${endpoint}`);
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    });
                    
                    console.log(`Статус ответа (${endpoint}):`, response.status);
                    console.log('Заголовки:', Object.fromEntries(response.headers));
                    
                    responseText = await response.text();
                    console.log('Текст ответа:', responseText);
                    
                    if (response.ok) {
                        // Если запрос успешен, прерываем цикл
                        break;
                    }
                } catch (err) {
                    console.warn(`Ошибка при попытке входа по адресу ${endpoint}:`, err);
                    // Продолжаем с другими URL
                }
            }

            if (!response || !response.ok) {
                throw new Error(responseText || 'Ошибка авторизации');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('Ошибка парсинга ответа:', error);
                throw new Error('Некорректный ответ от сервера');
            }

            // ВАЖНО: Сохраняем токен в localStorage через функцию из auth.ts
            setAuthToken(data.access_token);
            console.log('Токен успешно сохранен в localStorage с ключом "token"');
            
            // Для отладки: проверяем, сохранился ли токен
            console.log("Проверка сохранения токена:", localStorage.getItem('token') ? "Токен сохранен" : "Токен НЕ сохранен");
            
            // Уведомляем родительский компонент
            onToken(data.access_token);
            navigate('/dashboard', { replace: true });

            console.groupEnd();
        } catch (err) {
            console.error('Полная ошибка входа:', err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
            console.groupEnd();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#131313]">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                        Имя пользователя
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                    disabled={isLoading}
                >
                    {isLoading ? 'Вход...' : 'Вход'}
                </button>
            </form>
            {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-800 border rounded">
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
            )}
        </div>
    );
};

export default LoginForm;