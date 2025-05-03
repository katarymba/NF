/**
 * Компонент для отображения информации о клиенте
 * @file src/components/ClientInfo.tsx
 * @author katarymba
 * @date 2025-05-03
 */

import React from 'react';
import { User } from '../../models/types';
import '../styles/ClientInfo.css';

interface ClientInfoProps {
  user: User;
  isLoading?: boolean;
  error?: string | null;
}

const ClientInfo: React.FC<ClientInfoProps> = ({ user, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="client-info-container skeleton">
        <h2>Информация о клиенте</h2>
        <div className="client-info">
          <div className="info-item skeleton-text"></div>
          <div className="info-item skeleton-text"></div>
          <div className="info-item skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-info-container error">
        <h2>Информация о клиенте</h2>
        <div className="client-info">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-info-container">
      <h2>Информация о клиенте</h2>
      <div className="client-info">
        <div className="info-item">
          <span className="info-label">ФИО:</span>
          <span className="info-value">{user.full_name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Телефон:</span>
          <span className="info-value">{user.phone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Email:</span>
          <span className="info-value">{user.email}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Логин:</span>
          <span className="info-value">{user.username}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Статус:</span>
          <span className={`info-value ${user.is_active ? 'active-user' : 'inactive-user'}`}>
            {user.is_active ? 'Активный' : 'Неактивный'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;