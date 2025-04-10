// ais/ais-frontend/src/pages/Orders.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';

interface Order {
   id: number;
   total_price: number;
   status: string;
   created_at: string;
   customer_name?: string;
   // Дополнительные поля
}

interface OrdersProps {
   token: string;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [filter, setFilter] = useState<string>('all');

   useEffect(() => {
       const fetchOrders = async () => {
           try {
               setLoading(true);
               // Используем функцию из api.ts, которая корректно обрабатывает ошибки
               const data = await getOrders();
               setOrders(data);
               setError(null);
           } catch (err) {
               console.error('Ошибка при загрузке заказов:', err);
               setError('Не удалось загрузить данные заказов');
           } finally {
               setLoading(false);
           }
       };

       if (token) {
           fetchOrders();
       } else {
           setLoading(false);
           setError('Требуется авторизация');
       }
   }, [token]);

   // Функция форматирования даты
   const formatDate = (dateString: string): string => {
       try {
           const options: Intl.DateTimeFormatOptions = {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           };
           return new Date(dateString).toLocaleDateString('ru-RU', options);
       } catch (e) {
           return dateString;
       }
   };

   // Функция форматирования цены
   const formatPrice = (price: number): string => {
       try {
           return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ' ₽';
       } catch (e) {
           return `${price} ₽`;
       }
   };

   // Функция получения класса для статуса заказа
   const getStatusClass = (status: string): string => {
       switch (status) {
           case 'new':
               return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
           case 'processing':
               return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
           case 'shipped':
               return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
           case 'completed':
               return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
           case 'cancelled':
               return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
           default:
               return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
       }
   };

   // Функция получения названия статуса заказа
   const getStatusLabel = (status: string): string => {
       const statusLabels: {[key: string]: string} = {
           'new': 'Новый',
           'processing': 'Обрабатывается',
           'shipped': 'Отправлен',
           'completed': 'Выполнен',
           'cancelled': 'Отменен'
       };
       return statusLabels[status] || status;
   };

   // Фильтрация заказов по статусу
   const filteredOrders = filter === 'all' 
       ? orders 
       : orders.filter(order => order.status === filter);

   // Если нет данных, показываем заглушку
   if (loading) {
       return (
           <div className="flex justify-center items-center h-48">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
           </div>
       );
   }

   if (error) {
       return (
           <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
               <p>{error}</p>
               <p className="mt-2 text-sm">На данный момент сервер с заказами может быть недоступен. Это тестовая версия приложения.</p>
           </div>
       );
   }

   return (
       <div className="container mx-auto p-4">
           <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Заказы</h1>
               <div className="flex space-x-2">
                   <select 
                       value={filter}
                       onChange={(e) => setFilter(e.target.value)}
                       className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   >
                       <option value="all">Все заказы</option>
                       <option value="new">Новые</option>
                       <option value="processing">В обработке</option>
                       <option value="shipped">Отправленные</option>
                       <option value="completed">Выполненные</option>
                       <option value="cancelled">Отмененные</option>
                   </select>
               </div>
           </div>
           
           {filteredOrders.length === 0 ? (
               <div className="text-center py-12">
                   <p className="text-gray-500 dark:text-gray-400">Нет заказов для отображения</p>
                   {/* Пример заказа для удобства разработки */}
                   <div className="mt-8 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                       <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">Пример заказа (данные для разработки)</h2>
                       <div className="mt-2 bg-white dark:bg-gray-800 shadow-sm p-4 rounded-md">
                           <div className="flex justify-between">
                               <div>
                                   <p className="font-medium">Заказ #123456</p>
                                   <p className="text-sm text-gray-500">Иванов Иван</p>
                               </div>
                               <div className="text-right">
                                   <p className="text-sm text-gray-500">12 апр. 2025, 15:30</p>
                                   <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                       Новый
                                   </span>
                               </div>
                           </div>
                           <p className="mt-2 font-medium">Сумма: 12 500 ₽</p>
                       </div>
                   </div>
               </div>
           ) : (
               <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                   <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700">
                               <tr>
                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       ID
                                   </th>
                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       Клиент
                                   </th>
                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       Дата
                                   </th>
                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       Сумма
                                   </th>
                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       Статус
                                   </th>
                                   <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                       Действия
                                   </th>
                               </tr>
                           </thead>
                           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                               {filteredOrders.map((order) => (
                                   <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                           #{order.id}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                           {order.customer_name || 'Неизвестно'}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                           {formatDate(order.created_at)}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                           {formatPrice(order.total_price)}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap">
                                           <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                               {getStatusLabel(order.status)}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                           <Link 
                                               to={`/orders/${order.id}`}
                                               className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                           >
                                               Подробнее
                                           </Link>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}
       </div>
   );
};

export default Orders;