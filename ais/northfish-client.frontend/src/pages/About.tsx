const About = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">О компании</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        ООО «Север-Рыба» — ведущий поставщик высококачественных морепродуктов из северных морей России
                    </p>
                </div>
            </section>

            {/* Company History */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-6">История компании</h2>
                            <p className="text-lg mb-4">
                                Компания «Север-Рыба» была основана в 2005 году группой профессионалов с многолетним опытом работы в рыбной промышленности. Начав с небольшого производства, мы постепенно расширяли ассортимент и географию поставок.
                            </p>
                            <p className="text-lg mb-4">
                                За годы работы мы завоевали доверие клиентов благодаря неизменно высокому качеству продукции и надежности партнерских отношений. Сегодня «Север-Рыба» — это современное предприятие с полным циклом производства: от вылова до доставки готовой продукции потребителю.
                            </p>
                        </div>
                        <div>
                            <img
                                src="/about-history.jpg"
                                alt="История компании"
                                className="rounded-lg shadow-lg w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/images/production-1.jpg";
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission and Values */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-12 text-center">Наша миссия и ценности</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Качество</h3>
                            <p className="text-gray-700">
                                Мы стремимся предлагать продукцию только высшего качества, соответствующую самым строгим стандартам безопасности и экологичности.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Устойчивое развитие</h3>
                            <p className="text-gray-700">
                                Мы заботимся о сохранении морских ресурсов и ведем ответственный промысел, следуя принципам устойчивого развития.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-4">Команда</h3>
                            <p className="text-gray-700">
                                Наш успех строится на профессионализме команды — опытных специалистов, преданных своему делу и разделяющих ценности компании.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-12 text-center">Наша команда</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="text-center">
                                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                                    <img
                                        src={`/team-${item}.jpg`}
                                        alt="Член команды"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/images/user-placeholder.jpg";
                                        }}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{getTeamMemberName(item)}</h3>
                                <p className="text-gray-600 mb-3">{getTeamMemberPosition(item)}</p>
                                <p className="text-gray-700">
                                    {getTeamMemberDescription(item)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

// Функции для генерации имен сотрудников
function getTeamMemberName(index: number): string {
    const names = [
        'Иванов Иван Иванович',
        'Петров Петр Петрович',
        'Сидорова Анна Владимировна',
        'Козлов Алексей Сергеевич'
    ];
    return names[index - 1] || `Сотрудник ${index}`;
}

// Функции для генерации должностей сотрудников
function getTeamMemberPosition(index: number): string {
    const positions = [
        'Генеральный директор',
        'Коммерческий директор',
        'Начальник производства',
        'Главный технолог'
    ];
    return positions[index - 1] || 'Специалист';
}

// Функции для генерации описаний сотрудников
function getTeamMemberDescription(index: number): string {
    const descriptions = [
        'Более 15 лет опыта в рыбной промышленности. Отвечает за стратегическое развитие компании.',
        'Руководит отделом продаж и отвечает за расширение клиентской базы и развитие партнерских отношений.',
        'Контролирует все процессы производства и обеспечивает соблюдение стандартов качества.',
        'Разрабатывает новые продукты и совершенствует технологии производства.'
    ];
    return descriptions[index - 1] || 'Ценный сотрудник нашей компании с многолетним опытом работы.';
}

export default About;