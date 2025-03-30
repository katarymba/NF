import { Link } from 'react-router-dom';
import SimpleWaveAnimation from '../components/SimpleWaveAnimation';

const Home = () => {
    return (
        <>
            {/* Hero Section with fixed background */}
            <section className="relative">
                <div
                    className="bg-cover bg-center h-screen md:h-[80vh] relative"
                    style={{
                        backgroundImage: 'url("/images/backgrounds/seafood-bg.jpg")',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Semi-transparent overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>

                    {/* Content */}
                    <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
                        <div className="text-center">
                            <h2 className="text-white text-2xl mb-2">СЕВЕР-РЫБА</h2>
                            <h1 className="text-white text-4xl md:text-6xl font-bold mb-8">ЭТАЛОН КАЧЕСТВА</h1>
                            <Link
                                to="/products"
                                className="btn-primary inline-block"
                            >
                                Наши продукты
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wave Animation (positioned to overlap with the hero section) */}
            <div className="relative z-20" style={{ marginTop: '-83px' }}>
                <SimpleWaveAnimation />
            </div>

            {/* Texture container - wraps all content after wave animation */}
            <div className="relative" style={{
                position: 'relative',
                backgroundImage: 'url("/images/backgrounds/fish-texture.svg")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px',
                backgroundAttachment: 'fixed',
                backgroundBlendMode: 'soft-light'
            }}>
                {/* Quality Standard Section */}
                <section className="py-12 md:py-20 relative z-10" style={{
                    backgroundColor: '#f9fafb',
                    position: 'relative'
                }}>
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-blue-900 text-3xl font-bold mb-8">«СЕВЕР-РЫБА» — ЭТАЛОН КАЧЕСТВА!</h2>
                            <p className="text-lg mb-12">
                                Компания «Север-Рыба» является ведущим поставщиком высококачественных морепродуктов в России.
                                Мы специализируемся на добыче и переработке рыбы в северных морях,
                                обеспечивая наших клиентов свежей и экологически чистой продукцией.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Gradient transition to fish texture */}
                <div className="h-3" style={{
                    background: 'linear-gradient(to bottom, #f9fafb, transparent)',
                    position: 'relative',
                    zIndex: 19,
                    marginTop: '-2rem'
                }}></div>

                {/* Production Section */}
                <section className="py-12 md:py-20" style={{
                    position: 'relative'
                }}>
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Собственное производство</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Production card 1 */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <img
                                    src="/images/backgrounds/seafood-bg.jpg"
                                    alt="Современное оборудование"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3">Современное оборудование</h3>
                                    <p className="text-gray-700">
                                        Наше производство оснащено передовым оборудованием,
                                        позволяющим сохранять все полезные свойства рыбы.
                                    </p>
                                </div>
                            </div>

                            {/* Production card 2 */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <img
                                    src="/images/products/fish-category.jpg"
                                    alt="Строгий контроль качества"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3">Строгий контроль качества</h3>
                                    <p className="text-gray-700">
                                        Каждая партия продукции проходит тщательную проверку на соответствие
                                        самым высоким стандартам качества.
                                    </p>
                                </div>
                            </div>

                            {/* Production card 3 */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <img
                                    src="/images/products/caviar-category.jpg"
                                    alt="Экологически чистый продукт"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3">Экологически чистый продукт</h3>
                                    <p className="text-gray-700">
                                        Мы добываем рыбу в экологически чистых водах северных морей,
                                        что гарантирует высокое качество нашей продукции.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <Link to="/production" className="btn-outline inline-block">
                                Подробнее о производстве
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Products Preview */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Наша продукция</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "Рыба", image: "/images/products/fish-category.jpg", slug: "fish" },
                                { name: "Икра", image: "/images/products/caviar-category.jpg", slug: "caviar" },
                                { name: "Морепродукты", image: "/images/products/seafood-category.jpg", slug: "seafood" }
                            ].map((category) => (
                                <Link to={`/products/${category.slug}`} className="group" key={category.slug}>
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="w-full h-48 bg-gray-200 overflow-hidden">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const fallback = "/images/products/default-category.jpg";
                                                    (e.target as HTMLImageElement).src = fallback;
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 text-center">
                                            <h3 className="text-xl font-bold">{category.name}</h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link to="/products" className="btn-primary inline-block">
                                Вся продукция
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;