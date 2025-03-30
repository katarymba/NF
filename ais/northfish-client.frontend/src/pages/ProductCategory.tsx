import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Интерфейсы для типизации
interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price?: string;
    weight?: string;
    new?: boolean;
    popular?: boolean;
    slug: string;
}

interface CategoryData {
    title: string;
    description: string;
    products: Product[];
}

const ProductCategory = () => {
    const { categorySlug } = useParams<{categorySlug: string}>();

    // Данные категорий продуктов
    const categories: Record<string, CategoryData> = {
        'fish': {
            title: 'Рыба',
            description: 'Наша рыба - это высочайшее качество и свежесть. Мы предлагаем широкий ассортимент свежемороженой, копченой и соленой рыбы из северных морей России.',
            products: [
                {
                    id: 1,
                    name: 'Треска свежемороженая',
                    description: 'Свежемороженая треска, выловленная в экологически чистых водах Баренцева моря. Идеально подходит для приготовления различных блюд.',
                    image: '/products/fish-1.jpg',
                    price: '450 ₽',
                    weight: '1 кг',
                    slug: 'fresh-frozen-cod'
                },
                {
                    id: 2,
                    name: 'Лосось холодного копчения',
                    description: 'Лосось холодного копчения, приготовленный по традиционной технологии на ольховой щепе. Нежный вкус и аромат.',
                    image: '/products/fish-2.jpg',
                    price: '890 ₽',
                    weight: '300 г',
                    popular: true,
                    slug: 'cold-smoked-salmon'
                },
                {
                    id: 3,
                    name: 'Скумбрия горячего копчения',
                    description: 'Скумбрия горячего копчения с неповторимым ароматом и сочным мясом. Идеальная закуска для праздничного стола.',
                    image: '/products/fish-3.jpg',
                    price: '420 ₽',
                    weight: '500 г',
                    slug: 'hot-smoked-mackerel'
                },
                {
                    id: 4,
                    name: 'Палтус солёный',
                    description: 'Палтус солёный, приготовленный по специальному рецепту. Нежная текстура и богатый вкус.',
                    image: '/products/fish-4.jpg',
                    price: '680 ₽',
                    weight: '350 г',
                    slug: 'salted-halibut'
                },
                {
                    id: 5,
                    name: 'Сельдь слабосоленая',
                    description: 'Сельдь слабосоленая с добавлением специй. Традиционный продукт, приготовленный по классическому рецепту.',
                    image: '/products/fish-5.jpg',
                    price: '320 ₽',
                    weight: '500 г',
                    popular: true,
                    slug: 'lightly-salted-herring'
                },
                {
                    id: 6,
                    name: 'Форель радужная свежемороженая',
                    description: 'Свежемороженая радужная форель. Отличается нежным мясом и изысканным вкусом.',
                    image: '/products/fish-6.jpg',
                    price: '590 ₽',
                    weight: '1 кг',
                    new: true,
                    slug: 'fresh-frozen-rainbow-trout'
                }
            ]
        },
        'caviar': {
            title: 'Икра',
            description: 'Икра от компании «Север-Рыба» - это настоящий деликатес, который порадует вас своим неповторимым вкусом. Мы предлагаем только свежую икру высшего качества.',
            products: [
                {
                    id: 1,
                    name: 'Икра лососевая',
                    description: 'Икра лососевая высшего качества. Крупные ярко-оранжевые икринки с нежным вкусом.',
                    image: '/products/caviar-1.jpg',
                    price: '3900 ₽',
                    weight: '500 г',
                    popular: true,
                    slug: 'salmon-caviar'
                },
                {
                    id: 2,
                    name: 'Икра форели',
                    description: 'Икра форели, отличающаяся нежным вкусом и мелкими икринками. Идеально подходит для канапе и закусок.',
                    image: '/products/caviar-2.jpg',
                    price: '3600 ₽',
                    weight: '500 г',
                    slug: 'trout-caviar'
                },
                {
                    id: 3,
                    name: 'Икра щуки',
                    description: 'Икра щуки, обладающая неповторимым вкусом и ароматом. Традиционный русский деликатес.',
                    image: '/products/caviar-3.jpg',
                    price: '1800 ₽',
                    weight: '250 г',
                    new: true,
                    slug: 'pike-caviar'
                },
                {
                    id: 4,
                    name: 'Икра минтая',
                    description: 'Икра минтая - питательный и полезный продукт, богатый белками и жирными кислотами Омега-3.',
                    image: '/products/caviar-4.jpg',
                    price: '950 ₽',
                    weight: '250 г',
                    slug: 'pollock-caviar'
                }
            ]
        },
        'seafood': {
            title: 'Морепродукты',
            description: 'Морепродукты от компании «Север-Рыба» - это богатый выбор креветок, кальмаров, мидий и других даров моря. Высокое качество и свежесть гарантированы.',
            products: [
                {
                    id: 1,
                    name: 'Креветки королевские',
                    description: 'Крупные королевские креветки, обладающие нежным и сладковатым вкусом. Идеально подходят для салатов и горячих блюд.',
                    image: '/products/seafood-1.jpg',
                    price: '1200 ₽',
                    weight: '1 кг',
                    popular: true,
                    slug: 'king-prawns'
                },
                {
                    id: 2,
                    name: 'Кальмары свежемороженые',
                    description: 'Свежемороженые кальмары, очищенные и готовые к приготовлению. Нежное мясо с легким морским вкусом.',
                    image: '/products/seafood-2.jpg',
                    price: '480 ₽',
                    weight: '1 кг',
                    slug: 'fresh-frozen-squid'
                },
                {
                    id: 3,
                    name: 'Мидии в створках',
                    description: 'Свежемороженые мидии в створках, сохранившие все полезные свойства и натуральный вкус.',
                    image: '/products/seafood-3.jpg',
                    price: '590 ₽',
                    weight: '1 кг',
                    slug: 'mussels-in-shells'
                },
                {
                    id: 4,
                    name: 'Осьминоги мини',
                    description: 'Маленькие осьминоги, идеально подходящие для салатов и закусок. Нежное мясо с изысканным вкусом.',
                    image: '/products/seafood-4.jpg',
                    price: '950 ₽',
                    weight: '500 г',
                    new: true,
                    slug: 'mini-octopus'
                },
                {
                    id: 5,
                    name: 'Морской коктейль',
                    description: 'Смесь морепродуктов: кальмары, мидии, креветки и осьминоги. Идеально подходит для приготовления пасты и ризотто.',
                    image: '/products/seafood-5.jpg',
                    price: '680 ₽',
                    weight: '500 г',
                    popular: true,
                    slug: 'seafood-mix'
                }
            ]
        },
        'prepared-foods': {
            title: 'Полуфабрикаты',
            description: 'Полуфабрикаты от компании «Север-Рыба» - это готовые к приготовлению блюда из рыбы и морепродуктов. Быстро, вкусно и полезно!',
            products: [
                {
                    id: 1,
                    name: 'Котлеты из трески',
                    description: 'Котлеты из филе трески с добавлением лука и специй. Готовятся за 15 минут.',
                    image: '/products/prepared-1.jpg',
                    price: '420 ₽',
                    weight: '400 г',
                    popular: true,
                    slug: 'cod-cutlets'
                },
                {
                    id: 2,
                    name: 'Рыбные палочки из минтая',
                    description: 'Рыбные палочки из филе минтая в хрустящей панировке. Быстрое и вкусное блюдо для всей семьи.',
                    image: '/products/prepared-2.jpg',
                    price: '380 ₽',
                    weight: '500 г',
                    slug: 'pollock-fish-sticks'
                },
                {
                    id: 3,
                    name: 'Фарш из лосося',
                    description: 'Фарш из свежего филе лосося. Идеально подходит для приготовления котлет, тефтелей и рыбных пирогов.',
                    image: '/products/prepared-3.jpg',
                    price: '590 ₽',
                    weight: '500 г',
                    slug: 'salmon-mince'
                },
                {
                    id: 4,
                    name: 'Тефтели из трески',
                    description: 'Тефтели из филе трески с добавлением риса и специй. Готовятся в духовке или на пару.',
                    image: '/products/prepared-4.jpg',
                    price: '450 ₽',
                    weight: '400 г',
                    new: true,
                    slug: 'cod-meatballs'
                }
            ]
        },
        'canned': {
            title: 'Консервы',
            description: 'Рыбные консервы от компании «Север-Рыба» - это удобный способ наслаждаться вкусом морепродуктов в любое время. Высокое качество и длительный срок хранения.',
            products: [
                {
                    id: 1,
                    name: 'Печень трески',
                    description: 'Печень трески натуральная. Источник витаминов A, D и Омега-3 жирных кислот.',
                    image: '/products/canned-1.jpg',
                    price: '280 ₽',
                    weight: '230 г',
                    popular: true,
                    slug: 'cod-liver'
                },
                {
                    id: 2,
                    name: 'Горбуша натуральная',
                    description: 'Консервы из горбуши в собственном соку. Без добавления масла и консервантов.',
                    image: '/products/canned-2.jpg',
                    price: '190 ₽',
                    weight: '245 г',
                    slug: 'natural-pink-salmon'
                },
                {
                    id: 3,
                    name: 'Килька в томатном соусе',
                    description: 'Традиционные консервы из кильки в томатном соусе. Готовое блюдо или ингредиент для салатов.',
                    image: '/products/canned-3.jpg',
                    price: '120 ₽',
                    weight: '240 г',
                    slug: 'sprats-in-tomato-sauce'
                },
                {
                    id: 4,
                    name: 'Скумбрия в масле',
                    description: 'Филе скумбрии в растительном масле. Нежное и сочное мясо с пикантным вкусом.',
                    image: '/products/canned-4.jpg',
                    price: '220 ₽',
                    weight: '250 г',
                    slug: 'mackerel-in-oil'
                },
                {
                    id: 5,
                    name: 'Сайра тихоокеанская',
                    description: 'Консервы из сайры в собственном соку. Богатый источник белка и полезных жиров.',
                    image: '/products/canned-5.jpg',
                    price: '170 ₽',
                    weight: '245 г',
                    new: true,
                    slug: 'pacific-saury'
                }
            ]
        }
    };

    // Категория по умолчанию, если неверный slug
    const defaultCategorySlug = 'fish';
    const category = categorySlug && categories[categorySlug] ? categories[categorySlug] : categories[defaultCategorySlug];

    // Отображение других категорий, кроме текущей
    const otherCategories = Object.entries(categories)
        .filter(([slug]) => slug !== categorySlug)
        .map(([slug, data]) => ({
            slug,
            title: data.title
        }));

    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{category.title}</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        {category.description}
                    </p>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center mb-12 gap-2 md:gap-4">
                        <Link
                            to="/products/fish"
                            className={`px-4 py-2 rounded-md border ${categorySlug === 'fish' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Рыба
                        </Link>
                        <Link
                            to="/products/caviar"
                            className={`px-4 py-2 rounded-md border ${categorySlug === 'caviar' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Икра
                        </Link>
                        <Link
                            to="/products/seafood"
                            className={`px-4 py-2 rounded-md border ${categorySlug === 'seafood' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Морепродукты
                        </Link>
                        <Link
                            to="/products/prepared-foods"
                            className={`px-4 py-2 rounded-md border ${categorySlug === 'prepared-foods' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Полуфабрикаты
                        </Link>
                        <Link
                            to="/products/canned"
                            className={`px-4 py-2 rounded-md border ${categorySlug === 'canned' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Консервы
                        </Link>
                    </div>

                    {/* Products Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {category.products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden relative">
                                {/* Badges */}
                                {product.new && (
                                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                        Новинка
                                    </div>
                                )}
                                {product.popular && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                        Хит продаж
                                    </div>
                                )}

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-blue-900 mb-2">{product.name}</h3>
                                    <p className="text-gray-700 mb-4">{product.description}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        {product.price && (
                                            <span className="text-lg font-bold text-blue-800">{product.price}</span>
                                        )}
                                        {product.weight && (
                                            <span className="text-gray-600">{product.weight}</span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/products/${categorySlug}/${product.slug}`}
                                        className="btn-primary w-full block text-center"
                                    >
                                        Подробнее
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Other Categories */}
                    <div className="bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Другие категории продукции</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {otherCategories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    to={`/products/${cat.slug}`}
                                    className="bg-white p-4 rounded-md shadow-md text-center hover:shadow-lg transition-shadow"
                                >
                                    <span className="text-blue-800 font-semibold">{cat.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-12 text-center">Почему выбирают «Север-Рыба»</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Гарантированное качество</h3>
                                <p className="text-gray-700">Вся продукция проходит строгий контроль качества и соответствует международным стандартам</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Опытные специалисты</h3>
                                <p className="text-gray-700">Наши специалисты имеют многолетний опыт работы в рыбной промышленности</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Безопасность продукции</h3>
                                <p className="text-gray-700">Наша продукция производится с соблюдением всех санитарных норм и правил</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Сертифицированная продукция</h3>
                                <p className="text-gray-700">Вся наша продукция имеет необходимые сертификаты качества</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Доступные цены</h3>
                                <p className="text-gray-700">Мы предлагаем продукцию высокого качества по доступным ценам</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Быстрая доставка</h3>
                                <p className="text-gray-700">Мы осуществляем доставку продукции по всей России в кратчайшие сроки</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductCategory;