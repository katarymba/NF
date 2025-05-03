/**
 * Компонент карточки информации о клиенте для страницы доставки
 * @file ais/ais-frontend/src/components/delivery/ClientInfoCard.tsx
 */

import React from 'react';
import { UserIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import './ClientInfoCard.css';

interface ClientInfoCardProps {
  clientName: string;
  userId?: number;
  phone?: string;
  email?: string;
  username?: string;
  isActive?: boolean;
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ 
  clientName, 
  userId, 
  phone, 
  email, 
  username, 
  isActive = true 
}) => {
  return (
    <div className="client-info-card">
      <h3 className="client-info-card-title">Информация о клиенте</h3>
      
      <div className="client-info-card-content">
        <div className="client-info-card-primary">
          <div className="client-avatar">
            {clientName.charAt(0).toUpperCase()}
          </div>
          <div className="client-name-container">
            <span className="client-name">{clientName}</span>
            {isActive !== undefined && (
              <span className={`client-status ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'Активный' : 'Неактивный'}
              </span>
            )}
          </div>
        </div>
        
        <div className="client-info-card-details">
          {userId && (
            <div className="client-detail-item">
              <IdentificationIcon className="client-detail-icon" />
              <div className="client-detail-content">
                <span className="client-detail-label">ID пользователя</span>
                <span className="client-detail-value">{userId}</span>
              </div>
            </div>
          )}
          
          {phone && (
            <div className="client-detail-item">
              <PhoneIcon className="client-detail-icon" />
              <div className="client-detail-content">
                <span className="client-detail-label">Телефон</span>
                <span className="client-detail-value">{phone}</span>
              </div>
            </div>
          )}
          
          {email && (
            <div className="client-detail-item">
              <EnvelopeIcon className="client-detail-icon" />
              <div className="client-detail-content">
                <span className="client-detail-label">Email</span>
                <span className="client-detail-value">{email}</span>
              </div>
            </div>
          )}
          
          {username && (
            <div className="client-detail-item">
              <UserIcon className="client-detail-icon" />
              <div className="client-detail-content">
                <span className="client-detail-label">Логин</span>
                <span className="client-detail-value">{username}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;