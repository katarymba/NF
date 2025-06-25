import React, { useState, useMemo, useEffect } from 'react';
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

// Константы для заглушек
const CURRENT_DATE = '2025-06-24 17:50:28';
const CURRENT_USER = 'katarymba';

// Заглушки для категорий на основе предоставленных данных
const mockCategories = [
    { id: '1', name: 'Консервы', description: 'Рыбные консервы разных видов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '2', name: 'Икра', description: 'Икра различных видов рыб', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '3', name: 'Деликатесы', description: 'Рыбные деликатесы премиум-класса', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '4', name: 'Свежая рыба', description: 'Свежая охлажденная рыба', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '5', name: 'Замороженная рыба', description: 'Свежемороженая рыба различных видов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '6', name: 'Морепродукты', description: 'Различные виды морепродуктов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '7', name: 'Полуфабрикаты', description: 'Рыбные полуфабрикаты готовые к приготовлению', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '8', name: 'Копчёная рыба', description: 'Рыба холодного и горячего копчения', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' }
];

// Склады
const mockWarehouses = [
    { id: '1', name: 'Основной склад', address: 'ул. Портовая, 15', city: 'Мурманск', created_at: '2025-01-05T10:00:00Z' },
    { id: '2', name: 'Холодильный склад №1', address: 'ул. Прибрежная, 8', city: 'Мурманск', created_at: '2025-01-05T10:15:00Z' },
    { id: '3', name: 'Транзитный склад', address: 'ул. Промышленная, 42', city: 'Санкт-Петербург', created_at: '2025-01-06T09:30:00Z' },
    { id: '4', name: 'Распределительный центр', address: 'Логистическая ул., 5', city: 'Москва', created_at: '2025-01-07T11:20:00Z' }
];

// Реальные товары
const mockProducts = [
    { id: '1', sku: 'SR-001', name: 'Ассорти горбуша/сельдь', category_id: '1', category_name: 'Консервы', description: 'Ассорти из горбуши и сельди - разнообразие вкусов в одной банке.', unit: 'шт', price: 112, supplier: 'Северный улов', is_active: true, created_at: '2025-01-15T10:30:00Z', updated_at: '2025-06-20T09:15:00Z' },
    { id: '2', sku: 'SR-002', name: 'ВОБЛА ВЯЛЕНАЯ', category_id: '8', category_name: 'Копчёная рыба', description: 'Вяленая вобла - традиционная закуска с характерным вкусом.', unit: 'кг', price: 1390, supplier: 'Беломор-Фиш', is_active: true, created_at: '2025-02-03T14:45:00Z', updated_at: '2025-06-18T11:20:00Z' },
    { id: '3', sku: 'SR-003', name: 'ГОРБУША косичка х/к', category_id: '8', category_name: 'Копчёная рыба', description: 'Горбуша косичка холодного копчения - традиционный продукт с насыщенным вкусом.', unit: 'кг', price: 249, supplier: 'Северный улов', is_active: true, created_at: '2025-01-20T09:00:00Z', updated_at: '2025-06-15T16:30:00Z' },
    { id: '7', sku: 'SR-007', name: 'ИКРА КЕТЫ с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра кеты - классический деликатес, богатый белком и полезными микроэлементами.', unit: 'кг', price: 13999, supplier: 'Дары моря', is_active: true, created_at: '2025-03-05T11:20:00Z', updated_at: '2025-06-22T10:15:00Z' },
    { id: '11', sku: 'SR-011', name: 'Икра Сибирского осетра 500г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра сибирского осетра - изысканный деликатес с неповторимым вкусом.', unit: 'шт', price: 35000, supplier: 'Дары моря', is_active: true, created_at: '2025-04-10T15:30:00Z', updated_at: '2025-06-23T09:45:00Z' },
    { id: '18', sku: 'SR-018', name: 'МИНТАЙ с/м', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженый минтай - диетическая рыба с низким содержанием жира и высоким содержанием белка.', unit: 'кг', price: 269.99, supplier: 'Северная рыба', is_active: true, created_at: '2025-02-15T13:40:00Z', updated_at: '2025-06-10T10:20:00Z' },
    { id: '25', sku: 'SR-025', name: 'ОСЁТР сибирский', category_id: '4', category_name: 'Свежая рыба', description: 'Сибирский осётр - редкая деликатесная рыба с особыми вкусовыми качествами.', unit: 'кг', price: 1699, supplier: 'Баренц-Маркет', is_active: true, created_at: '2025-03-25T08:30:00Z', updated_at: '2025-06-20T11:15:00Z' },
    { id: '33', sku: 'SR-033', name: 'СЁМГА С/С в/у пласт', category_id: '4', category_name: 'Свежая рыба', description: 'Слабосоленая сёмга в вакуумной упаковке - нежнейший продукт премиум-класса.', unit: 'кг', price: 3599.99, supplier: 'Баренц-Маркет', is_active: true, created_at: '2025-02-10T10:15:00Z', updated_at: '2025-06-21T14:30:00Z' },
    { id: '47', sku: 'SR-047', name: 'ФАЛАНГИ КАМЧАТСКОГО КРАБА', category_id: '6', category_name: 'Морепродукты', description: 'Фаланги камчатского краба - деликатес с нежным, сладковатым мясом.', unit: 'кг', price: 5900, supplier: 'Дары моря', is_active: true, created_at: '2025-05-02T09:00:00Z', updated_at: '2025-06-19T15:45:00Z' },
    { id: '60', sku: 'SR-060', name: 'ЯЗЫК ТРЕСКИ ст.б', category_id: '3', category_name: 'Деликатесы', description: 'Язык трески в стеклянной банке - редкий деликатес, богатый полезными веществами.', unit: 'шт', price: 390, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: '2025-04-15T16:20:00Z', updated_at: '2025-06-18T13:05:00Z' }
];

// Создаем заглушки для складских запасов
const mockStockItems = [
    { id: '1', product_id: '1', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 240, quantity_reserved: 20, minimum_quantity: 30, reorder_level: 50, status: 'in-stock', last_count_date: '2025-06-20T14:30:00Z', last_counted_by: 'katarymba' },
    { id: '2', product_id: '1', warehouse_id: '2', warehouse_name: 'Холодильный склад №1', quantity: 120, quantity_reserved: 0, minimum_quantity: 20, reorder_level: 40, status: 'in-stock', last_count_date: '2025-06-18T11:15:00Z', last_counted_by: 'operator1' },
    { id: '3', product_id: '2', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 85, quantity_reserved: 10, minimum_quantity: 15, reorder_level: 30, status: 'in-stock', last_count_date: '2025-06-22T09:45:00Z', last_counted_by: 'katarymba' },
    { id: '4', product_id: '3', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 125, quantity_reserved: 0, minimum_quantity: 20, reorder_level: 40, status: 'in-stock', last_count_date: '2025-06-21T16:30:00Z', last_counted_by: 'katarymba' },
    { id: '5', product_id: '3', warehouse_id: '3', warehouse_name: 'Транзитный склад', quantity: 45, quantity_reserved: 0, minimum_quantity: 10, reorder_level: 20, status: 'in-stock', last_count_date: '2025-06-15T11:20:00Z', last_counted_by: 'manager' },
    { id: '6', product_id: '7', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 5, quantity_reserved: 1, minimum_quantity: 3, reorder_level: 5, status: 'in-stock', last_count_date: '2025-06-23T10:05:00Z', last_counted_by: 'katarymba' },
    { id: '7', product_id: '7', warehouse_id: '2', warehouse_name: 'Холодильный склад №1', quantity: 3, quantity_reserved: 0, minimum_quantity: 2, reorder_level: 4, status: 'in-stock', last_count_date: '2025-06-20T14:15:00Z', last_counted_by: 'operator1' },
    { id: '8', product_id: '11', warehouse_id: '2', warehouse_name: 'Холодильный склад №1', quantity: 12, quantity_reserved: 2, minimum_quantity: 5, reorder_level: 10, status: 'in-stock', last_count_date: '2025-06-23T09:30:00Z', last_counted_by: 'katarymba' },
    { id: '9', product_id: '18', warehouse_id: '4', warehouse_name: 'Распределительный центр', quantity: 320, quantity_reserved: 0, minimum_quantity: 50, reorder_level: 100, status: 'in-stock', last_count_date: '2025-06-18T15:45:00Z', last_counted_by: 'manager' },
    { id: '10', product_id: '18', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 125, quantity_reserved: 25, minimum_quantity: 30, reorder_level: 60, status: 'in-stock', last_count_date: '2025-06-21T11:30:00Z', last_counted_by: 'katarymba' },
    { id: '11', product_id: '25', warehouse_id: '2', warehouse_name: 'Холодильный склад №1', quantity: 45.2, quantity_reserved: 10, minimum_quantity: 20, reorder_level: 40, status: 'in-stock', last_count_date: '2025-06-22T14:10:00Z', last_counted_by: 'katarymba' },
    { id: '12', product_id: '33', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 28, quantity_reserved: 5, minimum_quantity: 15, reorder_level: 25, status: 'in-stock', last_count_date: '2025-06-23T13:45:00Z', last_counted_by: 'katarymba' },
    { id: '13', product_id: '33', warehouse_id: '4', warehouse_name: 'Распределительный центр', quantity: 42, quantity_reserved: 0, minimum_quantity: 20, reorder_level: 35, status: 'in-stock', last_count_date: '2025-06-19T10:20:00Z', last_counted_by: 'manager' },
    { id: '14', product_id: '47', warehouse_id: '2', warehouse_name: 'Холодильный склад №1', quantity: 18, quantity_reserved: 2, minimum_quantity: 10, reorder_level: 15, status: 'in-stock', last_count_date: '2025-06-22T15:30:00Z', last_counted_by: 'katarymba' },
    { id: '15', product_id: '60', warehouse_id: '1', warehouse_name: 'Основной склад', quantity: 84, quantity_reserved: 0, minimum_quantity: 20, reorder_level: 30, status: 'in-stock', last_count_date: '2025-06-21T09:15:00Z', last_counted_by: 'operator1' },
    { id: '16', product_id: '60', warehouse_id: '3', warehouse_name: 'Транзитный склад', quantity: 32, quantity_reserved: 0, minimum_quantity: 10, reorder_level: 20, status: 'in-stock', last_count_date: '2025-06-18T13:40:00Z', last_counted_by: 'manager' }
];

// Типы движений
const movementTypes = ['receipt', 'issue', 'adjustment', 'transfer'];
const referenceTypes = ['order', 'shipment', 'sync'];
const users = ['katarymba', 'operator1', 'manager', 'admin'];

// Даты для истории движений (от старых к новым)
const datesForMovements = [
    '2025-05-01T08:30:00Z', '2025-05-05T10:15:00Z', '2025-05-10T14:45:00Z',
    '2025-05-15T11:20:00Z', '2025-05-20T16:30:00Z', '2025-05-25T09:45:00Z',
    '2025-05-28T13:10:00Z', '2025-06-01T15:30:00Z', '2025-06-05T10:45:00Z',
    '2025-06-10T09:20:00Z', '2025-06-15T14:15:00Z', '2025-06-20T11:30:00Z',
    '2025-06-22T15:45:00Z', '2025-06-23T10:30:00Z', '2025-06-24T09:15:00Z',
    '2025-06-24T14:50:00Z', '2025-06-24T17:30:00Z'
];

// Генерация заглушек для движений товаров
function generateStockMovements() {
    const movements = [];
    let id = 1;
    
    // Для каждого товара создаем несколько движений
    mockStockItems.forEach(stockItem => {
        const product = mockProducts.find(p => p.id === stockItem.product_id);
        if (!product) return;
        
        // Определение количества движений для этого товара (от 1 до 5)
        const movementCount = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < movementCount; i++) {
            // Выбираем случайную дату из списка
            const dateIndex = Math.floor(Math.random() * datesForMovements.length);
            const movementDate = datesForMovements[dateIndex];
            
            // Выбираем тип движения
            const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
            
            // Определение количества для движения
            let quantity = 0;
            switch (movementType) {
                case 'receipt':
                    quantity = Math.floor(Math.random() * 50) + 10; // Поступление: от 10 до 60
                    break;
                case 'issue':
                    quantity = -1 * (Math.floor(Math.random() * 20) + 5); // Отгрузка: от -5 до -25
                    break;
                case 'adjustment':
                    // Корректировки могут быть положительными или отрицательными
                    quantity = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
                    break;
                case 'transfer':
                    quantity = Math.floor(Math.random() * 15) + 5; // Перемещение: от 5 до 20
                    break;
            }
            
            // Создание объекта движения
            const previousQuantity = Math.max(0, stockItem.quantity - quantity);
            
            // Для некоторых движений добавим ссылку на документ
            let referenceId = '';
            let referenceType = '';
            if (Math.random() > 0.7) {
                referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
                if (referenceType === 'order') {
                    referenceId = `ORD-${Math.floor(Math.random() * 10000)}`;
                } else if (referenceType === 'shipment') {
                    referenceId = `SHIP-${Math.floor(Math.random() * 10000)}`;
                } else if (referenceType === 'sync') {
                    referenceId = `SYNC-${Math.floor(Math.random() * 10000)}`;
                }
            }
            
            // Примечания для движения
            let notes = '';
            if (movementType === 'receipt') {
                notes = `Поступление товара от поставщика ${product.supplier}`;
            } else if (movementType === 'issue') {
                notes = 'Отгрузка по заказу клиента';
            } else if (movementType === 'adjustment') {
                notes = quantity > 0 ? 'Корректировка по результатам инвентаризации (излишек)' : 'Корректировка по результатам инвентаризации (недостача)';
            } else if (movementType === 'transfer') {
                const targetWarehouse = mockWarehouses.find(w => w.id !== stockItem.warehouse_id);
                notes = `Перемещение на склад "${targetWarehouse ? targetWarehouse.name : 'другой склад'}"`;
            }
            
            movements.push({
                id: id.toString(),
                product_id: product.id,
                product_name: product.name,
                warehouse_id: stockItem.warehouse_id,
                warehouse_name: stockItem.warehouse_name,
                quantity: Math.abs(quantity), // Абсолютное значение для отображения
                previous_quantity: previousQuantity,
                movement_type: movementType,
                movement_date: movementDate,
                reference_id: referenceId,
                reference_type: referenceType,
                performed_by: users[Math.floor(Math.random() * users.length)],
                notes: notes
            });
            
            id++;
        }
    });
    
    // Добавляем несколько самых свежих движений за текущий день
    // Поступление Икры Сибирского осетра
    movements.push({
        id: id.toString(),
        product_id: '11',
        product_name: 'Икра Сибирского осетра 500г с/с',
        warehouse_id: '2',
        warehouse_name: 'Холодильный склад №1',
        quantity: 5,
        previous_quantity: 7,
        movement_type: 'receipt',
        movement_date: '2025-06-24T16:45:00Z',
        reference_id: 'SHIP-8742',
        reference_type: 'shipment',
        performed_by: 'katarymba',
        notes: 'Поставка от "Дары моря" по графику, партия P24-056'
    });
    id++;
    
    // Отгрузка форели
    movements.push({
        id: id.toString(),
        product_id: '33',
        product_name: 'СЁМГА С/С в/у пласт',
        warehouse_id: '1',
        warehouse_name: 'Основной склад',
        quantity: 8.5,
        previous_quantity: 37,
        movement_type: 'issue',
        movement_date: '2025-06-24T14:15:00Z',
        reference_id: 'ORD-4523',
        reference_type: 'order',
        performed_by: 'operator1',
        notes: 'Отгрузка для ресторана "Морской бриз"'
    });
    id++;
    
    // Корректировка по инвентаризации
    movements.push({
        id: id.toString(),
        product_id: '18',
        product_name: 'МИНТАЙ с/м',
        warehouse_id: '1',
        warehouse_name: 'Основной склад',
        quantity: 3.2,
        previous_quantity: 122.6,
        movement_type: 'adjustment',
        movement_date: '2025-06-24T12:30:00Z',
        reference_id: '',
        reference_type: '',
        performed_by: 'katarymba',
        notes: 'Корректировка по инвентаризации (излишек)'
    });
    id++;
    
    // Перемещение на другой склад
    movements.push({
        id: id.toString(),
        product_id: '47',
        product_name: 'ФАЛАНГИ КАМЧАТСКОГО КРАБА',
        warehouse_id: '2',
        warehouse_name: 'Холодильный склад №1',
        quantity: 5.5,
        previous_quantity: 24.1,
        movement_type: 'transfer',
        movement_date: '2025-06-24T09:20:00Z',
        reference_id: '',
        reference_type: '',
        performed_by: 'manager',
        notes: 'Перемещение на склад "Распределительный центр" для отправки в Москву'
    });
    
    return movements.sort((a, b) => 
        new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime()
    );
}

