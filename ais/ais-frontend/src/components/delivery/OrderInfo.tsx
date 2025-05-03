/**
 * Компонент для отображения информации о заказе
 * @file src/components/OrderInfo.tsx
 * @author katarymba
 * @date 2025-05-03
 */

import React from 'react';
import { Order, formatDate, formatPrice } from '../../models/types';
import OrderStatus from './OrderStatus';
import OrderItems from '../OrderItems';
import '../styles/OrderInfo.css';

interface OrderInfoProps {
  order: Order;
  isLoading?: boolean;
  error?: string | null;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ order, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="order-info-container skeleton">
        <h2>Информация о заказе</h2>
        <div className="order-header skeleton-text"></div>
        <div className="delivery-address skeleton-text"></div>
        <div className="order-items-skeleton"></div>
        <div className="order-total skeleton-text"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-info-container error">
        <h2>Информация о заказе</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="order-info-container">
      <h2>Информация о заказе #{order.id}</h2>
      
      <div className="order-header">
        <div className="order-date">
          <span className="info-label">Дата заказа:</span>
          <span className="info-value">{formatDate(order.created_at)}</span>
        </div>
        <OrderStatus status={order.status} />
      </div>
      
      <div className="delivery-address">
        <span className="info-label">Адрес доставки:</span>
        <span className="info-value">{order.delivery_address}</span>
      </div>
      
      <OrderItems items={order.order_items} />
      
      <div className="order-total">
        <span className="info-label">Итого:</span>
        <span className="info-value">{formatPrice(order.total_price)}</span>
      </div>
    </div>
  );
};

export default OrderInfo;