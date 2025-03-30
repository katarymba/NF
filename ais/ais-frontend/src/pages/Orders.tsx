// src/pages/Orders.tsx

import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';

interface Order {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
    // Можно добавить другие поля, если потребуется
}

interface OrdersProps {
    token: string;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getOrders(token)
            .then((data) => setOrders(data))
            .catch((err) => setError(err.message || 'Ошибка получения заказов'));
    }, [token]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Orders</h1>
            {error && <p className="text-red-500">{error}</p>}
            {orders.length > 0 ? (
                <ul className="space-y-4">
                    {orders.map((order) => (
                        <li key={order.id} className="p-4 border rounded">
                            <h2 className="font-bold">Order #{order.id}</h2>
                            <p>Total Price: ${order.total_price}</p>
                            <p>Status: {order.status}</p>
                            <p>Created At: {new Date(order.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No orders available.</p>
            )}
        </div>
    );
};

export default Orders;
