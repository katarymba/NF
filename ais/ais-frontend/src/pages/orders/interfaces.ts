import { ReactNode } from 'react';
import dayjs from 'dayjs';

// Типы данных
export interface OrderItem {
    product_id: number;
    product_name?: string;
    quantity: number;
    price: number;
    subtotal?: number;
}

export interface Order {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
    status: string;
    client_name: string;
    delivery_address: string;
    order_items: OrderItem[];
    payment_method: string;
    tracking_number?: string;
    courier_name?: string;
    delivery_notes?: string;
    estimated_delivery?: string;
    actual_delivery?: string;
    delivery_status?: string;
    payment_status?: string;
    transaction_id?: string;
    phone?: string;
    email?: string;
    contact_phone?: string;
}

export interface Payment {
    id: number;
    order_id: number;
    payment_method: string;
    payment_status: string;
    transaction_id: string;
    created_at: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export interface OrdersProps {
    token?: string;
}

// Словарь для имен товаров
export const productNames: {[key: number]: string} = {
    1: 'Семга свежая',
    3: 'Сельдь малосольная',
    5: 'Осетр копченый',
    6: 'Форель радужная',
    11: 'Треска атлантическая',
};

// Доступные курьеры
export const AVAILABLE_COURIERS = [
    'Сидоров А.А.',
    'Кузнецов В.А.',
    'Дербенев И.С.',
    'Смирнова Е.П.',
    'Иванов К.Н.'
];

// Константы для работы с датами
export const CURRENT_DATE = '2025-05-08 19:36:50';
export const CURRENT_USER = 'katarymba';