import React from 'react';
import { Link } from 'react-router-dom';

// Компонент, отображающий уведомление об авторизации
const AuthNotification = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-8 border border-gray-200 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-medium text-blue-900 mb-3">Для просмотра корзины необходимо 
          <Link to="/auth" className="text-blue-700 hover:text-blue-900 hover:underline mx-1">войти в аккаунт</Link> 
          или 
          <Link to="/auth" className="text-blue-700 hover:text-blue-900 hover:underline mx-1">зарегистрироваться</Link>.
        </h2>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Link 
          to="/products" 
          className="px-6 py-2 bg-white border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-50 transition-colors"
        >
          Вернуться к покупкам
        </Link>
        
        <Link 
          to="/auth" 
          className="px-6 py-2 bg-blue-800 text-white font-medium rounded hover:bg-blue-900 transition-colors"
        >
          Войти в аккаунт
        </Link>
      </div>
    </div>
  );
};

export default AuthNotification;