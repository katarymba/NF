import { useEffect, useState } from "react";
import axios from "axios";
import {getPayments } from '../services/api';

interface Payment {
    id: number;
    order_id: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string | null;
    created_at: string;
}

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/payments")
            .then((response) => setPayments(response.data))
            .catch((error) => console.error("Ошибка загрузки платежей", error));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Список платежей
            </h1>

            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                {/* Заголовок таблицы */}
                <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        ID
                    </th>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        Заказ
                    </th>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        Метод
                    </th>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        Статус
                    </th>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        Транзакция
                    </th>
                    <th className="border px-4 py-2 text-gray-900 dark:text-gray-100 dark:border-gray-600">
                        Дата
                    </th>
                </tr>
                </thead>

                {/* Тело таблицы */}
                <tbody>
                {payments.map((payment) => (
                    <tr
                        key={payment.id}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {payment.id}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {payment.order_id}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {payment.payment_method}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {payment.payment_status}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {payment.transaction_id || "—"}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-600">
                            {new Date(payment.created_at).toLocaleString()}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
