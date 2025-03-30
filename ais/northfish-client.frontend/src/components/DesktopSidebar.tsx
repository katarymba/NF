import { Link, useLocation } from 'react-router-dom';

interface DesktopSidebarProps {
    onNavigate?: () => void;
}

const DesktopSidebar = ({ onNavigate }: DesktopSidebarProps) => {
    const location = useLocation();

    // Function to check if a link is active
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="hidden md:block w-64 min-h-screen bg-white shadow-md">
            <div className="p-6 sticky top-24">
                <h2 className="text-xl font-bold text-blue-900 mb-6">МЕНЮ</h2>
                <nav>
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                ГЛАВНАЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/products')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                ПРОДУКЦИЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/production"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/production')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                ПРОИЗВОДСТВО
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recipes"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/recipes')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                РЕЦЕПТЫ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/about')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                О НАС
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contacts"
                                className={`block font-medium text-base uppercase ${
                                    isActive('/contacts')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'
                                }`}
                                onClick={onNavigate}
                            >
                                КОНТАКТЫ
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Кнопка связи */}
                <div className="mt-8">
                    <Link
                        to="/contacts"
                        className="block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-800 hover:text-white transition-colors duration-300"
                        onClick={onNavigate}
                    >
                        Связаться с нами
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DesktopSidebar;