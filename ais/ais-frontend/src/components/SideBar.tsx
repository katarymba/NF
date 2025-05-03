import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Импорт иконок
import {
    HomeIcon,
    ShoppingCartIcon,
    ArchiveBoxIcon,
    WalletIcon,
    TruckIcon,
    ChartBarIcon,
    ArrowPathIcon,
    UsersIcon,
    Cog6ToothIcon,
    DocumentTextIcon, // Иконка для отчетов
    BuildingStorefrontIcon, // Добавляем иконку для склада
} from '@heroicons/react/24/solid';

interface SidebarProps {
    isOpen: boolean;
}

// Добавлен пункт "Склад" в список навигации
const navItems = [
    { to: '/dashboard', label: 'Главная', Icon: HomeIcon },
    { to: '/products', label: 'Товары', Icon: ShoppingCartIcon },
    { to: '/warehouse', label: 'Склад', Icon: BuildingStorefrontIcon }, // Новый пункт меню для склада
    { to: '/orders', label: 'Заказы', Icon: ArchiveBoxIcon },
    { to: '/payments', label: 'Платежи', Icon: WalletIcon },
    { to: '/delivery', label: 'Доставка', Icon: TruckIcon },
    { to: '/reports', label: 'Отчеты', Icon: DocumentTextIcon },
    { to: '/analytics', label: 'Аналитика', Icon: ChartBarIcon },
];

const integrationItems = [
    { to: '/sync', label: 'Синхронизация', Icon: ArrowPathIcon },
    { to: '/customers', label: 'Клиенты', Icon: UsersIcon },
    { to: '/settings', label: 'Настройки', Icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation();
    // При isOpen = true ~240px, иначе ~64px
    const sidebarWidth = isOpen ? 'w-60' : 'w-16';

    const isActiveLink = (path: string) => location.pathname === path;

    return (
        <div
            className={`
                fixed
                h-full
                bg-white dark:bg-[#202020]
                border-r border-gray-200 dark:border-[#333]
                overflow-hidden
                transition-all duration-300
                flex flex-col
                ${sidebarWidth}
            `}
        >
            {/* Основное меню */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex-1 flex flex-col space-y-1">
                    {navItems.map(({ to, label, Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`
                                flex items-center
                                px-3 py-2
                                ${isActiveLink(to) 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'}
                                transition-colors
                            `}
                        >
                            <Icon className="h-6 w-6" />
                            {isOpen && <span className="ml-3">{label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>
            
            {/* Разделитель */}
            {isOpen && (
                <div className="px-4 py-2">
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <h3 className="mt-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Интеграция с клиентской частью
                    </h3>
                </div>
            )}
            
            {/* Секция интеграции */}
            <div className="px-3 pb-4">
                <nav className="flex-1 flex flex-col space-y-1">
                    {integrationItems.map(({ to, label, Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`
                                flex items-center
                                px-3 py-2
                                ${isActiveLink(to) 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'}
                                transition-colors
                            `}
                        >
                            <Icon className="h-6 w-6" />
                            {isOpen && <span className="ml-3">{label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;