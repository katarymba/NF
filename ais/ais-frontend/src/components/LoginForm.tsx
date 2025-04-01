import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

interface LoginFormProps {
    onToken: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8080/ais/auth/token', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    username: username,
                    password: password,
                    grant_type: 'password'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка авторизации');
            }
            
            const data = await response.json();
            onToken(data.access_token);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Ошибка входа:', err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#131313]">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                        Username
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
                        Password
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
                    Login
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