// Создаем заглушки для движений товаров
const mockStockMovements = generateStockMovements();

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
    isLoading: propIsLoading,
    products: propProducts,
    stockItems: propStockItems,
    warehouses: propWarehouses,
    stockMovements: propStockMovements,
    fetchData: propFetchData,
    API_BASE_URL,
    getCurrentDateTime = () => CURRENT_DATE,
    getCurrentUser = () => CURRENT_USER
}) => {
    // Используем заглушки для данных
    const [isLoading, setIsLoading] = useState(true);
    const [products] = useState(() => propProducts && propProducts.length ? propProducts : mockProducts);
    const [stockItems] = useState(() => propStockItems && propStockItems.length ? propStockItems : mockStockItems);
    const [warehouses] = useState(() => propWarehouses && propWarehouses.length ? propWarehouses : mockWarehouses);
    const [stockMovements] = useState(() => propStockMovements && propStockMovements.length ? propStockMovements : mockStockMovements);

    // Симуляция загрузки данных
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

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

    // Handle add movement (заглушка)
    const handleAddMovement = async () => {
        try {
            if (!newMovement.product_id || !newMovement.warehouse_id || newMovement.quantity <= 0) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }

            // Имитация добавления движения
            setTimeout(() => {
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
                alert('Движение товара успешно создано!');
            }, 500);
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

    // Mock fetchData function
    const fetchData = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
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
                                            ? (movement.movement_type === 'issue' 
                                                ? movement.previous_quantity - movement.quantity 
                                                : movement.previous_quantity + movement.quantity)
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