import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  weight?: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductDetail: React.FC<{ updateCartCount: () => void }> = ({ updateCartCount }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/products/${id}`);
        setProduct(res.data);
        
        // Если продукт получен успешно, также получаем данные о категории
        if (res.data.category_id) {
          try {
            const catRes = await axios.get(`http://127.0.0.1:8000/products/categories/`);
            const foundCategory = catRes.data.find((cat: Category) => cat.id === res.data.category_id);
            if (foundCategory) {
              setCategory(foundCategory);
            }
          } catch (categoryError) {
            console.error("Ошибка при загрузке категории:", categoryError);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error);
        setError("Не удалось загрузить информацию о товаре. Пожалуйста, попробуйте позже.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    
    // Проверяем, авторизован ли пользователь
    if (!token || !tokenType) {
      // Показываем модальное окно или перенаправляем на страницу авторизации
      setShowAuthModal(true);
      return;
    }
    
    try {
      setIsAdding(true);
      
      // Отправляем запрос с токеном авторизации
      await axios.post("http://127.0.0.1:8000/cart/", {
        product_id: product.id,
        quantity,
      }, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      
      updateCartCount();
      
      // Показываем сообщение об успешном добавлении
      setTimeout(() => {
        setIsAdding(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      setError("Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже.");
      setIsAdding(false);
      
      // Если ошибка связана с авторизацией (401), показываем модальное окно
      if (error.response && error.response.status === 401) {
        setShowAuthModal(true);
      }
    }
  };
  
  // Обработчик для перехода на страницу авторизации
  const handleGoToAuth = () => {
    // Сохраняем текущее состояние, чтобы вернуться после авторизации
    localStorage.setItem('redirectAfterAuth', `/products/${id}`);
    navigate('/auth');
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    if (Number.isInteger(price)) {
      return `${price} ₽`;
    }
    return `${price.toFixed(2)} ₽`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
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

  // URL изображения по умолчанию в случае ошибки
  const defaultImage = '/images/products/default-product.jpg';

  return (
    <div className="max-w-4xl mx-auto my-12 bg-white rounded-xl shadow-md overflow-hidden p-4 md:p-8">
      {/* Хлебные крошки */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-700">Главная</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-700">Продукция</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/products/category/${category.slug}`} className="hover:text-blue-700">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>
      
      {/* Основной контент */}
      <div className="md:flex md:items-start">
        {/* Изображение товара */}
        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
          <div className="overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
            <img 
              src={product.image_url || defaultImage} 
              alt={product.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultImage) {
                  target.src = defaultImage;
                }
              }}
            />
          </div>
        </div>
        
        {/* Информация о товаре */}
        <div className="md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          
          {/* Цена и наличие */}
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-blue-900 mr-4">{formatPrice(product.price)}</span>
            <span className="inline-block py-1 px-2 bg-green-100 text-green-800 text-sm font-medium rounded">В наличии</span>
          </div>
          
          {/* Вес */}
          {product.weight && (
            <div className="text-gray-600 mb-4">
              <span className="font-medium">Вес:</span> {product.weight}
            </div>
          )}
          
          {/* Описание */}
          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Описание</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          
          {/* Выбор количества и добавление в корзину */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 bg-gray-100 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-700 hover:bg-gray-200"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max="99"
                className="w-16 h-10 border-t border-b border-gray-300 text-center text-gray-700"
              />
              <button
                onClick={increaseQuantity}
                className="w-10 h-10 bg-gray-100 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-700 hover:bg-gray-200"
              >
                +
              </button>
            </div>
            
            <button
              onClick={addToCart}
              disabled={isAdding}
              className={`w-full py-3 px-6 ${
                isAdding ? 'bg-green-600' : 'bg-blue-700 hover:bg-blue-800'
              } text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              {isAdding ? '✓ Добавлено в корзину' : 'Добавить в корзину'}
            </button>
          </div>
          
          {/* Дополнительная информация */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>Консультация специалиста</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-7h13v7a.5.5 0 01-.5.5zM4 8.5v-3a.5.5 0 01.5-.5h11a.5.5 0 01.5.5v3H4z" />
              </svg>
              <span>Оплата при получении</span>
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