import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
    ArrowPathIcon,
    XMarkIcon,
    PlusIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

import {
    Product,
    Warehouse,
    StockItem,
    StockMovement
} from './interfaces';
import {API_FULL_URL} from "../../services/api";

interface StockMovementsProps {
    isLoading: boolean;
    products: Product[];
    stockItems: StockItem[];
    warehouses: Warehouse[];
    stockMovements: StockMovement[];
    fetchData: () => Promise<void>;
    API_BASE_URL: string;
    getCurrentDateTime: () => string;
    getCurrentUser: () => string;
}

const StockMovements: React.FC<StockMovementsProps> = ({
                                                           isLoading,
                                                           products,
                                                           stockItems,
                                                           warehouses,
                                                           stockMovements,
                                                           fetchData,
                                                           API_BASE_URL,
                                                           getCurrentDateTime,
                                                           getCurrentUser
                                                       }) => {
    // State for filters
    const [filters, setFilters] = useState({
        productId: '',
        warehouseId: '',
        movementType: '',
        dateFrom: '',
        dateTo: ''
    });

    // State for new movement
    const [newMovement, setNewMovement] = useState({
        product_id: '',
        warehouse_id: '',
        quantity: 0,
        movement_type: 'receipt',
        reference_id: '',
        reference_type: '',
        performed_by: getCurrentUser(),
        notes: ''
    });

    // UI state
    const [showAddMovementModal, setShowAddMovementModal] = useState<boolean>(false);

    // Filtered movements
    const filteredMovements = useMemo(() => {
        // Ensure stockMovements is an array before calling filter
        if (!Array.isArray(stockMovements)) {
            return [];
        }

        return stockMovements.filter(movement => {
            // Filter by product
            if (filters.productId && movement.product_id !== filters.productId) {
                return false;
            }

            // Filter by warehouse
            if (filters.warehouseId && movement.warehouse_id !== filters.warehouseId) {
                return false;
            }

            // Filter by movement type
            if (filters.movementType && movement.movement_type !== filters.movementType) {
                return false;
            }

            // Filter by date range
            if (filters.dateFrom) {
                const movementDate = new Date(movement.movement_date);
                const fromDate = new Date(filters.dateFrom);
                if (movementDate < fromDate) {
                    return false;
                }
            }

            if (filters.dateTo) {
                const movementDate = new Date(movement.movement_date);
                const toDate = new Date(filters.dateTo);
                // Set time to end of day
                toDate.setHours(23, 59, 59);
                if (movementDate > toDate) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            // Sort by date, newest first
            return new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime();
        });
    }, [stockMovements, filters]);

    // Handle add movement
    const handleAddMovement = async () => {
        try {
            if (!newMovement.product_id || !newMovement.warehouse_id || newMovement.quantity <= 0) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }

            // Get current stock for previous_quantity field
            const stockItem = stockItems.find(item =>
                item.product_id === newMovement.product_id &&
                item.warehouse_id === newMovement.warehouse_id
            );

            const previousQuantity = stockItem ? stockItem.quantity : 0;

            // Create movement data
            const movementData = {
                ...newMovement,
                previous_quantity: previousQuantity,
                movement_date: getCurrentDateTime()
            };

            // Create movement in DB
            await axios.post(`${API_FULL_URL}/stock-movements`, movementData);

            // Update stock
            if (stockItem) {
                // Calculate new quantity based on movement type
                let newQuantity = stockItem.quantity;
                if (newMovement.movement_type === 'receipt') {
                    newQuantity += newMovement.quantity;
                } else if (newMovement.movement_type === 'issue') {
                    newQuantity = Math.max(0, newQuantity - newMovement.quantity);
                }

                // Update stock in DB
                await axios.patch(`${API_FULL_URL}/stocks/${stockItem.id}`, {
                    quantity: newQuantity,
                    last_count_date: getCurrentDateTime(),
                    last_counted_by: getCurrentUser()
                });
            } else if (newMovement.movement_type === 'receipt') {
                // If stock doesn't exist but movement is receipt, create new stock
                const product = products.find(p => p.id === newMovement.product_id);

                if (product) {
                    await axios.post(`${API_FULL_URL}/stocks`, {
                        product_id: newMovement.product_id,
                        warehouse_id: newMovement.warehouse_id,
                        quantity: newMovement.quantity,
                        minimum_quantity: 5, // Default value
                        reorder_level: 10, // Default value
                        status: 'in-stock',
                        last_count_date: getCurrentDateTime(),
                        last_counted_by: getCurrentUser()
                    });
                }
            }

            // Reset form and close modal
            setNewMovement({
                product_id: '',
                warehouse_id: '',
                quantity: 0,
                movement_type: 'receipt',
                reference_id: '',
                reference_type: '',
                performed_by: getCurrentUser(),
                notes: ''
            });

            setShowAddMovementModal(false);

            // Refresh data
            fetchData();

            alert('Движение товара успешно создано!');
        } catch (err) {
            console.error("Error creating stock movement:", err);
            alert('Ошибка при создании движения товара. Пожалуйста, попробуйте снова.');
        }
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            productId: '',
            warehouseId: '',
            movementType: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    // Format functions
    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Исправленная функция formatQuantity с защитой от undefined
    const formatQuantity = (movement: StockMovement) => {
        // Проверяем, что движение существует и имеет необходимые свойства
        if (!movement || movement.quantity === undefined) {
            return <span>0 ед.</span>;
        }

        const product = products.find(p => p.id === movement.product_id);
        const quantityStr = movement.quantity.toString();
        const unitLabel = product?.unit || 'ед.';

        if (movement.movement_type === 'receipt') {
            return <span className="text-green-600 dark:text-green-400">+{quantityStr} {unitLabel}</span>;
        } else if (movement.movement_type === 'issue') {
            return <span className="text-red-600 dark:text-red-400">-{quantityStr} {unitLabel}</span>;
        } else {
            if (movement.quantity > 0) {
                return <span className="text-blue-600 dark:text-blue-400">+{quantityStr} {unitLabel}</span>;
            } else if (movement.quantity < 0) {
                return <span className="text-orange-600 dark:text-orange-400">{quantityStr} {unitLabel}</span>;
            } else {
                return <span>{quantityStr} {unitLabel}</span>;
            }
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">Движение товаров</h2>
                    <button
                        onClick={() => setShowAddMovementModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                    >
                        <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                        Добавить движение
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="filter-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Товар
                        </label>
                        <select
                            id="filter-product"
                            value={filters.productId}
                            onChange={(e) => setFilters({...filters, productId: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все товары</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Склад
                        </label>
                        <select
                            id="filter-warehouse"
                            value={filters.warehouseId}
                            onChange={(e) => setFilters({...filters, warehouseId: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все склады</option>
                            {warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Тип движения
                        </label>
                        <select
                            id="filter-type"
                            value={filters.movementType}
                            onChange={(e) => setFilters({...filters, movementType: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все типы</option>
                            <option value="receipt">Поступление</option>
                            <option value="issue">Отгрузка</option>
                            <option value="adjustment">Корректировка</option>
                            <option value="transfer">Перемещение</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-date-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Дата от
                        </label>
                        <input
                            type="date"
                            id="filter-date-from"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="filter-date-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Дата до
                        </label>
                        <input
                            type="date"
                            id="filter-date-to"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={resetFilters}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                    >
                        Сбросить фильтры
                    </button>
                    <button
                        onClick={fetchData}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                text-gray-800 dark:text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <ArrowPathIcon className="h-5 w-5 mr-1" />
                        Обновить
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredMovements.length === 0 ? (
                <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Движений товаров не найдено.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Дата и время
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Товар
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Склад
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Изменение
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Было / Стало
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Тип операции
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Кто выполнил
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Примечания
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredMovements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(movement.movement_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {movement.product_name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {movement.product_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {movement.warehouse_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">
                                            {formatQuantity(movement)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {/* Защита от undefined для previous_quantity и quantity */}
                                        {(movement.previous_quantity !== undefined ? movement.previous_quantity : 0)} →
                                        {(movement.previous_quantity !== undefined && movement.quantity !== undefined)
                                            ? (movement.previous_quantity + movement.quantity)
                                            : (movement.previous_quantity !== undefined ? movement.previous_quantity : 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${movement.movement_type === 'receipt' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                        ${movement.movement_type === 'issue' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                        ${movement.movement_type === 'adjustment' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                        ${movement.movement_type === 'transfer' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                      `}>
                                        {movement.movement_type === 'receipt' && 'Поступление'}
                                          {movement.movement_type === 'issue' && 'Отгрузка'}
                                          {movement.movement_type === 'adjustment' && 'Корректировка'}
                                          {movement.movement_type === 'transfer' && 'Перемещение'}
                                      </span>

                                        {movement.reference_id && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {movement.reference_type === 'shipment' && `Поставка: ${movement.reference_id}`}
                                                {movement.reference_type === 'order' && `Заказ: ${movement.reference_id}`}
                                                {movement.reference_type === 'sync' && `Синхронизация: ${movement.reference_id}`}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {movement.performed_by}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {movement.notes || '—'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Movement Modal */}
            {showAddMovementModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        {/* Modal */}
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Modal header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                    Добавление движения товара
                                </h2>
                                <button onClick={() => setShowAddMovementModal(false)} className="text-gray-400 hover:text-gray-500">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Form content */}
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="movement-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Тип движения <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="movement-type"
                                            value={newMovement.movement_type}
                                            onChange={(e) => setNewMovement({...newMovement, movement_type: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="receipt">Поступление</option>
                                            <option value="issue">Отгрузка</option>
                                            <option value="adjustment">Корректировка</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="movement-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Товар <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="movement-product"
                                            value={newMovement.product_id}
                                            onChange={(e) => setNewMovement({...newMovement, product_id: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="">Выберите товар</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="movement-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Склад <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="movement-warehouse"
                                            value={newMovement.warehouse_id}
                                            onChange={(e) => setNewMovement({...newMovement, warehouse_id: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="">Выберите склад</option>
                                            {warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {newMovement.product_id && newMovement.warehouse_id && (
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                Текущее количество на складе:
                                            </div>
                                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                {(() => {
                                                    const stockItem = stockItems.find(item =>
                                                        item.product_id === newMovement.product_id &&
                                                        item.warehouse_id === newMovement.warehouse_id
                                                    );
                                                    const product = products.find(p => p.id === newMovement.product_id);

                                                    if (stockItem) {
                                                        return `${stockItem.quantity} ${product ? product.unit : 'ед.'}`;
                                                    } else {
                                                        return 'Товар отсутствует на этом складе';
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="movement-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Количество <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="movement-quantity"
                                            value={newMovement.quantity}
                                            onChange={(e) => setNewMovement({...newMovement, quantity: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                        {newMovement.movement_type === 'issue' && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Указанное количество будет списано со склада
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="movement-reference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Ссылка на документ
                                        </label>
                                        <input
                                            type="text"
                                            id="movement-reference"
                                            value={newMovement.reference_id}
                                            onChange={(e) => setNewMovement({...newMovement, reference_id: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            placeholder="Например: Заказ №123"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="movement-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Примечания
                                        </label>
                                        <textarea
                                            id="movement-notes"
                                            value={newMovement.notes}
                                            onChange={(e) => setNewMovement({...newMovement, notes: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            placeholder="Укажите причину движения товара"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMovementModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600
                      text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddMovement}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                    disabled={!newMovement.product_id || !newMovement.warehouse_id || newMovement.quantity <= 0}
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StockMovements;