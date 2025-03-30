import { Link } from 'react-router-dom';

interface HeaderProps {
    onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Левая часть (кнопка меню) */}
                <div className="w-1/3 flex justify-start">
                    {/* Кнопка открытия сайдбара (меню) */}
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onMenuToggle}
                        aria-label="Открыть меню"
                    >
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Логотип по центру */}
                <div className="w-1/3 flex justify-center">
                    <Link to="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Север-Рыба"
                            className="h-16"
                            onError={(e) => {
                                // Пробуем несколько вариантов путей к логотипу
                                const fallbacks = [
                                    "/images/logo.png",
                                    "/nf_logo.favicon.svg"
                                ];
                                let fallbackIndex = 0;

                                const tryNextFallback = () => {
                                    if (fallbackIndex < fallbacks.length) {
                                        (e.target as HTMLImageElement).src = fallbacks[fallbackIndex++];
                                    } else {
                                        // Если ни один путь не сработал, просто скрываем изображение
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }
                                };

                                (e.target as HTMLImageElement).onerror = tryNextFallback;
                                tryNextFallback();
                            }}
                        />
                    </Link>
                </div>

                {/* Правая часть (иконки корзины и профиля) */}
                <div className="w-1/3 flex justify-end items-center space-x-4">
                    {/* Иконка корзины */}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </button>

                    {/* Иконка профиля */}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;