import { Link } from 'react-router-dom';

const Recipes = () => {
    const recipes = [
        {
            id: 1,
            title: 'Горячий салат с копченым лососем',
            description: 'Изысканный вкус копченого лосося от Север-Рыбы идеально дополняет свежие овощи и легкую заправку. Отличный выбор для тех, кто ценит здоровое питание и премиальное качество',
            image: '/recipes/smoked-salmon-salad.jpg',
            slug: 'hot-smoked-salmon-salad'
        },
        {
            id: 2,
            title: 'Севиче из свежей рыбы',
            description: 'Свежесть и изысканность севиче от Север-Рыбы раскрывают оттенки вкуса рыбы, дополненные лимонным соком и тропическими акцентами. Попробуйте приготовить этот рецепт и убедитесь в качестве нашей продукции',
            image: '/recipes/fish-ceviche.jpg',
            slug: 'fresh-fish-ceviche'
        },
        {
            id: 3,
            title: 'Тартар из лосося с авокадо',
            description: 'Нежный тартар из свежего лосося с кремовым авокадо создаёт изысканное сочетание текстур и вкусов. Идеальная закуска для особых случаев или гурманов, ищущих утончённые вкусы',
            image: '/recipes/salmon-tartare-avocado.jpg',
            slug: 'salmon-tartare-avocado'
        },
        {
            id: 4,
            title: 'Паста с морепродуктами в сливочном соусе',
            description: 'Сочные креветки и кальмары в сливочном соусе с пастой аль денте создают идеальное сочетание. Быстрое и вкусное блюдо, которое покорит всех любителей морепродуктов',
            image: '/recipes/seafood-pasta.jpg',
            slug: 'creamy-seafood-pasta'
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">ВКУСНЫЕ БЛЮДА ИЗ РЫБЫ</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Откройте для себя лучшие сочетания!
                    </p>
                </div>
            </section>

            {/* Recipes Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-10">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="w-full h-80 bg-gray-200">
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const fallbackImages = [
                                                '/images/products/fish-category.jpg',
                                                '/images/products/seafood-category.jpg'
                                            ];
                                            (e.target as HTMLImageElement).src = fallbackImages[recipe.id % 2];
                                        }}
                                    />
                                </div>
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-blue-900 mb-4">{recipe.title}</h2>
                                    <p className="text-gray-700 mb-4">
                                        {recipe.description}
                                    </p>
                                    <Link
                                        to={`/recipes/${recipe.slug}`}
                                        className="text-blue-800 font-medium hover:text-blue-600"
                                    >
                                        Подробнее
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Приготовьте изысканные блюда из нашей продукции</h2>
                    <p className="text-lg mb-8 max-w-3xl mx-auto">
                        Оцените высочайшее качество продукции «Север-Рыба» в своих кулинарных шедеврах.
                        Наши рыба и морепродукты сохраняют все полезные свойства и природный вкус.
                    </p>
                    <Link to="/products" className="btn-primary">
                        Перейти к продукции
                    </Link>
                </div>
            </section>
        </>
    );
};

export default Recipes;