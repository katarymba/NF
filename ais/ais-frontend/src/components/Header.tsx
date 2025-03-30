// src/components/Header.tsx

import React from 'react';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '../components/ThemeToggle';

interface HeaderProps {
    onToggleSidebar: () => void; // Функция для сворачивания/разворачивания Sidebar
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    return (
        <header
            className="
        sticky top-0
        w-full
        h-16
        px-6
        flex items-center
        bg-white dark:bg-[#303030]
        shadow
        z-50
        transition-colors
      "
        >
            {/* Кнопка-гамбургер */}
            <button
                onClick={onToggleSidebar}
                className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-[#424242] rounded"
            >
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>

            {/* Логотип (увеличен до h-10) */}
            <img
                src="/logo.png"
                alt="Logo"
                className="h-10 mr-6"
            />

            {/* Поисковая строка по центру */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        placeholder="Поиск"
                        className="
              w-full
              px-4 py-2
              rounded-full
              bg-gray-100 dark:bg-[#424242]
              text-sm text-gray-700 dark:text-gray-200
              focus:outline-none
            "
                    />
                    {/* Кнопка лупы (MagnifyingGlassIcon) */}
                    <button className="
            absolute right-1
            p-2
            hover:bg-gray-200 dark:hover:bg-[#505050]
            rounded-full
          ">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    </button>
                </div>
            </div>

            {/* Пример иконок справа (переключение темы, профиль) */}

            <div className="flex items-center space-x-4 ml-6">

                <div className="flex items-center space-x-4 ml-auto">
                    <ThemeToggle className="self-center h-10" />
                </div>


                <button className="p-2 hover:bg-gray-200 dark:hover:bg-[#424242] rounded">
                    <img
                        src="/user-avatar.png"
                        alt="User"
                        className="h-8 w-8 rounded-full"
                    />
                </button>
            </div>
        </header>
    );
};

export default Header;
