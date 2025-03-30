import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface HeaderProps {
    onMenuToggle: () => void;
    cartCount: number;
    updateCartCount: () => void;
}

const Header = ({ onMenuToggle, cartCount, updateCartCount }: HeaderProps) => {
    useEffect(() => {
        // Периодическое обновление корзины
        const interval = setInterval(() => {
            updateCartCount();
        }, 30000); // обновлять корзину каждые 30 секунд

        return () => clearInterval(interval);
    }, [updateCartCount]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="w-1/3 flex justify-start">
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onMenuToggle}
                        aria-label="Открыть меню"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className="w-1/3 flex justify-center">
                    <Link to="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Север-Рыба" className="h-16" />
                    </Link>
                </div>

                <div className="w-1/3 flex justify-end items-center space-x-4">
                    <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/auth" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;