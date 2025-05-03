/**
 * Компонент для отображения статуса заказа
 * @file src/components/OrderStatus.tsx
 * @author katarymba
 * @date 2025-05-03
 */

import React from 'react';
import { getStatusClass, getStatusText } from '../../models/types';
import '../styles/OrderStatus.css';

interface OrderStatusProps {
  status: string;
  withLabel?: boolean;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status, withLabel = false }) => {
  const statusClass = getStatusClass(status);
  const statusText = getStatusText(status);

  return (
    <div className="order-status-wrapper">
      {withLabel && <span className="status-label">Статус:</span>}
      <div className={`order-status ${statusClass}`}>
        {statusText}
      </div>
    </div>
  );
};

export default OrderStatus;