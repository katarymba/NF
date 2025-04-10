// ais/ais-frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Payments from './pages/Payments';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SyncPage from './pages/SyncPage';
import Home from './pages/Home';

const App: React.FC = () => {
    // Получаем токен из localStorage при инициализации
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Функция для установки токена
    const handleToken = (newToken: string) => {
        console.log("Token received:", newToken.substring(0, 10) + "...");
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    // Проверяем валидность токена при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            if (storedToken) {
                try {
                    const response = await fetch('http://localhost:8080/ais/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });
                    
                    if (!response.ok) {
                        // Токен недействителен, удаляем его
                        console.log("Токен недействителен, выполняется выход");
                        localStorage.removeItem('token');
                        setToken(null);
                    } else {
                        setToken(storedToken);
                    }
                } catch (error) {
                    console.error("Ошибка проверки авторизации:", error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            
            setIsCheckingAuth(false);
        };
        
        checkAuth();
    }, []);

    // Показываем индикатор загрузки, пока проверяем авторизацию
    if (isCheckingAuth) {
        return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
    }

    console.log("Токен аутентификации:", token ? "установлен" : "отсутствует");

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    token ? <Navigate to="/dashboard" replace /> : <LoginPage onToken={handleToken} />
                } />

                <Route path="/" element={token ? <MainLayout /> : <Navigate to="/login" replace />}>
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="dashboard"
                        element={<Dashboard token={token || ''} />}
                    />

                    <Route
                        path="products"
                        element={<Products />}
                    />

                    <Route
                        path="orders"
                        element={<Orders token={token || ''} />}
                    />
                    
                    <Route
                        path="orders/:orderId"
                        element={<OrderDetail />}
                    />

                    <Route
                        path="payments"
                        element={<Payments token={''} />}
                    />
                    
                    <Route
                        path="analytics"
                        element={<AnalyticsDashboard />}
                    />
                    
                    <Route
                        path="sync"
                        element={<SyncPage />}
                    />
                    
                    <Route
                        path="customers"
                        element={<div className="p-4">Страница управления клиентами находится в разработке</div>}
                    />
                    
                    <Route
                        path="settings"
                        element={<div className="p-4">Страница настроек интеграции находится в разработке</div>}
                    />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;