import { Link } from 'react-router-dom';

interface ProductCardProps {
    name: string;
    description: string;
    image: string;
    slug: string;
    categorySlug: string;
    price?: string;
    weight?: string;
    isNew?: boolean;
    isPopular?: boolean;
}

const ProductCard = ({
    name,
    description,
    image,
    slug,
    categorySlug,
    price,
    weight,
    isNew = false,
    isPopular = false
}: ProductCardProps) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative product-card p-4">
            {/* Badges */}
            {isNew && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
                    Новинка
                </div>
            )}
            {isPopular && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
                    Популярное
                </div>
            )}
            
            {/* Изображение товара */}
            <Link to={`/products/${categorySlug}/${slug}`}>
                <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
            </Link>
            
            {/* Информация о товаре */}
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">
                    <Link to={`/products/${categorySlug}/${slug}`} className="hover:text-blue-600 transition">
                        {name}
                    </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">{description}</p>
                {price && <p className="text-gray-800 font-bold">Цена: {price}</p>}
                {weight && <p className="text-gray-500 text-sm">Вес: {weight}</p>}
            </div>
            
            {/* Кнопка добавления в корзину */}
            <div className="p-4 flex justify-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Добавить в корзину
                </button>
            </div>
        </div>
    );
};

export default ProductCard;