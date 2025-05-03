/**
 * Компонент для отображения элементов заказа
 * @file src/components/OrderItems.tsx
 * @author katarymba
 * @date 2025-05-03
 */

import React from 'react';
import { OrderItem, formatPrice } from '../../models/types';
import '../styles/OrderItems.css';

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  // Вычисление общего количества товаров
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="order-items">
      <h3>Состав заказа <span className="items-count">({totalItems} шт.)</span></h3>
      
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>ID товара</th>
              <th>Цена за шт.</th>
              <th>Количество</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              
              return (
                <tr key={index}>
                  <td>{item.product_id}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderItems;