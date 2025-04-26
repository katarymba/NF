import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Products = ({ updateCartCount }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const productsPerPage = 12;

  // Базовый URL API
  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке продуктов:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/categories/`);
      setCategories(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
    }
  };

  const fetchProductsByCategory = async (categorySlug) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/products/category/${categorySlug}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке товаров по категории:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category.id);
    setCurrentPage(1);
    
    if (category.slug) {
      await fetchProductsByCategory(category.slug);
    } else {
      await fetchProducts();
    }
  };

  const addToCart = async (productId, event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке
    
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    
    // Проверяем, авторизован ли пользователь
    if (!token || !tokenType) {
      // Показываем модальное окно для авторизации
      setShowAuthModal(true);
      return;
    }
    
    try {
      const button = event.currentTarget;
      // Анимация для кнопки
      button.innerText = "Добавлено ✓";
      button.classList.add("bg-green-600");
      
      // Отправляем запрос с токеном авторизации
      await axios.post(`${API_BASE_URL}/cart/`, {
        product_id: productId,
        quantity: 1,
      }, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      
      // Обновляем счетчик корзины
      updateCartCount();
      
      // Возвращаем исходный текст после короткой задержки
      setTimeout(() => {
        button.innerText = "В корзину";
        button.classList.remove("bg-green-600");
      }, 1500);
    } catch (error) {
      console.error("Ошибка при добавлении в корзину:", error);
      // Если ошибка связана с авторизацией (401), показываем модальное окно
      if (error.response && error.response.status === 401) {
        setShowAuthModal(true);
      }
    }
  };

  // Обработчик для перехода на страницу авторизации
  const handleGoToAuth = () => {
    // Сохраняем текущее состояние, чтобы вернуться после авторизации
    localStorage.setItem('redirectAfterAuth', '/products');
    navigate('/auth');
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id.toString() === selectedCategory)
    : products;

  const lastProductIndex = currentPage * productsPerPage;
  const firstProductIndex = lastProductIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(firstProductIndex, lastProductIndex);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Функция для генерации границ пагинации
  const getPaginationRange = () => {
    const delta = 2; // Количество страниц до и после текущей
    let range = [];
    
    // Всегда показываем первую страницу
    range.push(1);
    
    // Создаем диапазон вокруг текущей страницы
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    // Всегда показываем последнюю страницу, если она существует
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    // Добавляем многоточия, где нужно
    let result = [];
    let lastVal = 0;
    
    for (const val of range) {
      if (lastVal && val - lastVal > 1) {
        result.push("...");
      }
      result.push(val);
      lastVal = val;
    }
    
    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Каталог продукции</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Боковая панель с категориями - фиксированное положение */}
        <aside className="lg:w-1/4">
          <div className="bg-white shadow-sm rounded-lg p-5 lg:sticky lg:top-5">
            <h2 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">Категории</h2>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                    fetchProducts();
                  }}
                  className={`w-full text-left py-2 px-3 rounded transition-colors ${
                    selectedCategory === "" 
                    ? "bg-blue-50 text-blue-800 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Все товары
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full text-left py-2 px-3 rounded transition-colors ${
                      selectedCategory === cat.id.toString() 
                      ? "bg-blue-50 text-blue-800 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="lg:w-3/4">
          {/* Loader */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">Товары не найдены</p>
                </div>
              ) : (
                <>
                  {/* Сетка продуктов */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/products/${product.id}`} className="block relative">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.image_url || "/placeholder.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-800 text-lg mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description || "Без описания"}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-800">{product.price?.toLocaleString()} ₽</span>
                              <button
                                onClick={(e) => addToCart(product.id, e)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                В корзину
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          &larr;
                        </button>
                        
                        {getPaginationRange().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => page !== "..." && setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-blue-50 border-blue-700 text-blue-800"
                                : page === "..."
                                ? "text-gray-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          &rarr;
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Модальное окно для авторизации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Требуется авторизация</h2>
            <p className="text-gray-600 mb-6">
              Для добавления товаров в корзину необходимо войти в аккаунт или зарегистрироваться.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Отмена
              </button>
              <button 
                onClick={handleGoToAuth}
                className="px-4 py-2 bg-blue-700 rounded text-white hover:bg-blue-800"
              >
                Войти / Зарегистрироваться
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;