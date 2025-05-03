import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import Integration from './pages/Integration';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Payments from './pages/Payments';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SyncPage from './pages/SyncPage';
import Reports from './pages/Reports'; // Импорт страницы отчетов
import Warehouse from './pages/Warehouse'; // Импорт страницы склада
import Delivery from './pages/Delivery'; // Импорт страницы доставки
import Home from './pages/Home';

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const handleToken = (newToken: string) => {
        console.log("Token received:", newToken.substring(0, 10) + "...");
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

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
                        path="warehouse"
                        element={<Warehouse token={token || ''} />}
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
                        path="reports"
                        element={<Reports />}
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
                        path="delivery"
                        element={<Delivery />}
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