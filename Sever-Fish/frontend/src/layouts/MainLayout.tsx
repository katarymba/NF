// src/layouts/MainLayout.tsx

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // функция, которую передадим Header для toggle
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Шапка (Header) */}
            <Header onToggleSidebar={handleToggleSidebar} />

            {/* Основная часть экрана: sidebar слева, контент справа */}
            <div className="flex flex-1">
                {/* Сам Sidebar (fixed), см. правки в Sidebar.tsx */}
                <Sidebar isOpen={isSidebarOpen} />

                {/* Основной контент со сдвигом, чтобы не заезжать под сайдбар */}
                <main
                    className={`
          flex-1
          bg-gray-50 dark:bg-[#181818]
          p-4
          overflow-auto
          transition-all duration-300
          ${isSidebarOpen ? 'ml-60' : 'ml-16'}
        `}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );

};

export default MainLayout;
