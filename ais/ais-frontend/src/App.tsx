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

    // Функция для установки токена
    const handleToken = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    token ? <Navigate to="/dashboard" replace /> : <LoginPage onToken={handleToken} />
                } />

                <Route path="/" element={<MainLayout />}>
                    <Route
                        index
                        element={token ? <Navigate to="/dashboard" replace /> : <Home />}
                    />

                    <Route
                        path="dashboard"
                        element={token ? <Dashboard token={token} /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="products"
                        element={token ? <Products /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="orders"
                        element={token ? <Orders token={token} /> : <Navigate to="/login" replace />}
                    />
                    
                    <Route
                        path="orders/:orderId"
                        element={token ? <OrderDetail /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="payments"
                        element={token ? <Payments /> : <Navigate to="/login" replace />}
                    />
                    
                    <Route
                        path="analytics"
                        element={token ? <AnalyticsDashboard /> : <Navigate to="/login" replace />}
                    />
                    
                    <Route
                        path="sync"
                        element={token ? <SyncPage /> : <Navigate to="/login" replace />}
                    />
                    
                    {/* Заглушки для других разделов интеграции */}
                    <Route
                        path="customers"
                        element={token ? <div className="p-4">Страница управления клиентами находится в разработке</div> : <Navigate to="/login" replace />}
                    />
                    
                    <Route
                        path="settings"
                        element={token ? <div className="p-4">Страница настроек интеграции находится в разработке</div> : <Navigate to="/login" replace />}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;