/**
 * Компонент таблицы элементов заказа для страницы доставки
 * @file ais/ais-frontend/src/components/delivery/OrderItemsTable.tsx
 */

import React from 'react';
import './OrderItemsTable.css';

interface OrderItemProps {
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface OrderItemsTableProps {
  items: OrderItemProps[];
  total: number;
}

// Безопасная функция для форматирования чисел
const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) {
    return '0.00';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, total }) => {
  // Расчет итоговой суммы, если она не была предоставлена
  const calculatedTotal = items.reduce((sum, item) => {
    const itemSubtotal = item.subtotal || (item.price * item.quantity);
    return sum + itemSubtotal;
  }, 0);
  
  // Используем предоставленную сумму или вычисленную, если предоставленная равна 0
  const displayTotal = (total && total > 0) ? total : calculatedTotal;
  
  // Расчет общего количества товаров
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="order-items-table-container">
      <div className="order-items-table-header">
        <h3 className="order-items-table-title">Состав заказа</h3>
        <span className="order-items-table-count">{totalItems} шт.</span>
      </div>
      
      <div className="table-scroll-container">
        <table className="order-items-table">
          <thead>
            <tr>
              <th>ID товара</th>
              <th>Наименование</th>
              <th className="text-center">Количество</th>
              <th className="text-right">Цена за ед.</th>
              <th className="text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemSubtotal = item.subtotal || (item.price * item.quantity);
              return (
                <tr key={index}>
                  <td>{item.product_id}</td>
                  <td>{item.product_name || `Товар ${item.product_id}`}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatPrice(item.price)}</td>
                  <td className="text-right">{formatPrice(itemSubtotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="text-right font-bold">Итого:</td>
              <td className="text-right font-bold total-amount">{formatPrice(displayTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderItemsTable;