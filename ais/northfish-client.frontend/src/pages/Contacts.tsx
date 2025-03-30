import React, { useState } from 'react';

const Contacts = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, you would send the form data to your backend
        console.log('Form submitted:', formData);
        setFormSubmitted(true);
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
        });
    };

    return (
        <>
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Контакты</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Свяжитесь с нами, чтобы узнать больше о нашей продукции или стать нашим партнером
                    </p>
                </div>
            </section>

            {/* Contact Info and Form */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-8">Наши контакты</h2>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-3">Офис</h3>
                                <div className="flex items-start mb-4">
                                    <svg className="w-6 h-6 text-blue-800 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="mb-1">Адрес:</p>
                                        <p className="text-gray-700">г. Мурманск, ул. Рыбная, 15</p>
                                    </div>
                                </div>
                                <div className="flex items-start mb-4">
                                    <svg className="w-6 h-6 text-blue-800 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <div>
                                        <p className="mb-1">Телефон:</p>
                                        <p className="text-gray-700">+7 (815) 123-45-67</p>
                                    </div>
                                </div>
                                <div className="flex items-start mb-4">
                                    <svg className="w-6 h-6 text-blue-800 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <div>
                                        <p className="mb-1">Email:</p>
                                        <p className="text-gray-700">info@sever-ryba.ru</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-3">Производство</h3>
                                <div className="flex items-start mb-4">
                                    <svg className="w-6 h-6 text-blue-800 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="mb-1">Адрес:</p>
                                        <p className="text-gray-700">г. Мурманск, порт, причал 12</p>
                                    </div>
                                </div>
                                <div className="flex items-start mb-4">
                                    <svg className="w-6 h-6 text-blue-800 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <div>
                                        <p className="mb-1">Телефон:</p>
                                        <p className="text-gray-700">+7 (815) 123-45-68</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3">Режим работы</h3>
                                <p className="text-gray-700 mb-2">Понедельник — Пятница: 9:00 — 18:00</p>
                                <p className="text-gray-700">Суббота, Воскресенье: выходные</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-8">Обратная связь</h2>

                            {formSubmitted ? (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                                    <p>Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.</p>
                                </div>
                            ) : null}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Ваше имя *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-800"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-800"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Телефон</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-800"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Сообщение *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-800"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Отправить
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Мы на карте</h2>
                    <div className="h-96 bg-gray-300 rounded-lg">
                        {/* Here you would typically integrate a map API */}
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-600">Карта загружается...</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contacts;