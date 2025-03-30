import React from 'react';
import { Link } from 'react-router-dom';
// Импорт нужных иконок
import {
    HomeIcon,
    ShoppingCartIcon,
    ArchiveBoxIcon,
    WalletIcon,
    TruckIcon,
} from '@heroicons/react/24/solid';

interface SidebarProps {
    isOpen: boolean;
}

const navItems = [
    { to: '/dashboard', label: 'Главная', Icon: HomeIcon },
    { to: '/products', label: 'Товары', Icon: ShoppingCartIcon },
    { to: '/orders', label: 'Заказы', Icon: ArchiveBoxIcon },
    { to: '/payments', label: 'Платежи', Icon: WalletIcon },
    { to: '/shipments', label: 'Доставка', Icon: TruckIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    // При isOpen = true ~240px, иначе ~64px
    const sidebarWidth = isOpen ? 'w-60' : 'w-16';

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
            {/* Пример шапки сайдбара */}
            {/* <div className="p-4 font-bold text-gray-800 dark:text-gray-200">
        {isOpen ? 'PLACEHOLDER FOR SOMETHING' : 'MK'}
      </div> */}

            {/* Список пунктов меню */}
            <nav className="flex-1 flex flex-col space-y-2 mt-2">
                {navItems.map(({ to, label, Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className="
              flex items-center
              px-3 py-2
              hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
              text-gray-700 dark:text-gray-200
              transition-colors
            "
                    >
                        {/* Иконка слева (увеличена до h-6 w-6) */}
                        <Icon className="h-6 w-6" />
                        {/* Если боковая панель развернута, отображаем текст */}
                        {isOpen && <span className="ml-3">{label}</span>}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
