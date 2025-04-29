import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthNotificationProps {
  redirectPath?: string;
}

const AuthNotification: React.FC<AuthNotificationProps> = ({ redirectPath = '/cart' }) => {
  const navigate = useNavigate();
  
  // Сохраняем текущий путь в localStorage для перенаправления после авторизации
  useEffect(() => {
    localStorage.setItem('redirectAfterAuth', redirectPath);
  }, [redirectPath]);

  return (
    <div className="auth-notification-container">
      <div className="auth-notification">
        <h2>Для доступа необходимо войти в аккаунт</h2>
        <p>Пожалуйста, авторизуйтесь для продолжения</p>
        <button 
          onClick={() => navigate('/auth')} 
          className="login-button">
          Войти в аккаунт
        </button>
      </div>
      
      <style jsx>{`
        .auth-notification-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 15px;
        }
        
        .auth-notification {
          background-color: #f7fafd;
          border: 1px solid #e0e8f0;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .auth-notification h2 {
          color: #1a3a5c;
          font-size: 22px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .auth-notification p {
          color: #647d98;
          font-size: 16px;
          margin-bottom: 25px;
        }
        
        .login-button {
          background-color: #1a5f7a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .login-button:hover {
          background-color: #124759;
        }
        
        @media (max-width: 600px) {
          .auth-notification {
            padding: 20px;
          }
          
          .auth-notification h2 {
            font-size: 18px;
          }
          
          .auth-notification p {
            font-size: 14px;
          }
          
          .login-button {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthNotification;