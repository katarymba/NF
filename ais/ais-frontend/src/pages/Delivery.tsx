import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Delivery.css'; // Подключаем стили, создадим позже

interface Order {
  id: number;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string;
}

const Delivery: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Фетчим заказы из API
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('/api/orders');
        setOrders(response.data);
        setFilteredOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить заказы. Попробуйте позже.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Фильтрация заказов
  useEffect(() => {
    const filtered = orders.filter((order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  if (loading) {
    return <div className="delivery-page">Загрузка...</div>;
  }

  if (error) {
    return <div className="delivery-page error">{error}</div>;
  }

  return (
    <div className="delivery-page">
      <h1>Страница доставки</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск по имени клиента..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {filteredOrders.length === 0 ? (
        <p>Нет заказов для отображения.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Дата создания</th>
              <th>Трек-номер</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.status}</td>
                <td>{order.totalAmount} ₽</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.trackingNumber || 'Нет данных'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Delivery;