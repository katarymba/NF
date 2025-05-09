import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
    onToken: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // ais/ais-frontend/src/components/LoginForm.tsx
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Очищаем ошибки перед новой попыткой

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

            // Убираем AbortController, так как он может вызывать проблемы
            const response = await fetch('http://localhost:8080/ais/administrators/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            console.log('Статус ответа:', response.status);
            console.log('Заголовки:', Object.fromEntries(response.headers));

            const responseText = await response.text();
            console.log('Текст ответа:', responseText);

            if (!response.ok) {
                throw new Error(responseText || 'Ошибка авторизации');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('Ошибка парсинга ответа:', error);
                throw new Error('Некорректный ответ от сервера');
            }

            onToken(data.access_token);
            navigate('/dashboard', { replace: true });

            console.groupEnd();
        } catch (err) {
            console.error('Полная ошибка входа:', err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
            console.groupEnd();
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
                >
                    Вход
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