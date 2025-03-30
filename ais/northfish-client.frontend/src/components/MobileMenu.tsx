import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    // Предотвращаем скролл при открытом меню
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
            {/* Затемнение за меню */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}

            {/* Боковое меню */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-blue-900">МЕНЮ</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                        aria-label="Закрыть меню"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
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

                <nav className="p-4">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                ГЛАВНАЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                ПРОДУКЦИЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/production"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                ПРОИЗВОДСТВО
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recipes"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                РЕЦЕПТЫ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                О НАС
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contacts"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={onClose}
                            >
                                КОНТАКТЫ
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 mt-4">
                    <Link
                        to="/contacts"
                        className="block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-800 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        Связаться с нами
                    </Link>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;