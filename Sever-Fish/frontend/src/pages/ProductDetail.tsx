import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories } = useProducts();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(API_ENDPOINTS.PRODUCT_BY_ID(Number(id)));
        setProduct(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке товара:', err);
        setError('Не удалось загрузить информацию о товаре');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const handleAddToCart = async () => {
    try {
      const success = await addToCart(product.id, quantity);
      
      if (!success) {
        setShowAuthModal(true);
      } else {
        // Показываем уведомление об успешном добавлении
        const addButton = document.getElementById('add-to-cart-button');
        if (addButton) {
          addButton.innerText = "Добавлено ✓";
          addButton.classList.add("bg-green-600");
          
          setTimeout(() => {
            addButton.innerText = "В корзину";
            addButton.classList.remove("bg-green-600");
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err);
    }
  };

  const handleGoToAuth = () => {
    localStorage.setItem('redirectAfterAuth', `/products/${id}`);
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 text-blue-700 hover:text-blue-900 font-medium"
          >
            Вернуться к списку товаров
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>Товар не найден.</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 text-blue-700 hover:text-blue-900 font-medium"
          >
            Перейти к списку товаров
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      {/* Хлебные крошки */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Главная
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <button 
                onClick={() => navigate('/products')}
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
              >
                Каталог
              </button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{product.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Изображение товара */}
          <div className="md:w-1/2">
            <img 
              src={product.image_url || "/placeholder.jpg"} 
              alt={product.name} 
              className="w-full h-72 md:h-96 object-cover"
            />
          </div>

          {/* Информация о товаре */}
          <div className="md:w-1/2 p-6">
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-medium">
                {getCategoryName(product.category_id)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {product.weight && (
              <p className="text-gray-600 mb-4">Вес/объем: {product.weight}</p>
            )}
            
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {product.description || "Описание товара отсутствует."}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <p className="text-3xl font-bold text-blue-700">
                {product.price?.toLocaleString()} ₽
              </p>
            </div>
            
            <div className="mt-6 flex items-center">
              <div className="flex border border-gray-300 rounded">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-x border-gray-300 focus:outline-none py-1" 
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  +
                </button>
              </div>
              <button 
                id="add-to-cart-button"
                onClick={handleAddToCart}
                className="ml-4 flex-grow px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded transition-colors"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
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

export default ProductDetail;