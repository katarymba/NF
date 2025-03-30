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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative product-card">
            {/* Badges */}
            {isNew && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
                    Новинка
                </div>
            )}
            {isPopular && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
                    Хит продаж
                </div>
            )}

            <div className="w-full h-64 bg-gray-200 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        const fallbacks = [
                            `/images/products/${categorySlug}-category.jpg`,
                            '/images/products/fish-category.jpg'
                        ];
                        (e.target as HTMLImageElement).src = fallbacks[0] || fallbacks[1];
                    }}
                />
            </div>

            <div className="p-6 product-card-body">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{name}</h3>
                <p className="text-gray-700 mb-4">{description}</p>

                <div className="flex items-center justify-between mb-4 product-card-footer">
                    {price && (
                        <span className="text-lg font-bold text-blue-800">{price}</span>
                    )}
                    {weight && (
                        <span className="text-gray-600">{weight}</span>
                    )}
                </div>

                <Link
                    to={`/products/${categorySlug}/${slug}`}
                    className="btn-primary w-full block text-center"
                >
                    Подробнее
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;