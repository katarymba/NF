/**
 * Компонент бейджа статуса заказа
 * @file ais/ais-frontend/src/components/delivery/OrderStatusBadge.tsx
 */

import React from 'react';
import { ClockIcon, ArrowPathIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import './OrderStatusBadge.css';

export enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

interface OrderStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'medium' }) => {
  let statusClass = 'status-unknown';
  let statusText = 'Неизвестно';
  let icon = <ClockIcon className="status-icon" />;
  
  switch (status.toLowerCase()) {
    case DeliveryStatus.PENDING:
      statusClass = 'status-pending';
      statusText = 'Ожидает обработки';
      icon = <ClockIcon className="status-icon" />;
      break;
    case DeliveryStatus.PROCESSING:
      statusClass = 'status-processing';
      statusText = 'В обработке';
      icon = <ArrowPathIcon className="status-icon" />;
      break;
    case DeliveryStatus.SHIPPED:
      statusClass = 'status-shipped';
      statusText = 'Отправлен';
      icon = <TruckIcon className="status-icon" />;
      break;
    case DeliveryStatus.DELIVERED:
      statusClass = 'status-delivered';
      statusText = 'Доставлен';
      icon = <CheckCircleIcon className="status-icon" />;
      break;
    case DeliveryStatus.CANCELLED:
      statusClass = 'status-cancelled';
      statusText = 'Отменен';
      icon = <XCircleIcon className="status-icon" />;
      break;
    default:
      statusText = status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  return (
    <div className={`status-badge ${statusClass} ${size}`}>
      {icon}
      <span className="status-text">{statusText}</span>
    </div>
  );
};

export default OrderStatusBadge;