// src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Home from './pages/Home';
import Payments from './pages/Payments';

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage onToken={setToken} />} />

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

                    {/* Новый маршрут Payments */}
                    <Route
                        path="payments"
                        element={token ? <Payments /> : <Navigate to="/login" replace />}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
