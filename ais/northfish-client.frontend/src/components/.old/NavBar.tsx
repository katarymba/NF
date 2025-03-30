import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, FolderIcon, CalendarIcon, DocumentIcon, ChartPieIcon } from '@heroicons/react/24/solid';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <HomeIcon className="h-6 w-6 text-gray-300" /> },
    { to: '/products', label: 'Products', icon: <UsersIcon className="h-6 w-6 text-gray-300" /> },
    { to: '/orders', label: 'Orders', icon: <FolderIcon className="h-6 w-6 text-gray-300" /> },
    { to: '/address', label: 'Address Book', icon: <CalendarIcon className="h-6 w-6 text-gray-300" /> },
    { to: '/calendar', label: 'Calendar', icon: <DocumentIcon className="h-6 w-6 text-gray-300" /> },
];

const SideBar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    return (
        <div
            className={`fixed left-0 top-0 h-full bg-gray-900 dark:bg-gray-800 text-white transition-all duration-300 ease-in-out ${
                isExpanded ? 'w-56' : 'w-16'
            } flex flex-col items-start`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Логотип */}
            <div className="py-4 w-full flex justify-center">
                <img src="/logo.png" alt="Logo" className="h-8" />
            </div>

            {/* Навигация */}
            <nav className="w-full flex flex-col flex-grow">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center py-4 px-3 transition-all duration-300 ease-in-out hover:bg-gray-700 dark:hover:bg-gray-600 ${
                            location.pathname === item.to ? 'bg-gray-700 dark:bg-gray-600' : ''
                        }`}
                    >
                        <div className="w-10 flex justify-center flex-shrink-0">
                            {item.icon}
                        </div>
                        {isExpanded && (
                            <div className="ml-3 whitespace-nowrap overflow-hidden">
                                {item.label}
                            </div>
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default SideBar;