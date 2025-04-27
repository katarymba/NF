import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Account from './pages/Account';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import MobileMenu from './components/MobileMenu';
import ProductDetail from './pages/ProductDetail';

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/cart/', {
                method: 'GET',
                credentials: 'include',  // Важно для передачи куки сессии
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Если пользователь не авторизован, это нормально - просто показываем 0 товаров
                    console.log('Пользователь не авторизован, корзина пуста');
                    setCartCount(0);
                    return;
                }
                throw new Error(`Ошибка при загрузке корзины: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const totalCount = data.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalCount);
        } catch (error) {
            console.error('Ошибка при загрузке корзины:', error);
            // Не устанавливаем count в 0, сохраняем последнее значение в случае временных проблем с сетью
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

    useEffect(() => {
        updateCartCount();
    }, []);

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
                <Route path="/cart" element={<Cart updateCartCount={updateCartCount} />} />
                <Route path="/account" element={<Account />} />
                <Route path="/about" element={<About />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/production" element={<Production />} />
                <Route path="/auth" element={<Auth />} />
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