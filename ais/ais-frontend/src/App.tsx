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
import Reports from './pages/Reports';
import Warehouse from './pages/Warehouse';
import Delivery from './pages/Delivery';
import Home from './pages/Home';
import NotFound from './pages/NotFound'; // Импортируем новый компонент 404
import { LoadingProvider } from './context/LoadingContext';
import { validateApiEndpoints } from './utils/apiValidator';

// Импортируем GIF-анимацию - предзагружаем для быстрого отображения
import fishGif from './assets/images/340.gif';

// Предзагрузка изображения для ускорения отображения
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

// Предзагрузим GIF сразу
preloadImage(fishGif);

// Компонент GifLoader
interface GifLoaderProps {
  isLoading: boolean;
}

const GifLoader: React.FC<GifLoaderProps> = ({
  isLoading
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
      <div className="flex items-center justify-center">
        <img 
          src={fishGif} 
          alt="" 
          style={{ width: '60px' }} 
          className="opacity-80"
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Оптимизация: Отложенная инициализация для ускорения первоначального рендеринга
    useEffect(() => {
        // Используем setTimeout для асинхронной проверки, чтобы не блокировать рендеринг
        const timer = setTimeout(() => {
            checkAuth();
        }, 0);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only run in development
        if (process.env.NODE_ENV === 'development') {
            validateApiEndpoints();
        }
    }, []);

    const handleToken = (newToken: string) => {
        console.log("Token received:", newToken.substring(0, 10) + "...");
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

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

    if (isCheckingAuth) {
        return <div className="flex items-center justify-center h-screen">
            <GifLoader isLoading={true} />
        </div>;
    }

    return (
        <LoadingProvider>
            <Router>
                <React.Suspense fallback={<GifLoader isLoading={true} />}>
                    <Routes>
                        {/* Страница авторизации */}
                        <Route path="/login" element={
                            token ? <Navigate to="/dashboard" replace /> : <LoginPage onToken={handleToken} />
                        } />

                        {/* Защищенные маршруты в основном макете */}
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
                                element={<Warehouse token ={token || ''} />}
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
                        </Route>
                        
                        {/* Страница 404 - должна быть в конце перед закрывающей Routes */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </React.Suspense>
            </Router>
        </LoadingProvider>
    );
};

export default App;