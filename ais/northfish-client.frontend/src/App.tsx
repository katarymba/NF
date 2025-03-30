import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductCategory from './pages/ProductCategory';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Recipes from './pages/Recipes';
import Production from './pages/Production';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import MobileMenu from './components/MobileMenu';

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Effect to handle body scroll when mobile menu is open
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

    // Handler for closing mobile menu when route changes
    const handleCloseMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

                {/* Mobile Menu - Only visible when open */}
                <MobileMenu isOpen={isMobileMenuOpen} onClose={handleCloseMenu} />

                {/* Main content */}
                <main className="flex-grow w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:categorySlug" element={<ProductCategory />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/recipes" element={<Recipes />} />
                        <Route path="/production" element={<Production />} />
                    </Routes>
                </main>

                <Footer />
                <CookieConsent />
            </div>
        </Router>
    );
}

export default App;