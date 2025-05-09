import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Импортируем изображение 404
import image404 from '../assets/images/404.png';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Перейти назад в истории браузера
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Верхняя навигация - уменьшенные кнопки */}
      <div className="pt-4 pb-2 px-4 flex justify-center">
        <div className="flex items-center justify-center space-x-6 max-w-5xl w-full">
          <button 
            onClick={handleGoBack}
            className="text-amber-500 hover:text-amber-600 font-medium text-sm tracking-wide"
          >
            НАЗАД
          </button>
          <span className="text-gray-300 text-sm">|</span>
          <Link 
            to="/login" 
            className="text-amber-500 hover:text-amber-600 font-medium text-sm tracking-wide"
          >
            ВХОД
          </Link>
        </div>
      </div>
      
      {/* Основное содержимое с изображением 404 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full px-4 flex justify-center">
          <img 
            src={image404} 
            alt="Страница не найдена - 404" 
            className="w-auto h-auto mx-auto"
            style={{ maxWidth: "85%", maxHeight: "55vh" }}
          />
        </div>
      </div>
      
      {/* Нижняя часть с текстом */}
      <div className="text-center pb-6 px-4">
        <h2 className="uppercase text-gray-500 text-sm mb-2">ПРОИЗОШЛА ОШИБКА</h2>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 text-xs">
            Страница, которую Вы ищите, не найдена или не существует.
            {' '}
            Вы можете {' '}
            <Link to="/" className="text-[#2196f3] hover:underline">
              перейти на главную страницу
            </Link>
            {' '} сайта или любой раздел из меню выше.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;