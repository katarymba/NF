// src/pages/LoginPage.tsx

import React from 'react';
import LoginForm from '../components/LoginForm';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/LoginPage.css'; // Если требуется дополнительный CSS

interface LoginPageProps {
    onToken: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onToken }) => {
    return (
        <div className="min-h-screen bg-[#ffffff] dark:bg-[#1e1f20] flex items-center justify-center relative">
            {/* Переключатель темы в правом верхнем углу всей страницы */}
            <ThemeToggle className="absolute top-4 right-4" />

            {/* Центрированная карточка формы логина */}
            <div className="w-full max-w-md p-8 bg-white dark:bg-[#131313] shadow-lg rounded-lg">
                {/* Логотип по центру */}
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="Logo" className="h-12" />
                </div>
                <LoginForm onToken={onToken} />
            </div>
        </div>
    );
};

export default LoginPage;
