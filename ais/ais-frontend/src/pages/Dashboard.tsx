// src/pages/Dashboard.tsx

import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

interface DashboardProps {
    token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p>Добро пожаловать в AIS Dashboard!</p>
            <div>
            <p className="mt-4 font-bold">Ваш токен (для теста):</p>
            <pre className="bg-gray-200 dark:bg-gray-[#131313] p-4 rounded break-words">{token}</pre>
            </div>
        </div>
    );
};

export default Dashboard;
