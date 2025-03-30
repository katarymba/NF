import { Link } from 'react-router-dom';

const Production = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Наше производство</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Современные технологии и традиционные методы для создания высококачественной продукции
                    </p>
                </div>
            </section>

            {/* Main Production Info */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-6">Собственное производство</h2>
                            <p className="text-lg mb-4">
                                В компании «Север-Рыба» мы гордимся производством высококачественной рыбы, икры и
                                морепродуктов, вкладывая в свою работу профессионализм и душу. Мы сохраняем неизменную
                                приверженность качеству в каждом из наших продуктов.
                            </p>
                            <p className="text-lg mb-4">
                                Используя как традиционные методы копчения, так и современные технологии в создании блюд из морепродуктов, мы доставляем
                                свежесть и вкусы моря прямо на ваш стол. Ознакомьтесь с нашим ассортиментом и откройте
                                для себя богатство морских деликатесов уже сегодня!
                            </p>
                        </div>
                        <div>
                            <img
                                src="/production-main.jpg"
                                alt="Производство Север-Рыба"
                                className="rounded-lg shadow-lg w-full h-auto"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/production-1.jpg';
                                }}
                            />
                        </div>
                    </div>

                    {/* Production Features */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Современное оборудование</h3>
                            <p className="text-gray-700 text-center">
                                Используем передовые технологии для обеспечения высокого качества и свежести нашей продукции
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Контроль качества</h3>
                            <p className="text-gray-700 text-center">
                                Строгий контроль на всех этапах производства гарантирует безопасность и высокое качество
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Традиционные рецепты</h3>
                            <p className="text-gray-700 text-center">
                                Сочетаем современные методы с традиционными рецептами копчения и засолки
                            </p>
                        </div>
                    </div>

                    {/* Production Facilities */}
                    <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Наши производственные мощности</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                            <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={`/production-facility-${index}.jpg`}
                                    alt={`Производственный цех ${index}`}
                                    className="w-full h-64 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `/images/production-${index <= 3 ? index : 3}.jpg`;
                                    }}
                                />
                                <div className="p-4 bg-white">
                                    <h3 className="font-bold text-lg mb-2">{getFacilityName(index)}</h3>
                                    <p className="text-gray-700">{getFacilityDescription(index)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">Сертификаты и стандарты качества</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                                <div className="h-32 mx-auto mb-4 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{getCertificateName(index)}</h3>
                                <p className="text-gray-700">
                                    {getCertificateDescription(index)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Познакомьтесь с нашей продукцией</h2>
                    <p className="text-lg mb-8 max-w-3xl mx-auto">
                        Оцените качество и вкус продукции, произведенной на нашем современном оборудовании
                        с соблюдением всех стандартов качества
                    </p>
                    <Link to="/products" className="btn-primary">
                        Посмотреть продукцию
                    </Link>
                </div>
            </section>
        </>
    );
};

// Вспомогательные функции для генерации текстов
function getFacilityName(index: number): string {
    const names = [
        'Цех переработки',
        'Цех копчения',
        'Цех упаковки',
        'Лаборатория',
        'Холодильный комплекс',
        'Логистический центр'
    ];
    return names[index - 1] || `Производственный цех ${index}`;
}

function getFacilityDescription(index: number): string {
    const descriptions = [
        'Современный цех для первичной обработки рыбы и морепродуктов',
        'Традиционное горячее и холодное копчение на натуральной щепе',
        'Вакуумная упаковка для сохранения свежести и увеличения срока хранения',
        'Постоянный контроль качества и безопасности продукции',
        'Современное холодильное оборудование для хранения продукции',
        'Оперативная доставка свежей продукции по всей России'
    ];
    return descriptions[index - 1] || 'Важное звено в нашей производственной цепочке';
}

function getCertificateName(index: number): string {
    const names = [
        'ХАССП',
        'ISO 9001:2015',
        'Экологический сертификат'
    ];
    return names[index - 1] || `Сертификат ${index}`;
}

function getCertificateDescription(index: number): string {
    const descriptions = [
        'Система управления безопасностью пищевых продуктов, основанная на анализе опасных факторов',
        'Международный стандарт системы менеджмента качества',
        'Подтверждает экологическую безопасность нашей продукции и производственных процессов'
    ];
    return descriptions[index - 1] || 'Подтверждает высокое качество нашей продукции';
}

export default Production;