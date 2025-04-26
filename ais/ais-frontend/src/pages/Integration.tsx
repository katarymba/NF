import React, { useState, useEffect } from 'react';
import { 
  checkIntegrationStatus, 
  reconnectRabbitMQ,
  sendOrderToSeverRyba,
  requestProductStock,
  sendPaymentToSeverRyba
} from '../services/integration';
import { getOrders } from '../services/api';

const IntegrationPage: React.FC = () => {
  const [status, setStatus] = useState<{ status: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | ''>('');
  const [productIds, setProductIds] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Проверяем токен
  const token = localStorage.getItem('token') || '';

  // Получаем статус интеграции при загрузке страницы
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const statusData = await checkIntegrationStatus(token);
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching integration status:', error);
        setMessage({ type: 'error', text: 'Не удалось получить статус интеграции' });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    fetchOrders();
  }, [token]);

  // Получаем список заказов
  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Переподключение к RabbitMQ
  const handleReconnect = async () => {
    try {
      setLoading(true);
      const result = await reconnectRabbitMQ(token);
      setStatus({ status: result.status, message: result.message });
      setMessage({ type: 'success', text: 'Переподключение выполнено успешно' });
    } catch (error) {
      console.error('Error reconnecting:', error);
      setMessage({ type: 'error', text: 'Ошибка при переподключении к RabbitMQ' });
    } finally {
      setLoading(false);
    }
  };

  // Отправка заказа в Север-Рыбу
  const handleSendOrder = async () => {
    if (!selectedOrderId) {
      setMessage({ type: 'error', text: 'Выберите заказ для отправки' });
      return;
    }

    try {
      setLoading(true);
      const result = await sendOrderToSeverRyba(Number(selectedOrderId), token);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error('Error sending order:', error);
      setMessage({ type: 'error', text: 'Ошибка при отправке заказа' });
    } finally {
      setLoading(false);
    }
  };

  // Запрос информации о наличии товаров
  const handleRequestStock = async () => {
    if (!productIds.trim()) {
      setMessage({ type: 'error', text: 'Введите ID товаров' });
      return;
    }

    try {
      setLoading(true);
      // Преобразуем строку с ID товаров в массив чисел
      const ids = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (ids.length === 0) {
        setMessage({ type: 'error', text: 'Некорректный формат ID товаров' });
        return;
      }
      
      const result = await requestProductStock(ids, token);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error('Error requesting stock:', error);
      setMessage({ type: 'error', text: 'Ошибка при запросе информации о наличии товаров' });
    } finally {
      setLoading(false);
    }
  };

  // Отправка платежа в Север-Рыбу
  const handleSendPayment = async () => {
    if (!selectedPaymentId) {
      setMessage({ type: 'error', text: 'Введите ID платежа' });
      return;
    }

    try {
      setLoading(true);
      const result = await sendPaymentToSeverRyba(Number(selectedPaymentId), token);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error('Error sending payment:', error);
      setMessage({ type: 'error', text: 'Ошибка при отправке информации о платеже' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Управление интеграцией с Север-Рыба</h1>
      
      {/* Статус интеграции */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Статус интеграции</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${status?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="font-medium">{status?.status === 'connected' ? 'Подключено' : 'Отключено'}</p>
            </div>
            <p className="text-gray-600">{status?.message}</p>
            <button
              onClick={handleReconnect}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              Переподключиться
            </button>
          </>
        )}
      </div>

      {/* Уведомление */}
      {message && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Операции интеграции */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Отправка заказа */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Отправка заказа</h3>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : '')}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Выберите заказ</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                Заказ #{order.id} - {order.status}
              </option>
            ))}
          </select>
          <button
            onClick={handleSendOrder}
            disabled={loading || !selectedOrderId}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            Отправить заказ
          </button>
        </div>

        {/* Запрос информации о наличии товаров */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Запрос наличия товаров</h3>
          <input
            type="text"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
            placeholder="ID товаров через запятую (например: 1, 2, 3)"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleRequestStock}
            disabled={loading || !productIds.trim()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Запросить наличие
          </button>
        </div>

        {/* Отправка информации о платеже */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Отправка информации о платеже</h3>
          <input
            type="number"
            value={selectedPaymentId}
            onChange={(e) => setSelectedPaymentId(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID платежа"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleSendPayment}
            disabled={loading || !selectedPaymentId}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
          >
            Отправить информацию о платеже
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;