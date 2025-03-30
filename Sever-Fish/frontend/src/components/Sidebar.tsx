import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    // Предотвращаем скролл при открытом сайдбаре на мобильных устройствах
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <>
            {/* Затемнение за сайдбаром на мобильных */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Сайдбар */}
            <div className={`
                fixed top-0 left-0 h-full bg-white z-50 
                transform transition-transform duration-300 ease-in-out
                w-64 shadow-lg
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:h-auto md:shadow-none md:z-0
                md:hidden
            `}>
                {/* Заголовок и кнопка закрытия */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-blue-900">Меню</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 md:hidden"
                        onClick={onClose}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Навигационные ссылки */}
                <nav className="p-4">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                ГЛАВНАЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                ПРОДУКЦИЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/production"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                ПРОИЗВОДСТВО
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recipes"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                РЕЦЕПТЫ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                О НАС
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contacts"
                                className="block text-gray-700 hover:text-blue-800 font-semibold"
                                onClick={onClose}
                            >
                                КОНТАКТЫ
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Кнопка связи */}
                <div className="p-4 mt-6">
                    <Link
                        to="/contacts"
                        className="block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-semibold rounded hover:bg-blue-800 hover:text-white transition-colors duration-300"
                        onClick={onClose}
                    >
                        Связаться с нами
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Sidebar;