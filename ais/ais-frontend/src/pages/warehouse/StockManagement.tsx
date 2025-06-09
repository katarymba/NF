import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { API_FULL_URL } from '../../services/api';

import {
    Product,
    StockItem,
    Warehouse,
    Category,
    ProductFilter
} from './interfaces';

interface StockManagementProps {
    isLoading: boolean;
    products: Product[];
    stockItems: StockItem[];
    warehouses: Warehouse[];
    categories: Category[];
    fetchData: () => Promise<void>;
    API_BASE_URL: string;
    getCurrentDateTime: () => string;
    getCurrentUser: () => string;
    determineStockStatus: (quantity: number, minQuantity: number) => string;
}

const StockManagement: React.FC<StockManagementProps> = ({
                                                             isLoading,
                                                             products,
                                                             stockItems,
                                                             warehouses,
                                                             categories,
                                                             fetchData,
                                                             API_BASE_URL,
                                                             getCurrentDateTime,
                                                             getCurrentUser,
                                                             determineStockStatus
                                                         }) => {
    // State for filters and sorting
    const [filters, setFilters] = useState<ProductFilter>({
        search: '',
        category_id: '',
        status: 'all',
        supplier: '',
        warehouse_id: '',
        sortBy: 'name',
        sortDirection: 'asc'
    });

    // State for modals
    const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
    const [showInventoryCountModal, setShowInventoryCountModal] = useState<boolean>(false);
    const [showProductDetailsModal, setShowProductDetailsModal] = useState<boolean>(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

    // State for new product
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        sku: '',
        name: '',
        category_id: '',
        unit: 'кг',
        price: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    // State for new stock item
    const [newStockItem, setNewStockItem] = useState<Partial<StockItem>>({
        product_id: '',
        warehouse_id: '',
        quantity: 0,
        minimum_quantity: 0,
        reorder_level: 0,
        status: 'in-stock'
    });

    // State for inventory count
    const [newInventoryCount, setNewInventoryCount] = useState<{
        product_id: string;
        warehouse_id: string;
        new_quantity: number;
        notes: string;
    }>({
        product_id: '',
        warehouse_id: '',
        new_quantity: 0,
        notes: ''
    });

    // Filter handlers
    const handleFilterChange = (name: keyof ProductFilter, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortChange = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Reset form for new product
    const resetNewProductForm = () => {
        setNewProduct({
            sku: '',
            name: '',
            category_id: '',
            unit: 'кг',
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        setNewStockItem({
            product_id: '',
            warehouse_id: '',
            quantity: 0,
            minimum_quantity: 0,
            reorder_level: 0,
            status: 'in-stock'
        });
    };

    // Selected product and its stocks
    const selectedProduct = useMemo(() => {
        if (!selectedProductId || !products.length) return null;
        return products.find(p => p.id === selectedProductId) || null;
    }, [selectedProductId, products]);

    const selectedProductStocks = useMemo(() => {
        if (!selectedProductId || !stockItems.length) return [];
        return stockItems.filter(item => item.product_id === selectedProductId);
    }, [selectedProductId, stockItems]);

    // Selected warehouse
    const selectedWarehouse = useMemo(() => {
        if (!selectedWarehouseId || !warehouses.length) return null;
        return warehouses.find(w => w.id === selectedWarehouseId) || null;
    }, [selectedWarehouseId, warehouses]);

    // Filtered stocks
    const filteredStockItems = useMemo(() => {
        if (!stockItems.length) return [];

        return stockItems.filter(item => {
            // Find product to get data about it
            const product = products.find(p => p.id === item.product_id);
            if (!product) return false;

            // Filter by search query
            if (
                filters.search &&
                !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !product.sku?.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }

            // Filter by category
            if (filters.category_id && product.category_id !== filters.category_id) {
                return false;
            }

            // Filter by status
            if (filters.status !== 'all' && item.status !== filters.status) {
                return false;
            }

            // Filter by supplier
            if (filters.supplier && product.supplier !== filters.supplier) {
                return false;
            }

            // Filter by warehouse
            if (filters.warehouse_id && item.warehouse_id !== filters.warehouse_id) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            // Find products to get data about them
            const productA = products.find(p => p.id === a.product_id);
            const productB = products.find(p => p.id === b.product_id);
            if (!productA || !productB) return 0;

            // Sort by selected field
            switch (filters.sortBy) {
                case 'name':
                    return filters.sortDirection === 'asc'
                        ? productA.name.localeCompare(productB.name)
                        : productB.name.localeCompare(productA.name);
                case 'sku':
                    return filters.sortDirection === 'asc'
                        ? (productA.sku || '').localeCompare(productB.sku || '')
                        : (productB.sku || '').localeCompare(productA.sku || '');
                case 'quantity':
                    return filters.sortDirection === 'asc'
                        ? a.quantity - b.quantity
                        : b.quantity - a.quantity;
                case 'category':
                    return filters.sortDirection === 'asc'
                        ? (productA.category_name || '').localeCompare(productB.category_name || '')
                        : (productB.category_name || '').localeCompare(productA.category_name || '');
                case 'lastUpdated':
                    return filters.sortDirection === 'asc'
                        ? new Date(a.last_count_date || 0).getTime() - new Date(b.last_count_date || 0).getTime()
                        : new Date(b.last_count_date || 0).getTime() - new Date(a.last_count_date || 0).getTime();
                default:
                    return 0;
            }
        });
    }, [stockItems, products, filters]);

    // Add product handler
    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.category_id) {
            alert('Пожалуйста, заполните обязательные поля: Наименование, Категория');
            return;
        }

        try {
            // Direct API request to add product to DB
            const productData = {
                ...newProduct,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: getCurrentUser()
            };

            // Send data to our DB
            const response = await axios.post(`${API_FULL_URL}/products`, productData);
            const createdProduct = response.data;

            // If warehouse and quantity are specified, create stock record
            if (newStockItem.warehouse_id && newStockItem.quantity) {
                const stockItemData = {
                    product_id: createdProduct.id,
                    warehouse_id: newStockItem.warehouse_id,
                    quantity: newStockItem.quantity,
                    minimum_quantity: newStockItem.minimum_quantity,
                    reorder_level: newStockItem.reorder_level,
                    status: determineStockStatus(newStockItem.quantity as number, newStockItem.minimum_quantity as number),
                    last_count_date: new Date().toISOString(),
                    last_counted_by: getCurrentUser()
                };

                const stockResponse = await axios.post(`${API_FULL_URL}/stocks`, stockItemData);

                // Create stock movement record
                const movementItemData = {
                    product_id: createdProduct.id,
                    warehouse_id: newStockItem.warehouse_id,
                    quantity: newStockItem.quantity,
                    previous_quantity: 0,
                    movement_type: 'receipt',
                    performed_by: getCurrentUser(),
                    movement_date: new Date().toISOString(),
                    notes: 'Первоначальное добавление товара в систему'
                };

                await axios.post(`${API_FULL_URL}/stock-movements`, movementItemData);
            }

            // Clear form and close modal
            resetNewProductForm();
            setShowAddProductModal(false);

            // Refresh data
            fetchData();

            // Notification
            alert('Товар успешно добавлен!');
        } catch (err) {
            console.error("Error adding product:", err);
            alert('Ошибка при добавлении товара. Пожалуйста, попробуйте снова.');
        }
    };

    // Inventory count handler
    const handleInventoryCount = async () => {
        if (!newInventoryCount.product_id || !newInventoryCount.warehouse_id) {
            alert('Пожалуйста, выберите товар и склад');
            return;
        }

        try {
            // Find current stock
            const stockItem = stockItems.find(item =>
                item.product_id === newInventoryCount.product_id &&
                item.warehouse_id === newInventoryCount.warehouse_id
            );

            if (!stockItem) {
                alert('Товар на указанном складе не найден');
                return;
            }

            // Calculate quantity difference
            const previousQuantity = stockItem.quantity;
            const newQuantity = newInventoryCount.new_quantity;
            const difference = newQuantity - previousQuantity;

            // Update stock in DB
            await axios.patch(`${API_FULL_URL}/stocks/${stockItem.id}`, {
                quantity: newQuantity,
                last_count_date: new Date().toISOString(),
                last_counted_by: getCurrentUser(),
                status: determineStockStatus(newQuantity, stockItem.minimum_quantity)
            });

            // Create stock movement record
            await axios.post(`${API_FULL_URL}/stock-movements`, {
                product_id: newInventoryCount.product_id,
                warehouse_id: newInventoryCount.warehouse_id,
                quantity: difference,
                previous_quantity: previousQuantity,
                movement_type: 'adjustment',
                performed_by: getCurrentUser(),
                movement_date: new Date().toISOString(),
                notes: newInventoryCount.notes
            });

            // Refresh data
            fetchData();

            // Clear form and close modal
            setNewInventoryCount({
                product_id: '',
                warehouse_id: '',
                new_quantity: 0,
                notes: ''
            });

            setShowInventoryCountModal(false);

            // Notification
            alert('Пересчет товара успешно выполнен!');
        } catch (err) {
            console.error("Error during inventory count:", err);
            alert('Ошибка при пересчете товара. Пожалуйста, попробуйте снова.');
        }
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
        {/* Filters and search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Поиск
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Поиск по названию или артикулу"
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Категория
                        </label>
                        <select
                            id="category"
                            value={filters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все категории</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Статус
                        </label>
                        <select
                            id="status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="all">Все статусы</option>
                            <option value="in-stock">В наличии</option>
                            <option value="low-stock">Заканчивается</option>
                            <option value="out-of-stock">Отсутствует</option>
                            <option value="over-stock">Избыток</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Склад
                        </label>
                        <select
                            id="warehouse"
                            value={filters.warehouse_id}
                            onChange={(e) => handleFilterChange('warehouse_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все склады</option>
                            {warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between mt-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Найдено: <span className="font-medium">{filteredStockItems.length}</span> позиций
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => setFilters({
                                search: '',
                                category_id: '',
                                status: 'all',
                                supplier: '',
                                warehouse_id: '',
                                sortBy: 'name',
                                sortDirection: 'asc'
                            })}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                        >
                            Сбросить фильтры
                        </button>

                        <button
                            onClick={() => setShowInventoryCountModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
                        >
                            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                            Пересчет товара
                        </button>

                        <button
                            onClick={() => setShowAddProductModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Добавить товар
                        </button>
                    </div>
                </div>
            </div>

        {/* Products table */}
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('name')}
                                >
                                    Наименование
                                    {filters.sortBy === 'name' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('sku')}
                                >
                                    Артикул
                                    {filters.sortBy === 'sku' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('category')}
                                >
                                    Категория
                                    {filters.sortBy === 'category' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Склад
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('quantity')}
                                >
                                    Количество
                                    {filters.sortBy === 'quantity' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Цена
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Стоимость
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Статус
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('lastUpdated')}
                                >
                                    Обновлено
                                    {filters.sortBy === 'lastUpdated' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStockItems.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Товары не найдены. Измените параметры поиска или добавьте новые товары.
                                </td>
                            </tr>
                        ) : (
                            filteredStockItems.map((item) => {
                                // Find product to get its data
                                const product = products.find(p => p.id === item.product_id);
                                if (!product) return null;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded-md object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                                                        <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                        {product.sr_sync && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                                    Север-Рыба
                                                                </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {product.supplier ? `Поставщик: ${product.supplier}` : 'Поставщик не указан'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{product.category_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{item.warehouse_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {item.quantity} {product.unit}
                                                {item.quantity_reserved && item.quantity_reserved > 0 && (
                                                    <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                            (зарез. {item.quantity_reserved})
                                                        </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Мин.: {item.minimum_quantity} / Уровень заказа: {item.reorder_level}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(product.price)}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">за {product.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(item.quantity * product.price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.status === 'in-stock' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                    ${item.status === 'low-stock' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                    ${item.status === 'out-of-stock' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                                    ${item.status === 'over-stock' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                `}>
                                                    {item.status === 'in-stock' && 'В наличии'}
                                                    {item.status === 'low-stock' && 'Заканчивается'}
                                                    {item.status === 'out-of-stock' && 'Отсутствует'}
                                                    {item.status === 'over-stock' && 'Избыток'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.last_count_date ? (
                                                <div>
                                                    <div>{formatDateTime(item.last_count_date)}</div>
                                                    <div className="text-xs">{item.last_counted_by}</div>
                                                </div>
                                            ) : (
                                                'Не проверялось'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedProductId(product.id);
                                                    setSelectedWarehouseId(item.warehouse_id);
                                                    setShowProductDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                            >
                                                Детали
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewInventoryCount({
                                                        product_id: product.id,
                                                        warehouse_id: item.warehouse_id,
                                                        new_quantity: item.quantity,
                                                        notes: ''
                                                    });
                                                    setShowInventoryCountModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            >
                                                Пересчет
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Inventory Count Modal */}
        {showInventoryCountModal && (
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
                                Пересчет товара
                            </h2>
                            <button onClick={() => setShowInventoryCountModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form content */}
                        <div className="px-6 py-4">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="count-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Товар <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="count-product"
                                        value={newInventoryCount.product_id}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, product_id: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите товар</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="count-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Склад <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="count-warehouse"
                                        value={newInventoryCount.warehouse_id}
                                        onChange={(e) => {
                                            const warehouseId = e.target.value;
                                            setNewInventoryCount({...newInventoryCount, warehouse_id: warehouseId});

                                            // If both product and warehouse are selected - find current quantity
                                            if (newInventoryCount.product_id && warehouseId) {
                                                const stockItem = stockItems.find(item => item.product_id === newInventoryCount.product_id &&
                                                    item.warehouse_id === warehouseId
                                                );

                                                if (stockItem) {
                                                    setNewInventoryCount(prev => ({...prev, new_quantity: stockItem.quantity}));
                                                } else {
                                                    setNewInventoryCount(prev => ({...prev, new_quantity: 0}));
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите склад</option>
                                        {warehouses.map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {newInventoryCount.product_id && newInventoryCount.warehouse_id && (
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            Текущее количество:
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {(() => {
                                                const stockItem = stockItems.find(item =>
                                                    item.product_id === newInventoryCount.product_id &&
                                                    item.warehouse_id === newInventoryCount.warehouse_id
                                                );

                                                if (stockItem) {
                                                    const product = products.find(p => p.id === newInventoryCount.product_id);
                                                    return `${stockItem.quantity} ${product ? product.unit : 'ед.'}`;
                                                } else {
                                                    return 'Товар отсутствует на этом складе';
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="new-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Новое количество <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="new-quantity"
                                        value={newInventoryCount.new_quantity}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, new_quantity: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="count-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Примечание
                                    </label>
                                    <textarea
                                        id="count-notes"
                                        value={newInventoryCount.notes}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, notes: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Причина корректировки"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowInventoryCountModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleInventoryCount}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                disabled={!newInventoryCount.product_id || !newInventoryCount.warehouse_id}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Product Modal */}
        {showAddProductModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                    </div>

                    {/* Modal */}
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                Добавление нового товара
                            </h2>
                            <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form content */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Артикул (SKU) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="sku"
                                        value={newProduct.sku || ''}
                                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Например: FR-001"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Наименование <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newProduct.name || ''}
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Введите название товара"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Категория <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        value={newProduct.category_id || ''}
                                        onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Единица измерения
                                    </label>
                                    <select
                                        id="unit"
                                        value={newProduct.unit || 'кг'}
                                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="кг">кг (килограмм)</option>
                                        <option value="шт">шт (штука)</option>
                                        <option value="л">л (литр)</option>
                                        <option value="упак">упак (упаковка)</option>
                                        <option value="ящик">ящик</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Цена <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="price"
                                            value={newProduct.price || 0}
                                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">₽</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Поставщик
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier"
                                        value={newProduct.supplier || ''}
                                        onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Название поставщика"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Первоначальный складской запас
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="stock-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Склад
                                        </label>
                                        <select
                                            id="stock-warehouse"
                                            value={newStockItem.warehouse_id || ''}
                                            onChange={(e) => setNewStockItem({...newStockItem, warehouse_id: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="">Выберите склад</option>
                                            {warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="stock-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Количество
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-quantity"
                                            value={newStockItem.quantity || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, quantity: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="stock-min-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Минимальное количество
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-min-quantity"
                                            value={newStockItem.minimum_quantity || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, minimum_quantity: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="stock-reorder-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Уровень для заказа
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-reorder-level"
                                            value={newStockItem.reorder_level || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, reorder_level: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAddProductModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Добавить товар
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Product Details Modal */}
            {showProductDetailsModal && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        {/* Modal */}
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            {/* Modal header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                    Детали товара
                                </h2>
                                <button onClick={() => setShowProductDetailsModal(false)} className="text-gray-400 hover:text-gray-500">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        {selectedProduct.image_url ? (
                                            <div className="aspect-w-1 aspect-h-1">
                                                <img
                                                    src={selectedProduct.image_url}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-center object-cover rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="col-span-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {selectedProduct.name}
                                                    {selectedProduct.sr_sync && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                            Север-Рыба
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Артикул: {selectedProduct.sku}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Категория</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.category_name}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Единица измерения</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.unit}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Цена</div>
                                                <div className="text-base text-gray-900 dark:text-white font-medium">{formatCurrency(selectedProduct.price)}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Поставщик</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.supplier || 'Не указан'}</div>
                                            </div>
                                        </div>

                                        {/* Stock by warehouse */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Запасы по складам</h4>

                                            {selectedProductStocks.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    <p>Товар отсутствует на складах</p>
                                                </div>
                                            ) : (
                                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Склад
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Количество
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Мин. кол-во
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Статус
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Действия
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {selectedProductStocks.map(stock => (
                                                            <tr key={stock.warehouse_id}>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                    {stock.warehouse_name}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                                                                    {stock.quantity} {selectedProduct.unit}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                                                                    {stock.minimum_quantity} {selectedProduct.unit}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                        ${stock.status === 'in-stock' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                                        ${stock.status === 'low-stock' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                                        ${stock.status === 'out-of-stock' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                                                        ${stock.status === 'over-stock' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                                    `}>
                                                                        {stock.status === 'in-stock' && 'В наличии'}
                                                                                                                                            {stock.status === 'low-stock' && 'Заканчивается'}
                                                                                                                                            {stock.status === 'out-of-stock' && 'Отсутствует'}
                                                                                                                                            {stock.status === 'over-stock' && 'Избыток'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setNewInventoryCount({
                                                                                product_id: selectedProduct.id,
                                                                                warehouse_id: stock.warehouse_id,
                                                                                new_quantity: stock.quantity,
                                                                                notes: ''
                                                                            });
                                                                            setShowProductDetailsModal(false);
                                                                            setShowInventoryCountModal(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    >
                                                                        Пересчет
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Information */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Дополнительная информация</h4>

                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Дата создания</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatDateTime(selectedProduct.created_at)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Последнее обновление</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatDateTime(selectedProduct.updated_at)}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">ID товара (для API)</div>
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {selectedProduct.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowProductDetailsModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StockManagement;