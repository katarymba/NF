import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  weight?: string;
  isNew?: boolean;
  isPopular?: boolean;
  onAddToCart: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  category,
  weight,
  isNew = false,
  isPopular = false,
  onAddToCart
}) => {
  // Хук для отслеживания состояния добавления в корзину
  const [isAdding, setIsAdding] = React.useState(false);

  // Обработчик добавления в корзину
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation(); // Предотвращаем всплытие события

    setIsAdding(true);
    
    onAddToCart(id);
    
    // Возвращаем кнопку в исходное состояние через 1 секунду
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    if (Number.isInteger(price)) {
      return `${price} ₽`;
    }
    return `${price.toFixed(2)} ₽`;
  };

  // Генерация URL изображения по умолчанию в случае ошибки
  const defaultImage = '/images/products/default-product.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Бейджи для новых и популярных товаров */}
      <div className="relative">
        {isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            Новинка
          </div>
        )}
        {isPopular && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            Хит продаж
          </div>
        )}
        
        {/* Изображение товара с ссылкой на детальную страницу */}
        <Link to={`/products/${id}`} className="block">
          <div className="h-48 overflow-hidden">
            <img
              src={image || defaultImage}
              alt={name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultImage) {
                  target.src = defaultImage;
                }
              }}
            />
          </div>
        </Link>
      </div>
      
      {/* Информация о товаре */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Имя и категория */}
        <div className="mb-auto">
          <Link to={`/products/${id}`} className="block">
            <h3 className="text-lg font-medium text-gray-800 hover:text-blue-800 transition-colors">
              {name}
            </h3>
          </Link>
          
          {category && (
            <Link to={`/products/category/${category.slug}`} className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
              {category.name}
            </Link>
          )}
          
          {weight && <p className="text-sm text-gray-500 mt-1">Вес: {weight}</p>}
        </div>
        
        {/* Цена и кнопка добавления в корзину */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-900">{formatPrice(price)}</span>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {isAdding ? '✓ Добавлено' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;