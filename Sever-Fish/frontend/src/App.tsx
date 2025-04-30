import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductCategory from './pages/ProductCategory';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Recipes from './pages/Recipes';
import Production from './pages/Production';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import axios from 'axios';
import Account from './pages/Account';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import MobileMenu from './components/MobileMenu';
import ProductDetail from './pages/ProductDetail';
// Добавляем импорт API_BASE_URL
import { API_BASE_URL } from './utils/apiConfig';

// Компонент для защиты приватных маршрутов
function RequireAuth({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem('token');
    const location = useLocation();
    
    if (!token) {
        // Запоминаем текущий путь для перенаправления после авторизации
        localStorage.setItem('redirectAfterAuth', location.pathname);
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    return children;
}

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Функция для обновления счетчика корзины
    const updateCartCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('tokenType') || 'Bearer';
            
            if (!token) {
                setCartCount(0);
                return;
            }
            
            // Пробуем получить данные корзины
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
            
            // Проверяем формат данных
            const data = response.data;
            
            if (data && Array.isArray(data.items)) {
                // Если data.items - массив, используем его
                setCartCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
            } else if (data && typeof data === 'object') {
                // Если data - объект, но не с ожидаемой структурой, ищем другие поля
                if (Array.isArray(data.cart_items)) {
                    setCartCount(data.cart_items.reduce((sum, item) => sum + item.quantity, 0));
                } else if (data.total_items !== undefined) {
                    // Если есть поле total_items, используем его
                    setCartCount(data.total_items);
                } else {
                    // Иначе устанавливаем 0
                    console.log("Формат данных корзины не содержит ожидаемых полей:", data);
                    setCartCount(0);
                }
            } else {
                // Если data не соответствует ожидаемой структуре, устанавливаем 0
                console.log("Неожиданный формат данных корзины:", data);
                setCartCount(0);
            }
        } catch (error) {
            console.error("Ошибка при загрузке корзины:", error);
            // Если ошибка 401 (Unauthorized), сбрасываем данные авторизации
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('tokenType');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
            }
            setCartCount(0);
        }
    };
  
    // Функция для переключения меню (четко определенная)
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prevState => !prevState);
    };

    // Функция для закрытия меню
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Настройка интерцептора axios
    useEffect(() => {
        // Добавляем токен авторизации ко всем запросам
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                const tokenType = localStorage.getItem('tokenType') || 'Bearer';
                
                if (token) {
                    config.headers.Authorization = `${tokenType} ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
        
        // Обрабатываем ошибки авторизации
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    // Если сервер ответил 401, пользователь не авторизован
                    console.log('Ошибка авторизации, перенаправление на страницу входа');
                }
                return Promise.reject(error);
            }
        );
        
        // Удаляем интерцепторы при размонтировании
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // Обновляем корзину при загрузке приложения
    useEffect(() => {
        updateCartCount();
    }, []);

    // Управление классом body для мобильного меню
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    // Проверяем, нужно ли перенаправить пользователя после авторизации
    useEffect(() => {
        const token = localStorage.getItem('token');
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        
        if (token && redirectPath) {
            // Очищаем информацию о перенаправлении
            localStorage.removeItem('redirectAfterAuth');
            // Обновляем количество товаров в корзине
            updateCartCount();
        }
    }, []);

    return (
        <Router>
            <Header 
                onMenuToggle={toggleMobileMenu} 
                cartCount={cartCount} 
                updateCartCount={updateCartCount} 
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products updateCartCount={updateCartCount} />} />
                <Route path="/products/category/:category" element={<Products updateCartCount={updateCartCount} />} />
                <Route path="/products/:id" element={<ProductDetail updateCartCount={updateCartCount} />} />
                
                {/* Защищенные маршруты */}
                <Route path="/cart" element={
                    <RequireAuth>
                        <Cart updateCartCount={updateCartCount} />
                    </RequireAuth>
                } />
                <Route path="/account" element={
                    <RequireAuth>
                        <Account />
                    </RequireAuth>
                } />
                
                {/* Общедоступные маршруты */}
                <Route path="/about" element={<About />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/production" element={<Production />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Перенаправление для несуществующих маршрутов */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <CookieConsent />
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                setIsOpen={setIsMobileMenuOpen} 
            />
        </Router>
    );
}

export default App;