// src/pages/Products.tsx

import React, { useEffect, useState } from 'react';
import { getProducts, getCategories } from '../services/api';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    created_at: string;
    category: { id: number; name: string } | null;
}

interface Category {
    id: number;
    name: string;
}

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Ошибка получения категорий');
        }
    };

    const fetchProducts = async () => {
        try {
            const url = selectedCategory ? `/products?category_id=${selectedCategory}` : '/products';
            const data = await getProducts(url);
            setProducts(data);
        } catch (err) {
            setError('Ошибка получения товаров');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Products</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <select
                value={selectedCategory}
                onChange={(e) =>
                    setSelectedCategory(e.target.value ? Number(e.target.value) : '')
                }
                className="mb-4 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 shadow-sm focus:ring focus:ring-blue-300 dark:focus:ring-blue-500"
            >
                <option value="">Все категории</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>

            {products.length > 0 ? (
                <ul className="space-y-4">
                    {products.map((product) => (
                        <li key={product.id} className="p-4 border rounded">
                            <h2 className="font-bold">{product.name}</h2>
                            {product.description && <p>{product.description}</p>}
                            <p className="text-sm text-gray-600">Цена: {product.price}₽</p>
                            <p className="text-sm text-gray-600">Количество: {product.stock_quantity}</p>
                            <p className="text-sm text-gray-500">
                                Категория: {product.category ? product.category.name : 'Без категории'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Нет доступных товаров.</p>
            )}
        </div>
    );
};

export default Products;
