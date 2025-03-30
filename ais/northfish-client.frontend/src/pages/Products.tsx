import { Link } from 'react-router-dom';

const Products = () => {
    const productCategories = [
        {
            id: 1,
            name: 'Рыба',
            image: '/products-fish.jpg',
            description: 'Свежемороженая, соленая и копченая рыба высшего качества из экологически чистых вод северных морей.',
            slug: 'fish'
        },
        {
            id: 2,
            name: 'Икра',
            image: '/products-caviar.jpg',
            description: 'Икра высшего качества, упакованная с соблюдением всех норм для сохранения свежести и вкуса.',
            slug: 'caviar'
        },
        {
            id: 3,
            name: 'Морепродукты',
            image: '/products-seafood.jpg',
            description: 'Широкий ассортимент свежемороженых морепродуктов: креветки, мидии, кальмары и многое другое.',
            slug: 'seafood'
        },
        {
            id: 4,
            name: 'Полуфабрикаты',
            image: '/products-semi finished.jpg',
            description: 'Готовые к приготовлению блюда из рыбы и морепродуктов: котлеты, фрикадельки, тефтели и многое другое.',
            slug: 'semi-finished'
        },
        {
            id: 5,
            name: 'Консервы',
            image: '/products-canned.jpg',
            description: 'Консервы из рыбы и морепродуктов: печень трески, горбуша, скумбрия, килька в томатном соусе и многое другое.',
            slug: 'canned'
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Наша продукция</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Мы предлагаем широкий ассортимент рыбной продукции высочайшего качества из северных морей России
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productCategories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="w-full h-64 bg-gray-200">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `/images/products/${category.slug}-category.jpg`;
                                        }}
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-blue-900 mb-3">{category.name}</h3>
                                    <p className="text-gray-700">{category.description}</p>
                                    <Link to={`/products/${category.slug}`} className="mt-4 btn-primary inline-block text-center">
                                        Подробнее
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quality Guarantee */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-blue-900 mb-6">Гарантия качества</h2>
                        <p className="text-lg mb-8">
                            Вся наша продукция сертифицирована и соответствует самым высоким стандартам качества.
                            Мы контролируем каждый этап производства, от вылова до упаковки.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-white p-4 rounded-lg shadow flex items-center">
                                <svg className="w-10 h-10 text-blue-900 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>ХАССП сертификация</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow flex items-center">
                                <svg className="w-10 h-10 text-blue-900 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>ISO 9001:2015</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow flex items-center">
                                <svg className="w-10 h-10 text-blue-900 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Экологический сертификат</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;