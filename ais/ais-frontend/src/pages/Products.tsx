import React, { useEffect, useState } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductManagementModal from '../components/ProductManagementModal';
import Notification from '../components/Notification';
// Импортируем заглушечные данные
import { mockProducts, mockCategories } from '../services/mockData';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    category_id: number;
    category?: { id: number; name: string } | null;
    created_at?: string;
    is_new?: boolean;
    is_bestseller?: boolean;
}

interface Category {
    id: number;
    name: string;
}

const Products: React.FC = () => {
    // Состояния
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [filterNew, setFilterNew] = useState<boolean>(false);
    const [filterBestseller, setFilterBestseller] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    } | null>(null);
    
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');

    // Загрузка категорий при монтировании компонента
    useEffect(() => {
        fetchCategories();
    }, []);

    // Загрузка товаров при изменении выбранной категории
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);
    
    // Для отладки: выводим загруженные товары в консоль
    useEffect(() => {
        console.log('Загруженные товары:', products);
    }, [products]);

    // Методы для загрузки данных
    const fetchCategories = async () => {
        try {
            setError(null);
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Ошибка при получении категорий, используем заглушечные данные:', err);
            // В случае ошибки используем заглушечные данные
            setCategories(mockCategories);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Передаем ID категории напрямую, а не строкой URL
            const data = await getProducts(selectedCategory || undefined);
            
            // Проверка данных перед установкой
            if (Array.isArray(data)) {
                console.log('Товары успешно загружены:', data.length);
                setProducts(data);
            } else {
                console.error('Неверный формат данных:', data);
                setError('Получены неверные данные товаров');
                setProducts([]);
            }
        } catch (err) {
            console.error('Ошибка при загрузке товаров, используем заглушечные данные:', err);
            // В случае ошибки используем заглушечные данные
            if (selectedCategory) {
                const filteredMockProducts = mockProducts.filter(p => p.category_id === selectedCategory);
                setProducts(filteredMockProducts);
            } else {
                setProducts(mockProducts);
            }
            setError('Используются тестовые данные (нет соединения с сервером)');
        } finally {
            setLoading(false);
        }
    };

    // Функции управления модальным окном
    const openAddModal = () => {
        setSelectedProduct(null);
        setIsNewProduct(true);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setIsNewProduct(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Функции для работы с товарами
    const handleSaveProduct = async (productData: Product) => {
        if (!token) {
            setError('Требуется авторизация');
            return;
        }

        try {
            if (isNewProduct) {
                await createProduct(productData, token);
            } else if (selectedProduct?.id) {
                await updateProduct(selectedProduct.id, productData, token);
            }
            // Показываем уведомление об успехе
            setNotification({
                message: isNewProduct ? 'Товар успешно добавлен' : 'Товар успешно обновлен',
                type: 'success'
            });
            
            // Показываем уведомление об успехе
            setNotification({
                message: 'Товар успешно удален',
                type: 'success'
            });
            
            // Обновляем список товаров
            fetchProducts();
        } catch (err) {
            console.error('Ошибка при сохранении товара, работаем локально:', err);
            
            // Если не удалось сохранить на сервере, обновляем локальные данные
            if (isNewProduct) {
                // Имитируем добавление нового товара
                const newProduct = {
                    ...productData,
                    id: Math.max(...products.map(p => p.id || 0), 0) + 1,
                    created_at: new Date().toISOString(),
                    category: categories.find(c => c.id === productData.category_id)
                };
                setProducts([...products, newProduct]);
                
                console.log('Добавлен новый товар (локально):', newProduct);
                setNotification({
                    message: 'Товар добавлен локально (нет соединения с сервером)',
                    type: 'warning'
                });
                return; // Успешно добавили локально
            } else if (selectedProduct?.id) {
                // Имитируем обновление существующего товара
                const updatedProducts = products.map(p => 
                    p.id === selectedProduct.id 
                        ? { 
                            ...p, 
                            ...productData,
                            category: categories.find(c => c.id === productData.category_id)
                          } 
                        : p
                );
                setProducts(updatedProducts);
                
                console.log('Обновлен товар (локально):', selectedProduct.id);
                setNotification({
                    message: 'Товар обновлен локально (нет соединения с сервером)',
                    type: 'warning'
                });
                return; // Успешно обновили локально
            }
            
            // Если не удалось обработать локально, пробрасываем ошибку
            throw err;
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!token) {
            setError('Требуется авторизация');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }

        try {
            setError(null);
            await deleteProduct(productId, token);
            // Обновляем список товаров
            fetchProducts();
        } catch (err) {
            console.error('Ошибка при удалении товара, удаляем локально:', err);
            
            // Если не удалось удалить на сервере, обновляем локальный список
            const filteredProducts = products.filter(p => p.id !== productId);
            setProducts(filteredProducts);
            setNotification({
                message: 'Товар удален локально (нет соединения с сервером)',
                type: 'warning'
            });
        }
    };

    // Определение класса для статуса наличия
    const getStockStatusClass = (quantity: number) => {
        if (quantity <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        if (quantity < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Управление товарами</h1>
                
                <div className="flex space-x-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) =>
                            setSelectedCategory(e.target.value ? Number(e.target.value) : '')
                        }
                        className="px-4 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 shadow-sm focus:ring focus:ring-blue-300 dark:focus:ring-blue-500"
                    >
                        <option value="">Все категории</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    
                    {/* Фильтры по меткам */}
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filterNew}
                                onChange={(e) => setFilterNew(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Новинки</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filterBestseller}
                                onChange={(e) => setFilterBestseller(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Хиты продаж</span>
                        </label>
                    </div>
                    
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Добавить товар
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">{error}</p>}

            {loading ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : products.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Название
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Категория
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Цена
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Наличие
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.id}
                                            {/* Метки "NEW" и "HIT" */}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {product.is_new && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        НОВИНКА
                                                    </span>
                                                )}
                                                {product.is_bestseller && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                        ХИТ
                                                    </span>
                                                )}
                                                {/* Если товар создан сегодня, показываем "NEW" метку */}
                                                {product.created_at && new Date(product.created_at).toDateString() === new Date().toDateString() && !product.is_new && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        СЕГОДНЯ
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </div>
                                            {product.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {product.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.category ? product.category.name : 'Без категории'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {product.price.toFixed(2)}₽
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(product.stock_quantity)}`}>
                                                {product.stock_quantity <= 0 ? 'Нет в наличии' : `${product.stock_quantity} шт.`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Нет доступных товаров</p>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Добавить первый товар
                    </button>
                </div>
            )}

            {/* Модальное окно добавления/редактирования товара */}
            <ProductManagementModal
                isOpen={isModalOpen}
                onClose={closeModal}
                product={selectedProduct}
                categories={categories}
                onSave={handleSaveProduct}
                isNew={isNewProduct}
            />
            
            {/* Уведомления */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    duration={5000}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default Products;