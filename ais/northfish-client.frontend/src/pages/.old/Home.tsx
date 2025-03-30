import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Добро пожаловать в AIS Frontend</h1>
            <p className="text-lg">
                Это главная страница вашего приложения. Здесь можно разместить основное содержимое,
                ссылки на другие разделы и другую важную информацию.
            </p>
        </div>
    );
};

export default Home;
