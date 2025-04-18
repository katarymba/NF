import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  PlusIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  TruckIcon,
  QrCodeIcon,
  ClipboardDocumentCheckIcon, 
  ArrowDownTrayIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  ArchiveBoxXMarkIcon,
  ArchiveBoxArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Интерфейсы для типов данных, основанные на структуре БД
interface Product {
  id: string;
  sku: string; // Артикул/код товара
  name: string;
  description?: string;
  category_id: string;
  category_name: string; // Название категории для отображения
  unit: string;
  price: number;
  tax_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  supplier?: string;
  image_url?: string;
}

interface StockItem {
  id: string;
  product_id: string;
  product_name: string; // Для отображения
  warehouse_id: string;
  warehouse_name: string; // Для отображения
  quantity: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  reorder_level: number;
  quantity_reserved?: number;
  last_count_date?: string;
  last_counted_by?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'over-stock';
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  city?: string;
  is_active: boolean;
  type: string; // Тип склада (основной, холодильник, морозильник и т.д.)
}

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  previous_quantity: number;
  movement_type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  reference_id?: string;
  reference_type?: string;
  performed_by: string;
  movement_date: string;
  notes?: string;
}

interface Shipment {
  id: string;
  supplier: string;
  shipment_date: string;
  expected_arrival_date?: string;
  actual_arrival_date?: string;
  status: 'planned' | 'in-transit' | 'received' | 'processed' | 'cancelled';
  reference_number?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  items: ShipmentItem[];
}

interface ShipmentItem {
  id: string;
  shipment_id: string;
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  warehouse_id: string;
  is_received: boolean;
  received_date?: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  parent_name?: string;
}

interface ProductFilter {
  search: string;
  category_id: string;
  status: string;
  supplier: string;
  warehouse_id: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

// URL для API
const API_BASE_URL = '/api';

// Настройка для использования моковых данных вместо API запросов
const USE_MOCK_DATA = true;

// Текущая дата и время для системы
const CURRENT_DATE = '2025-04-16 18:18:37';
const CURRENT_USER = 'katarymba';

const Warehouse: React.FC = () => {
  // Состояния для данных
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // Состояния UI
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipments' | 'movements'>('inventory');
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [showAddShipmentModal, setShowAddShipmentModal] = useState<boolean>(false);
  const [showInventoryCountModal, setShowInventoryCountModal] = useState<boolean>(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  
  // Состояние фильтров и сортировки для товаров
  const [filters, setFilters] = useState<ProductFilter>({
    search: '',
    category_id: '',
    status: 'all',
    supplier: '',
    warehouse_id: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  // Состояние для нового товара
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
  
  // Состояние для нового складского запаса
  const [newStockItem, setNewStockItem] = useState<Partial<StockItem>>({
    product_id: '',
    warehouse_id: '',
    quantity: 0,
    minimum_quantity: 0,
    reorder_level: 0,
    status: 'in-stock'
  });
  
  // Состояние для новой поставки
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    supplier: '',
    shipment_date: new Date().toISOString().split('T')[0],
    expected_arrival_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 день
    status: 'planned',
    created_by: CURRENT_USER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: []
  });
  
  // Состояние для нового элемента поставки
  const [newShipmentItem, setNewShipmentItem] = useState<Partial<ShipmentItem>>({
    product_id: '',
    quantity_ordered: 0,
    unit_price: 0,
    warehouse_id: ''
  });
  
  // Состояние для нового пересчета товаров
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
  
  // Получение данных при загрузке компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Запрос к API или использование моковых данных
        if (USE_MOCK_DATA) {
          await loadMockData();
        } else {
          // Запрос данных с бэкенда
          const [
            productsResponse, 
            stockResponse, 
            warehousesResponse, 
            categoriesResponse,
            shipmentsResponse,
            stockMovementsResponse
          ] = await Promise.all([
            axios.get(`${API_BASE_URL}/products`),
            axios.get(`${API_BASE_URL}/stocks`),
            axios.get(`${API_BASE_URL}/warehouses`),
            axios.get(`${API_BASE_URL}/categories`),
            axios.get(`${API_BASE_URL}/shipments`),
            axios.get(`${API_BASE_URL}/stock-movements`)
          ]);
          
          setProducts(productsResponse.data);
          setStockItems(stockResponse.data);
          setWarehouses(warehousesResponse.data);
          setCategories(categoriesResponse.data);
          setShipments(shipmentsResponse.data);
          setStockMovements(stockMovementsResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch warehouse data:", err);
        setError("Не удалось загрузить данные склада. Используются демо-данные.");
        await loadMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Загрузка моковых данных для разработки
  const loadMockData = async () => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Категории товаров
    const mockCategories: Category[] = [
      { id: '1', name: 'Свежая рыба', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Замороженная рыба', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Морепродукты', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Консервы', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'Икра', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'Копчёности', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'Соленья', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ];
    
    // Склады
    const mockWarehouses: Warehouse[] = [
      { id: '1', name: 'Основной склад', is_active: true, type: 'general' },
      { id: '2', name: 'Холодильник 1', is_active: true, type: 'fridge' },
      { id: '3', name: 'Холодильник 2', is_active: true, type: 'fridge' },
      { id: '4', name: 'Морозильная камера', is_active: true, type: 'freezer' },
      { id: '5', name: 'Витрина', is_active: true, type: 'display' },
      { id: '6', name: 'Внешний склад', is_active: false, type: 'external' }
    ];
    
    // Товары
    const mockProducts: Product[] = [
      {
        id: '1',
        sku: 'FR-001',
        name: 'Лосось атлантический свежий',
        description: 'Свежий лосось атлантический',
        category_id: '1',
        category_name: 'Свежая рыба',
        unit: 'кг',
        price: 1200,
        is_active: true,
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2025-04-16T09:23:45Z',
        supplier: 'СеверМорПродукт',
        image_url: '/images/products/salmon.jpg'
      },
      {
        id: '2',
        sku: 'FR-002',
        name: 'Дорада свежая',
        category_id: '1',
        category_name: 'Свежая рыба',
        unit: 'кг',
        price: 980,
        is_active: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2025-04-16T08:15:22Z',
        supplier: 'МореПродукт',
        image_url: '/images/products/dorada.jpg'
      },
      {
        id: '3',
        sku: 'FR-003',
        name: 'Сибас свежий',
        category_id: '1',
        category_name: 'Свежая рыба',
        unit: 'кг',
        price: 950,
        is_active: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2025-04-16T10:05:11Z',
        supplier: 'МореПродукт',
        image_url: '/images/products/seabass.jpg'
      },
      {
        id: '4',
        sku: 'FZ-001',
        name: 'Треска филе замороженное',
        description: 'Филе трески глубокой заморозки',
        category_id: '2',
        category_name: 'Замороженная рыба',
        unit: 'кг',
        price: 680,
        is_active: true,
        created_at: '2024-02-10T00:00:00Z',
        updated_at: '2025-04-15T16:42:18Z',
        supplier: 'АтлантикФиш',
        image_url: '/images/products/cod.jpg'
      },
      {
        id: '5',
        sku: 'FZ-002',
        name: 'Минтай филе замороженное',
        category_id: '2',
        category_name: 'Замороженная рыба',
        unit: 'кг',
        price: 420,
        is_active: true,
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2025-04-15T16:55:33Z',
        supplier: 'ТихоокеанскийУлов',
        image_url: '/images/products/pollock.jpg'
      },
      {
        id: '6',
        sku: 'SF-001',
        name: 'Креветки тигровые очищенные',
        description: 'Очищенные тигровые креветки, замороженные',
        category_id: '3',
        category_name: 'Морепродукты',
        unit: 'кг',
        price: 1350,
        is_active: true,
        created_at: '2024-03-05T00:00:00Z',
        updated_at: '2025-04-15T14:22:05Z',
        supplier: 'КамчатскийКраб',
        image_url: '/images/products/shrimp.jpg'
      },
      {
        id: '7',
        sku: 'SF-002',
        name: 'Гребешок морской',
        category_id: '3',
        category_name: 'Морепродукты',
        unit: 'кг',
        price: 1680,
        is_active: true,
        created_at: '2024-03-10T00:00:00Z',
        updated_at: '2025-04-16T11:37:29Z',
        supplier: 'ДальневосточныеДеликатесы',
        image_url: '/images/products/scallop.jpg'
      },
      {
        id: '8',
        sku: 'SF-003',
        name: 'Мидии в раковине',
        category_id: '3',
        category_name: 'Морепродукты',
        unit: 'кг',
        price: 950,
        is_active: true,
        created_at: '2024-03-15T00:00:00Z',
        updated_at: '2025-04-16T08:10:44Z',
        supplier: 'МореПродукт',
        image_url: '/images/products/mussels.jpg'
      },
      {
        id: '9',
        sku: 'CN-001',
        name: 'Тунец консервированный в собственном соку',
        description: 'Консервы из тунца в собственном соку',
        category_id: '4',
        category_name: 'Консервы',
        unit: 'шт',
        price: 210,
        is_active: true,
        created_at: '2024-04-01T00:00:00Z',
        updated_at: '2025-04-14T13:25:18Z',
        supplier: 'АтлантикФиш',
        image_url: '/images/products/tuna.jpg'
      },
      {
        id: '10',
        sku: 'CV-001',
        name: 'Икра лососевая зернистая',
        category_id: '5',
        category_name: 'Икра',
        unit: 'кг',
        price: 5800,
        is_active: true,
        created_at: '2024-04-10T00:00:00Z',
        updated_at: '2025-04-16T09:15:32Z',
        supplier: 'ДальневосточныеДеликатесы',
        image_url: '/images/products/caviar.jpg'
      }
    ];
    
    // Складские запасы
    const mockStockItems: StockItem[] = [
      {
        id: '1',
        product_id: '1',
        product_name: 'Лосось атлантический свежий',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: 154,
        minimum_quantity: 50,
        reorder_level: 70,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T09:23:45Z',
        last_counted_by: 'Иванов А.П.',
        status: 'in-stock'
      },
      {
        id: '2',
        product_id: '2',
        product_name: 'Дорада свежая',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: 42,
        minimum_quantity: 30,
        reorder_level: 40,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T08:15:22Z',
        last_counted_by: 'Петрова М.С.',
        status: 'in-stock'
      },
      {
        id: '3',
        product_id: '3',
        product_name: 'Сибас свежий',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: 28,
        minimum_quantity: 30,
        reorder_level: 40,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T10:05:11Z',
        last_counted_by: 'Петрова М.С.',
        status: 'low-stock'
      },
      {
        id: '4',
        product_id: '4',
        product_name: 'Треска филе замороженное',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: 220,
        minimum_quantity: 100,
        reorder_level: 120,
        quantity_reserved: 0,
        last_count_date: '2025-04-15T16:42:18Z',
        last_counted_by: 'Сидоров И.В.',
        status: 'in-stock'
      },
      {
        id: '5',
        product_id: '5',
        product_name: 'Минтай филе замороженное',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: 185,
        minimum_quantity: 80,
        reorder_level: 100,
        quantity_reserved: 0,
        last_count_date: '2025-04-15T16:55:33Z',
        last_counted_by: 'Сидоров И.В.',
        status: 'in-stock'
      },
      {
        id: '6',
        product_id: '6',
        product_name: 'Креветки тигровые очищенные',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: 45,
        minimum_quantity: 30,
        reorder_level: 40,
        quantity_reserved: 0,
        last_count_date: '2025-04-15T14:22:05Z',
        last_counted_by: 'Сидоров И.В.',
        status: 'in-stock'
      },
      {
        id: '7',
        product_id: '7',
        product_name: 'Гребешок морской',
        warehouse_id: '3',
        warehouse_name: 'Холодильник 2',
        quantity: 12,
        minimum_quantity: 20,
        reorder_level: 25,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T11:37:29Z',
        last_counted_by: 'Иванов А.П.',
        status: 'low-stock'
      },
      {
        id: '8',
        product_id: '8',
        product_name: 'Мидии в раковине',
        warehouse_id: '3',
        warehouse_name: 'Холодильник 2',
        quantity: 0,
        minimum_quantity: 25,
        reorder_level: 35,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T08:10:44Z',
        last_counted_by: 'Иванов А.П.',
        status: 'out-of-stock'
      },
      {
        id: '9',
        product_id: '9',
        product_name: 'Тунец консервированный в собственном соку',
        warehouse_id: '1',
        warehouse_name: 'Основной склад',
        quantity: 432,
        minimum_quantity: 150,
        reorder_level: 200,
        quantity_reserved: 0,
        last_count_date: '2025-04-14T13:25:18Z',
        last_counted_by: 'Смирнова Т.А.',
        status: 'in-stock'
      },
      {
        id: '10',
        product_id: '10',
        product_name: 'Икра лососевая зернистая',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: 8,
        minimum_quantity: 15,
        reorder_level: 20,
        quantity_reserved: 0,
        last_count_date: '2025-04-16T09:15:32Z',
        last_counted_by: 'Петрова М.С.',
        status: 'low-stock'
      }
    ];
    
    // Поставки
    const mockShipments: Shipment[] = [
      {
        id: 'SH-2025-0415',
        supplier: 'СеверМорПродукт',
        shipment_date: '2025-04-15T10:00:00Z',
        expected_arrival_date: '2025-04-15T10:00:00Z',
        actual_arrival_date: '2025-04-15T10:15:00Z',
        status: 'received',
        reference_number: 'PO-2025-042',
        created_by: 'Иванов А.П.',
        created_at: '2025-04-14T08:30:00Z',
        updated_at: '2025-04-15T10:15:00Z',
        notes: 'Поставка принята полностью, 2 кг сибаса не соответствовали стандартам качества.',
        items: [
          {
            id: 'SI-001',
            shipment_id: 'SH-2025-0415',
            product_id: '1',
            product_name: 'Лосось атлантический свежий',
            quantity_ordered: 80,
            quantity_received: 80,
            unit_price: 1150,
            warehouse_id: '2',
            is_received: true,
            received_date: '2025-04-15T10:15:00Z'
          },
          {
            id: 'SI-002',
            shipment_id: 'SH-2025-0415',
            product_id: '3',
            product_name: 'Сибас свежий',
            quantity_ordered: 50,
            quantity_received: 48,
            unit_price: 930,
            warehouse_id: '2',
            is_received: true,
            received_date: '2025-04-15T10:15:00Z',
            notes: '2 кг не соответствовали стандартам качества'
          }
        ]
      },
      {
        id: 'SH-2025-0416',
        supplier: 'КамчатскийКраб',
        shipment_date: '2025-04-16T08:30:00Z',
        expected_arrival_date: '2025-04-16T08:30:00Z',
        actual_arrival_date: '2025-04-16T08:45:00Z',
        status: 'received',
        reference_number: 'PO-2025-043',
        created_by: 'Сидоров И.В.',
        created_at: '2025-04-15T09:00:00Z',
        updated_at: '2025-04-16T08:45:00Z',
        notes: 'Поставка принята без замечаний.',
        items: [
          {
            id: 'SI-003',
            shipment_id: 'SH-2025-0416',
            product_id: '6',
            product_name: 'Креветки тигровые очищенные',
            quantity_ordered: 30,
            quantity_received: 30,
            unit_price: 1320,
            warehouse_id: '4',
            is_received: true,
            received_date: '2025-04-16T08:45:00Z'
          },
          {
            id: 'SI-004',
            shipment_id: 'SH-2025-0416',
            product_id: '7',
            product_name: 'Гребешок морской',
            quantity_ordered: 15,
            quantity_received: 15,
            unit_price: 1650,
            warehouse_id: '3',
            is_received: true,
            received_date: '2025-04-16T08:45:00Z'
          }
        ]
      },
      {
        id: 'SH-2025-0417',
        supplier: 'МореПродукт',
        shipment_date: '2025-04-17T09:00:00Z',
        expected_arrival_date: '2025-04-17T09:00:00Z',
        status: 'planned',
        reference_number: 'PO-2025-044',
        created_by: 'Петрова М.С.',
        created_at: '2025-04-16T10:30:00Z',
        updated_at: '2025-04-16T10:30:00Z',
        items: [
          {
            id: 'SI-005',
            shipment_id: 'SH-2025-0417',
            product_id: '2',
            product_name: 'Дорада свежая',
            quantity_ordered: 40,
            unit_price: 970,
            warehouse_id: '2',
            is_received: false
          },
          {
            id: 'SI-006',
            shipment_id: 'SH-2025-0417',
            product_id: '8',
            product_name: 'Мидии в раковине',
            quantity_ordered: 35,
            unit_price: 940,
            warehouse_id: '3',
            is_received: false
          }
        ]
      },
      {
        id: 'SH-2025-0418',
        supplier: 'ДальневосточныеДеликатесы',
        shipment_date: '2025-04-18T11:30:00Z',
        expected_arrival_date: '2025-04-18T11:30:00Z',
        status: 'in-transit',
        reference_number: 'PO-2025-045',
        created_by: 'Смирнова Т.А.',
        created_at: '2025-04-16T14:00:00Z',
        updated_at: '2025-04-16T15:30:00Z',
        notes: 'Ожидается доставка курьерской службой "Экспресс-Доставка"',
        items: [
          {
            id: 'SI-007',
            shipment_id: 'SH-2025-0418',
            product_id: '10',
            product_name: 'Икра лососевая зернистая',
            quantity_ordered: 12,
            unit_price: 5700,
            warehouse_id: '2',
            is_received: false
          }
        ]
      }
    ];
    
    // Складские движения
    const mockStockMovements: StockMovement[] = [
      {
        id: 'SM-001',
        product_id: '1',
        product_name: 'Лосось атлантический свежий',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: -2,
        previous_quantity: 156,
        movement_type: 'adjustment',
        performed_by: 'Иванов А.П.',
        movement_date: '2025-04-16T09:23:45Z',
        notes: 'Корректировка после проверки фактического наличия'
      },
      {
        id: 'SM-002',
        product_id: '3',
        product_name: 'Сибас свежий',
        warehouse_id: '2',
        warehouse_name: 'Холодильник 1',
        quantity: 2,
        previous_quantity: 26,
        movement_type: 'adjustment',
        performed_by: 'Петрова М.С.',
        movement_date: '2025-04-16T10:05:11Z',
        notes: 'Обнаружены неучтенные позиции при пересчете'
      },
      {
        id: 'SM-003',
        product_id: '7',
        product_name: 'Гребешок морской',
        warehouse_id: '3',
        warehouse_name: 'Холодильник 2',
        quantity: -3,
        previous_quantity: 15,
        movement_type: 'adjustment',
        performed_by: 'Иванов А.П.',
        movement_date: '2025-04-16T11:37:29Z',
        notes: 'Списание некондиционного товара'
      },
      {
        id: 'SM-004',
        product_id: '4',
        product_name: 'Треска филе замороженное',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: 20,
        previous_quantity: 200,
        movement_type: 'receipt',
        reference_id: 'SH-2025-0414',
        reference_type: 'shipment',
        performed_by: 'Сидоров И.В.',
        movement_date: '2025-04-15T16:42:18Z',
        notes: 'Приемка новой партии'
      },
      {
        id: 'SM-005',
        product_id: '5',
        product_name: 'Минтай филе замороженное',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: -5,
        previous_quantity: 190,
        movement_type: 'adjustment',
        performed_by: 'Сидоров И.В.',
        movement_date: '2025-04-15T16:55:33Z',
        notes: 'Корректировка после проверки фактического наличия'
      },
      {
        id: 'SM-006',
        product_id: '6',
        product_name: 'Креветки тигровые очищенные',
        warehouse_id: '4',
        warehouse_name: 'Морозильная камера',
        quantity: 30,
        previous_quantity: 15,
        movement_type: 'receipt',
        reference_id: 'SH-2025-0416',
        reference_type: 'shipment',
        performed_by: 'Сидоров И.В.',
        movement_date: '2025-04-16T08:45:00Z',
        notes: 'Приемка товара от поставщика "КамчатскийКраб"'
      },
      {
        id: 'SM-007',
        product_id: '7',
        product_name: 'Гребешок морской',
        warehouse_id: '3',
        warehouse_name: 'Холодильник 2',
        quantity: 15,
        previous_quantity: 0,
        movement_type: 'receipt',
        reference_id: 'SH-2025-0416',
        reference_type: 'shipment',
        performed_by: 'Сидоров И.В.',
        movement_date: '2025-04-16T08:45:00Z',
        notes: 'Приемка товара от поставщика "КамчатскийКраб"'
      }
    ];
    
    // Устанавливаем все данные в state
    setCategories(mockCategories);
    setWarehouses(mockWarehouses);
    setProducts(mockProducts);
    setStockItems(mockStockItems);
    setShipments(mockShipments);
    setStockMovements(mockStockMovements);
    
    return true;
  };

  // Получение выбранного продукта и его запасов
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !products.length) return null;
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  const selectedProductStocks = useMemo(() => {
    if (!selectedProductId || !stockItems.length) return [];
    return stockItems.filter(item => item.product_id === selectedProductId);
  }, [selectedProductId, stockItems]);

  // Получение выбранного склада
  const selectedWarehouse = useMemo(() => {
    if (!selectedWarehouseId || !warehouses.length) return null;
    return warehouses.find(w => w.id === selectedWarehouseId) || null;
  }, [selectedWarehouseId, warehouses]);

  // Фильтрация склада и расчет статистики
  const filteredStockItems = useMemo(() => {
    if (!stockItems.length) return [];
    
    return stockItems.filter(item => {
      // Поиск продукта для получения данных о нем
      const product = products.find(p => p.id === item.product_id);
      if (!product) return false;
      
      // Фильтр по поисковому запросу
      if (
        filters.search && 
        !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !product.sku.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      
      // Фильтр по категории
      if (filters.category_id && product.category_id !== filters.category_id) {
        return false;
      }
      
      // Фильтр по статусу
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      
      // Фильтр по поставщику
      if (filters.supplier && product.supplier !== filters.supplier) {
        return false;
      }
      
      // Фильтр по складу
      if (filters.warehouse_id && item.warehouse_id !== filters.warehouse_id) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Находим продукты для получения данных о них
      const productA = products.find(p => p.id === a.product_id);
      const productB = products.find(p => p.id === b.product_id);
      if (!productA || !productB) return 0;
      
      // Сортировка по выбранному полю
      switch (filters.sortBy) {
        case 'name':
          return filters.sortDirection === 'asc'
            ? productA.name.localeCompare(productB.name)
            : productB.name.localeCompare(productA.name);
        case 'sku':
          return filters.sortDirection === 'asc'
            ? productA.sku.localeCompare(productB.sku)
            : productB.sku.localeCompare(productA.sku);
        case 'quantity':
          return filters.sortDirection === 'asc'
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        case 'category':
          return filters.sortDirection === 'asc'
            ? productA.category_name.localeCompare(productB.category_name)
            : productB.category_name.localeCompare(productA.category_name);
        case 'lastUpdated':
          return filters.sortDirection === 'asc'
            ? new Date(a.last_count_date || 0).getTime() - new Date(b.last_count_date || 0).getTime()
            : new Date(b.last_count_date || 0).getTime() - new Date(a.last_count_date || 0).getTime();
        default:
          return 0;
      }
    });
  }, [stockItems, products, filters]);
  
  // Фильтрация поставок
  const filteredShipments = useMemo(() => {
    return shipments.sort((a, b) => {
      return new Date(b.shipment_date).getTime() - new Date(a.shipment_date).getTime();
    });
  }, [shipments]);
  
  // Фильтрация движений на складе
  const filteredStockMovements = useMemo(() => {
    return stockMovements.sort((a, b) => {
      return new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime();
    });
  }, [stockMovements]);

  // Расчет общей статистики склада
  const warehouseStats = useMemo(() => {
    if (!stockItems.length) return {
      totalProducts: 0,
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };
    
    // Подсчет общей стоимости склада
    let totalValue = 0;
    stockItems.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        totalValue += item.quantity * product.price;
      }
    });
    
    return {
      totalProducts: products.length,
      totalItems: stockItems.length,
      totalValue: totalValue,
      lowStockItems: stockItems.filter(item => item.status === 'low-stock').length,
      outOfStockItems: stockItems.filter(item => item.status === 'out-of-stock').length
    };
  }, [stockItems, products]);

  // Обработчики форм
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

  // Обработчик добавления нового товара
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category_id) {
      alert('Пожалуйста, заполните обязательные поля: Наименование, Артикул, Категория');
      return;
    }
    
    try {
      // В реальном приложении это будет API запрос
      if (!USE_MOCK_DATA) {
        const response = await axios.post(`${API_BASE_URL}/products`, newProduct);
        const createdProduct = response.data;
        setProducts([...products, createdProduct]);
        
        // Если указан склад и количество, создаём запись о запасе
        if (newStockItem.warehouse_id && newStockItem.quantity) {
          const stockData = {
            ...newStockItem,
            product_id: createdProduct.id,
            product_name: createdProduct.name,
            warehouse_name: warehouses.find(w => w.id === newStockItem.warehouse_id)?.name || '',
            status: (newStockItem.quantity || 0) > 0 
              ? ((newStockItem.quantity || 0) < (newStockItem.minimum_quantity || 0) ? 'low-stock' : 'in-stock')
              : 'out-of-stock',
            last_count_date: new Date().toISOString(),
            last_counted_by: CURRENT_USER
          };
          
          const stockResponse = await axios.post(`${API_BASE_URL}/stocks`, stockData);
          setStockItems([...stockItems, stockResponse.data]);
        }
      } else {
        // Имитация создания для демо режима
        const createdProduct: Product = {
          ...newProduct as Product,
          id: `PROD-${Date.now()}`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category_name: categories.find(c => c.id === newProduct.category_id)?.name || ''
        };
        
        setProducts([...products, createdProduct]);
        
        // Если указан склад и количество, создаём запись о запасе
        if (newStockItem.warehouse_id && newStockItem.quantity) {
          const stockData: StockItem = {
            id: `STOCK-${Date.now()}`,
            product_id: createdProduct.id,
            product_name: createdProduct.name,
            warehouse_id: newStockItem.warehouse_id as string,
            warehouse_name: warehouses.find(w => w.id === newStockItem.warehouse_id)?.name || '',
            quantity: newStockItem.quantity as number,
            minimum_quantity: newStockItem.minimum_quantity as number,
            reorder_level: newStockItem.reorder_level as number,
            status: (newStockItem.quantity as number) > 0 
              ? ((newStockItem.quantity as number) < (newStockItem.minimum_quantity as number) ? 'low-stock' : 'in-stock')
              : 'out-of-stock',
            last_count_date: new Date().toISOString(),
            last_counted_by: CURRENT_USER
          };
          
          setStockItems([...stockItems, stockData]);
          
          // Создаем запись о движении товара
          const movement: StockMovement = {
            id: `SM-${Date.now()}`,
            product_id: createdProduct.id,
            product_name: createdProduct.name,
            warehouse_id: newStockItem.warehouse_id as string,
            warehouse_name: warehouses.find(w => w.id === newStockItem.warehouse_id)?.name || '',
            quantity: newStockItem.quantity as number,
            previous_quantity: 0,
            movement_type: 'receipt',
            performed_by: CURRENT_USER,
            movement_date: new Date().toISOString(),
            notes: 'Первоначальное добавление товара в систему'
          };
          
          setStockMovements([...stockMovements, movement]);
        }
      }
      
      // Очистка формы и закрытие модального окна
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
      
      setShowAddProductModal(false);
      
      // Уведомление
      alert('Товар успешно добавлен!');
    } catch (err) {
      console.error("Ошибка при добавлении товара:", err);
      alert('Ошибка при добавлении товара. Пожалуйста, попробуйте снова.');
    }
  };

  // Обработчик добавления новой поставки
  const handleAddShipment = async () => {
    if (!newShipment.supplier || !(newShipment.items || []).length || !newShipment.shipment_date) {
      alert('Пожалуйста, заполните обязательные поля: Поставщик, Дата поставки, Товары');
      return;
    }
    
    // Проверка наличия товаров в поставке
    for (const item of (newShipment.items as ShipmentItem[])) {
      if (!item.product_id || !item.quantity_ordered || !item.warehouse_id) {
        alert('Пожалуйста, заполните все данные о товарах в поставке');
        return;
      }
    }
    
    try {
      // В реальном приложении это будет API запрос
      if (!USE_MOCK_DATA) {
        const response = await axios.post(`${API_BASE_URL}/shipments`, newShipment);
        setShipments([...shipments, response.data]);
      } else {
        // Имитация создания поставки для демо режима
        const createdShipment: Shipment = {
          ...newShipment as Shipment,
          id: `SH-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: CURRENT_USER,
          items: (newShipment.items || []).map((item, idx) => {
            const product = products.find(p => p.id === item.product_id);
            return {
              id: `SI-${Date.now()}-${idx}`,
              shipment_id: `SH-${Date.now()}`,
              product_id: item.product_id as string,
              product_name: product ? product.name : 'Неизвестный товар',
              quantity_ordered: item.quantity_ordered as number,
              unit_price: item.unit_price as number,
              warehouse_id: item.warehouse_id as string,
              is_received: false
            };
          })
        };
        
        setShipments([...shipments, createdShipment]);
      }
      
      // Очистка формы и закрытие модального окна
      setNewShipment({
        supplier: '',
        shipment_date: new Date().toISOString().split('T')[0],
        expected_arrival_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 день
        status: 'planned',
        created_by: CURRENT_USER,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: []
      });
      
      setShowAddShipmentModal(false);
      
      // Уведомление
      alert('Поставка успешно добавлена!');
    } catch (err) {
      console.error("Ошибка при добавлении поставки:", err);
      alert('Ошибка при добавлении поставки. Пожалуйста, попробуйте снова.');
    }
  };

  // Обработчик добавления элемента поставки
  const handleAddShipmentItem = () => {
    if (!newShipmentItem.product_id || !newShipmentItem.quantity_ordered || !newShipmentItem.unit_price || !newShipmentItem.warehouse_id) {
      alert('Пожалуйста, заполните все данные о товаре');
      return;
    }
    
    // Находим продукт для получения его названия
    const product = products.find(p => p.id === newShipmentItem.product_id);
    
    const newItem: ShipmentItem = {
      id: `TEMP-${Date.now()}`,
      shipment_id: 'TEMP',
      product_id: newShipmentItem.product_id as string,
      product_name: product ? product.name : 'Неизвестный товар',
      quantity_ordered: newShipmentItem.quantity_ordered as number,
      unit_price: newShipmentItem.unit_price as number,
      warehouse_id: newShipmentItem.warehouse_id as string,
      is_received: false
    };
    
    setNewShipment(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    
    // Очистка формы товара
    setNewShipmentItem({
      product_id: '',
      quantity_ordered: 0,
      unit_price: 0,
      warehouse_id: ''
    });
  };

  // Обработчик удаления элемента поставки
  const handleRemoveShipmentItem = (index: number) => {
    setNewShipment(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index)
    }));
  };

  // Обработчик пересчета товара
  const handleInventoryCount = async () => {
    if (!newInventoryCount.product_id || !newInventoryCount.warehouse_id) {
      alert('Пожалуйста, выберите товар и склад');
      return;
    }
    
    try {
      // Находим текущий запас товара
      const stockItem = stockItems.find(item => 
        item.product_id === newInventoryCount.product_id && 
        item.warehouse_id === newInventoryCount.warehouse_id
      );
      
      if (!stockItem) {
        alert('Товар на указанном складе не найден');
        return;
      }
      
      // Рассчитываем разницу в количестве
      const previousQuantity = stockItem.quantity;
      const newQuantity = newInventoryCount.new_quantity;
      const difference = newQuantity - previousQuantity;
      
      // В реальном приложении это будет API запрос
      if (!USE_MOCK_DATA) {
        // Обновляем запас
        await axios.patch(`${API_BASE_URL}/stocks/${stockItem.id}`, {
          quantity: newQuantity,
          last_count_date: new Date().toISOString(),
          last_counted_by: CURRENT_USER,
          status: newQuantity > 0 
            ? (newQuantity < stockItem.minimum_quantity ? 'low-stock' : 'in-stock')
            : 'out-of-stock'
        });
        
        // Создаем запись о движении товара
        await axios.post(`${API_BASE_URL}/stock-movements`, {
          product_id: newInventoryCount.product_id,
          warehouse_id: newInventoryCount.warehouse_id,
          quantity: difference,
          previous_quantity: previousQuantity,
          movement_type: 'adjustment',
          performed_by: CURRENT_USER,
          movement_date: new Date().toISOString(),
          notes: newInventoryCount.notes
        });
        
        // Обновляем данные
        const [stocksResponse, movementsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/stocks`),
          axios.get(`${API_BASE_URL}/stock-movements`)
        ]);
        
        setStockItems(stocksResponse.data);
        setStockMovements(movementsResponse.data);
      } else {
        // Имитация для демо режима
        // Обновляем запас
        const updatedStockItems = stockItems.map(item => {
          if (item.id === stockItem.id) {
            return {
              ...item,
              quantity: newQuantity,
              last_count_date: new Date().toISOString(),
              last_counted_by: CURRENT_USER,
              status: newQuantity > 0 
                ? (newQuantity < item.minimum_quantity ? 'low-stock' : 'in-stock')
                : 'out-of-stock'
            };
          }
          return item;
        });
        
        setStockItems(updatedStockItems);
        
        // Находим продукт и склад для получения их названий
        const product = products.find(p => p.id === newInventoryCount.product_id);
        const warehouse = warehouses.find(w => w.id === newInventoryCount.warehouse_id);
        
        // Создаем запись о движении товара
        const newMovement: StockMovement = {
          id: `SM-${Date.now()}`,
          product_id: newInventoryCount.product_id,
          product_name: product ? product.name : 'Неизвестный товар',
          warehouse_id: newInventoryCount.warehouse_id,
          warehouse_name: warehouse ? warehouse.name : 'Неизвестный склад',
          quantity: difference,
          previous_quantity: previousQuantity,
          movement_type: 'adjustment',
          performed_by: CURRENT_USER,
          movement_date: new Date().toISOString(),
          notes: newInventoryCount.notes
        };
        
        setStockMovements([...stockMovements, newMovement]);
      }
      
      // Очистка формы и закрытие модального окна
      setNewInventoryCount({
        product_id: '',
        warehouse_id: '',
        new_quantity: 0,
        notes: ''
      });
      
      setShowInventoryCountModal(false);
      
      // Уведомление
      alert('Пересчет товара успешно выполнен!');
    } catch (err) {
      console.error("Ошибка при пересчете товара:", err);
      alert('Ошибка при пересчете товара. Пожалуйста, попробуйте снова.');
    }
  };

  // Обработчик приема поставки
  const handleReceiveShipment = async (shipmentId: string) => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) {
        alert('Поставка не найдена');
        return;
      }
      
      // В реальном приложении это будет API запрос
      if (!USE_MOCK_DATA) {
        // Обновляем статус поставки
        await axios.patch(`${API_BASE_URL}/shipments/${shipmentId}`, {
          status: 'received',
          actual_arrival_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Обновляем элементы поставки и добавляем товары на склад
        for (const item of shipment.items) {
          // Помечаем элемент поставки как полученный
          await axios.patch(`${API_BASE_URL}/shipment-items/${item.id}`, {
            is_received: true,
            quantity_received: item.quantity_ordered, // По умолчанию получаем всё количество
            received_date: new Date().toISOString()
          });
          
          // Находим текущий запас товара на указанном складе
          const stockItem = stockItems.find(si => 
            si.product_id === item.product_id && 
            si.warehouse_id === item.warehouse_id
          );
          
          if (stockItem) {
            // Обновляем существующий запас
            const newQuantity = stockItem.quantity + item.quantity_ordered;
            await axios.patch(`${API_BASE_URL}/stocks/${stockItem.id}`, {
              quantity: newQuantity,
              last_count_date: new Date().toISOString(),
              status: newQuantity > 0 
                ? (newQuantity < stockItem.minimum_quantity ? 'low-stock' : 'in-stock')
                : 'out-of-stock'
            });
            
            // Создаем запись о движении товара
            await axios.post(`${API_BASE_URL}/stock-movements`, {
              product_id: item.product_id,
              warehouse_id: item.warehouse_id,
              quantity: item.quantity_ordered,
              previous_quantity: stockItem.quantity,
              movement_type: 'receipt',
              reference_id: shipmentId,
              reference_type: 'shipment',
              performed_by: CURRENT_USER,
              movement_date: new Date().toISOString(),
              notes: `Приемка товара из поставки #${shipmentId}`
            });
          } else {
            // Создаем новый запас
            const product = products.find(p => p.id === item.product_id);
            const warehouse = warehouses.find(w => w.id === item.warehouse_id);
            
            if (product && warehouse) {
              const newStockData = {
                product_id: item.product_id,
                product_name: product.name,
                warehouse_id: item.warehouse_id,
                warehouse_name: warehouse.name,
                quantity: item.quantity_ordered,
                minimum_quantity: 0, // По умолчанию
                reorder_level: 0, // По умолчанию
                status: 'in-stock',
                last_count_date: new Date().toISOString(),
                last_counted_by: CURRENT_USER
              };
              
              await axios.post(`${API_BASE_URL}/stocks`, newStockData);
              
              // Создаем запись о движении товара
              await axios.post(`${API_BASE_URL}/stock-movements`, {
                product_id: item.product_id,
                warehouse_id: item.warehouse_id,
                quantity: item.quantity_ordered,
                previous_quantity: 0,
                movement_type: 'receipt',
                reference_id: shipmentId,
                reference_type: 'shipment',
                performed_by: CURRENT_USER,
                movement_date: new Date().toISOString(),
                notes: `Приемка товара из поставки #${shipmentId}`
              });
            }
          }
        }
        
        // Обновляем данные
        const [shipmentsResponse, stocksResponse, movementsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/shipments`),
          axios.get(`${API_BASE_URL}/stocks`),
          axios.get(`${API_BASE_URL}/stock-movements`)
        ]);
        
        setShipments(shipmentsResponse.data);
        setStockItems(stocksResponse.data);
        setStockMovements(movementsResponse.data);
      } else {
        // Имитация для демо режима
        // Обновляем статус поставки
        const updatedShipments = shipments.map(s => {
          if (s.id === shipmentId) {
            return {
              ...s,
              status: 'received',
              actual_arrival_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: s.items.map(item => ({
                ...item,
                is_received: true,
                quantity_received: item.quantity_ordered,
                received_date: new Date().toISOString()
              }))
            };
          }
          return s;
        });
        
        setShipments(updatedShipments);
        
        // Обновляем запасы и создаем записи о движении
        const newStockItems = [...stockItems];
        const newStockMovements = [...stockMovements];
        
        for (const item of shipment.items) {
          // Находим текущий запас товара на указанном складе
          const stockItemIndex = newStockItems.findIndex(si => 
            si.product_id === item.product_id && 
            si.warehouse_id === item.warehouse_id
          );
          
          if (stockItemIndex !== -1) {
            // Обновляем существующий запас
            const previousQuantity = newStockItems[stockItemIndex].quantity;
            const newQuantity = previousQuantity + item.quantity_ordered;
            
            newStockItems[stockItemIndex] = {
              ...newStockItems[stockItemIndex],
              quantity: newQuantity,
              last_count_date: new Date().toISOString(),
              last_counted_by: CURRENT_USER,
              status: newQuantity > 0 
                ? (newQuantity < newStockItems[stockItemIndex].minimum_quantity ? 'low-stock' : 'in-stock')
                : 'out-of-stock'
            };
            
            // Создаем запись о движении товара
            newStockMovements.push({
              id: `SM-${Date.now()}-${item.product_id}`,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: item.warehouse_id,
              warehouse_name: warehouses.find(w => w.id === item.warehouse_id)?.name || 'Неизвестный склад',
              quantity: item.quantity_ordered,
              previous_quantity: previousQuantity,
              movement_type: 'receipt',
              reference_id: shipmentId,
              reference_type: 'shipment',
              performed_by: CURRENT_USER,
              movement_date: new Date().toISOString(),
              notes: `Приемка товара из поставки ${shipment.reference_number || shipmentId}`
            });
          } else {
            // Создаем новый запас
            const product = products.find(p => p.id === item.product_id);
            const warehouse = warehouses.find(w => w.id === item.warehouse_id);
            
            if (product && warehouse) {
              const newStockItem: StockItem = {
                id: `STOCK-${Date.now()}-${item.product_id}`,
                product_id: item.product_id,
                product_name: product.name,
                warehouse_id: item.warehouse_id,
                warehouse_name: warehouse.name,
                quantity: item.quantity_ordered,
                minimum_quantity: 0, // По умолчанию
                reorder_level: 0, // По умолчанию
                status: 'in-stock',
                last_count_date: new Date().toISOString(),
                last_counted_by: CURRENT_USER
              };
              
              newStockItems.push(newStockItem);
              
              // Создаем запись о движении товара
              newStockMovements.push({
                id: `SM-${Date.now()}-${item.product_id}`,
                product_id: item.product_id,
                product_name: item.product_name,
                warehouse_id: item.warehouse_id,
                warehouse_name: warehouse.name,
                quantity: item.quantity_ordered,
                previous_quantity: 0,
                movement_type: 'receipt',
                reference_id: shipmentId,
                reference_type: 'shipment',
                performed_by: CURRENT_USER,
                movement_date: new Date().toISOString(),
                notes: `Приемка товара из поставки ${shipment.reference_number || shipmentId}`
              });
            }
          }
        }
        
        setStockItems(newStockItems);
        setStockMovements(newStockMovements);
      }
      
      // Уведомление
      alert('Поставка успешно принята!');
    } catch (err) {
      console.error("Ошибка при приеме поставки:", err);
      alert('Ошибка при приеме поставки. Пожалуйста, попробуйте снова.');
    }
  };

  // Форматирование даты и времени
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Форматирование даты
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Форматирование суммы
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Заголовок и кнопки действий */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Склад</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управление складскими запасами и поставками
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Добавить товар
          </button>
          
          <button
            onClick={() => setShowAddShipmentModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <TruckIcon className="h-5 w-5 mr-1" />
            Новая поставка
          </button>
          
          <button
            onClick={() => setShowInventoryCountModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
            Пересчет товара
          </button>
        </div>
      </div>
      
      {/* Карточки с общей статистикой */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Всего наименований</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{warehouseStats.totalProducts}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">В каталоге товаров</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Всего складских позиций</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{warehouseStats.totalItems}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">На всех складах</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Общая стоимость</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(warehouseStats.totalValue)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Всех товаров на складах</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Заканчиваются</div>
          <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">{warehouseStats.lowStockItems}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Требуется пополнение</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Отсутствуют</div>
          <div className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{warehouseStats.outOfStockItems}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Нет в наличии</div>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Складской учет
          </button>
          
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipments'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Поставки
          </button>
          
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Движение товаров
          </button>
        </nav>
      </div>
      
      {/* Содержимое вкладки "Складской учет" */}
      {activeTab === 'inventory' && (
        <>
          {/* Фильтры и поиск */}
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
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                
                <ArrowPathIcon 
                  className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" 
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 500);
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Таблица товаров */}
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
                        // Находим продукт для получения его данных
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
        </>
      )}
      
      {/* Содержимое вкладки "Поставки" */}
      {activeTab === 'shipments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredShipments.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p>Поставки не найдены.</p>
                  <button
                    onClick={() => setShowAddShipmentModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    Добавить первую поставку
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          № поставки
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Поставщик
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Дата поставки
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Товаров
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
                      {filteredShipments.map((shipment) => {
                        // Рассчитываем общую сумму поставки
                                                // Рассчитываем общую сумму поставки
                                                const totalAmount = shipment.items.reduce((total, item) => {
                                                    return total + (item.quantity_ordered * item.unit_price);
                                                  }, 0);
                                                  
                                                  return (
                                                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                          {shipment.reference_number || shipment.id}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                          Создано: {formatDateTime(shipment.created_at)}
                                                        </div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">{shipment.supplier}</div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                          {formatDate(shipment.shipment_date)}
                                                        </div>
                                                        {shipment.actual_arrival_date && (
                                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Прибытие: {formatDate(shipment.actual_arrival_date)}
                                                          </div>
                                                        )}
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                          {shipment.items.length} наим.
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                          {shipment.items.reduce((sum, item) => sum + item.quantity_ordered, 0)} шт.
                                                        </div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                          {formatCurrency(totalAmount)}
                                                        </div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                          ${shipment.status === 'planned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                          ${shipment.status === 'in-transit' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                          ${shipment.status === 'received' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                          ${shipment.status === 'processed' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}
                                                          ${shipment.status === 'cancelled' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                                        `}>
                                                          {shipment.status === 'planned' && 'Запланирована'}
                                                          {shipment.status === 'in-transit' && 'В пути'}
                                                          {shipment.status === 'received' && 'Получена'}
                                                          {shipment.status === 'processed' && 'Обработана'}
                                                          {shipment.status === 'cancelled' && 'Отменена'}
                                                        </span>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                          {shipment.status === 'planned' || shipment.status === 'in-transit' ? (
                                                            <button 
                                                              onClick={() => handleReceiveShipment(shipment.id)}
                                                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            >
                                                              Принять
                                                            </button>
                                                          ) : (
                                                            <button 
                                                              onClick={() => {
                                                                setSelectedProductId(null);
                                                                alert('Просмотр деталей поставки');
                                                              }}
                                                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                              Детали
                                                            </button>
                                                          )}
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                                
                                {/* Содержимое вкладки "Движение товаров" */}
                                {activeTab === 'movements' && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    {isLoading ? (
                                      <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                      </div>
                                    ) : (
                                      <>
                                        {filteredStockMovements.length === 0 ? (
                                          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                            <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                                            <p>Движений товаров не найдено.</p>
                                          </div>
                                        ) : (
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
                                                    Тип операции
                                                  </th>
                                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Выполнил
                                                  </th>
                                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Примечание
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredStockMovements.map((movement) => (
                                                  <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                      <div className="text-sm text-gray-900 dark:text-white">
                                                        {formatDateTime(movement.movement_date)}
                                                      </div>
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
                                                      <div className={`text-sm font-medium ${
                                                        movement.quantity > 0 
                                                          ? 'text-green-600 dark:text-green-400' 
                                                          : movement.quantity < 0 
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                      }`}>
                                                        {movement.quantity > 0 && '+'}
                                                        {movement.quantity} ед.
                                                      </div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Было: {movement.previous_quantity} → Стало: {movement.previous_quantity + movement.quantity}
                                                      </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${movement.movement_type === 'receipt' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                        ${movement.movement_type === 'issue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                        ${movement.movement_type === 'adjustment' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                        ${movement.movement_type === 'transfer' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}
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
                                                        </div>
                                                      )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                      <div className="text-sm text-gray-900 dark:text-white">
                                                        {movement.performed_by}
                                                      </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                        {movement.notes}
                                                      </div>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                                
                                {/* Модальное окно для добавления товара */}
                                {showAddProductModal && (
                                  <div className="fixed inset-0 z-50 overflow-y-auto">
                                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                                      </div>
                                      
                                      {/* Модальное окно */}
                                      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                        {/* Заголовок модального окна */}
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Добавление нового товара
                                          </h2>
                                          <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                          </button>
                                        </div>
                                        
                                        {/* Содержимое формы */}
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                  min="0"
                                                  step="0.01"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Кнопки действий */}
                                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => setShowAddProductModal(false)}
                                            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                                                      text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
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
                                
                                {/* Модальное окно для добавления поставки */}
                                {showAddShipmentModal && (
                                  <div className="fixed inset-0 z-50 overflow-y-auto">
                                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                                      </div>
                                      
                                      {/* Модальное окно */}
                                      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                        {/* Заголовок модального окна */}
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Создание новой поставки
                                          </h2>
                                          <button onClick={() => setShowAddShipmentModal(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                          </button>
                                        </div>
                                        
                                        {/* Содержимое формы */}
                                        <div className="px-6 py-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Поставщик <span className="text-red-500">*</span>
                                              </label>
                                              <input
                                                type="text"
                                                id="supplier"
                                                value={newShipment.supplier || ''}
                                                onChange={(e) => setNewShipment({...newShipment, supplier: e.target.value})}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                placeholder="Название поставщика"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label htmlFor="reference-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Номер заказа / документа
                                              </label>
                                              <input
                                                type="text"
                                                id="reference-number"
                                                value={newShipment.reference_number || ''}
                                                onChange={(e) => setNewShipment({...newShipment, reference_number: e.target.value})}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                placeholder="Например: PO-2025-042"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label htmlFor="shipment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Дата поставки <span className="text-red-500">*</span>
                                              </label>
                                              <input
                                                type="date"
                                                id="shipment-date"
                                                value={newShipment.shipment_date?.split('T')[0] || ''}
                                                onChange={(e) => setNewShipment({...newShipment, shipment_date: e.target.value})}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label htmlFor="expected-arrival-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Ожидаемая дата прибытия
                                              </label>
                                              <input
                                                type="date"
                                                id="expected-arrival-date"
                                                value={newShipment.expected_arrival_date?.split('T')[0] || ''}
                                                onChange={(e) => setNewShipment({...newShipment, expected_arrival_date: e.target.value})}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                              />
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Примечания
                                              </label>
                                              <textarea
                                                id="notes"
                                                value={newShipment.notes || ''}
                                                onChange={(e) => setNewShipment({...newShipment, notes: e.target.value})}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                placeholder="Дополнительная информация о поставке"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                                              <span>Товары в поставке</span>
                                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Всего: {(newShipment.items || []).length} наименований
                                              </span>
                                            </h3>
                                            
                                            {/* Форма добавления товара в поставку */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-4">
                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                  <label htmlFor="item-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Товар <span className="text-red-500">*</span>
                                                  </label>
                                                  <select
                                                    id="item-product"
                                                    value={newShipmentItem.product_id || ''}
                                                    onChange={(e) => setNewShipmentItem({...newShipmentItem, product_id: e.target.value})}
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
                                                  <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Количество <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                    type="number"
                                                    id="item-quantity"
                                                    value={newShipmentItem.quantity_ordered || 0}
                                                    onChange={(e) => setNewShipmentItem({...newShipmentItem, quantity_ordered: parseFloat(e.target.value) || 0})}
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                              bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                    min="0"
                                                    step="0.01"
                                                  />
                                                </div>
                                                
                                                <div>
                                                  <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Цена <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                    type="number"
                                                    id="item-price"
                                                    value={newShipmentItem.unit_price || 0}
                                                    onChange={(e) => setNewShipmentItem({...newShipmentItem, unit_price: parseFloat(e.target.value) || 0})}
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                              bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                    min="0"
                                                    step="0.01"
                                                  />
                                                </div>
                                                
                                                <div>
                                                  <label htmlFor="item-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Склад <span className="text-red-500">*</span>
                                                  </label>
                                                  <div className="flex">
                                                    <select
                                                      id="item-warehouse"
                                                      value={newShipmentItem.warehouse_id || ''}
                                                      onChange={(e) => setNewShipmentItem({...newShipmentItem, warehouse_id: e.target.value})}
                                                      className="flex-1 px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 
                                                                bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                    >
                                                      <option value="">Выберите склад</option>
                                                      {warehouses.map(warehouse => (
                                                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                                      ))}
                                                    </select>
                                                    
                                                    <button
                                                      type="button"
                                                      onClick={handleAddShipmentItem}
                                                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-md"
                                                    >
                                                      <PlusIcon className="h-5 w-5" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Таблица товаров в поставке */}
                                            {(newShipment.items || []).length > 0 ? (
                                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                  <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Товар
                                                      </th>
                                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Количество
                                                      </th>
                                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Цена
                                                      </th>
                                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Сумма
                                                      </th>
                                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Склад
                                                      </th>
                                                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Действия
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {(newShipment.items || []).map((item, index) => {
                                                      const product = products.find(p => p.id === item.product_id);
                                                      const warehouse = warehouses.find(w => w.id === item.warehouse_id);
                                                      
                                                      return (
                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {product ? product.name : 'Неизвестный товар'}
                                                          </td>
                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {item.quantity_ordered} {product?.unit || 'ед.'}
                                                          </td>
                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {formatCurrency(item.unit_price)}
                                                          </td>
                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {formatCurrency(item.quantity_ordered * item.unit_price)}
                                                          </td>
                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {warehouse ? warehouse.name : 'Неизвестный склад'}
                                                          </td>
                                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                              type="button"
                                                              onClick={() => handleRemoveShipmentItem(index)}
                                                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                              Удалить
                                                            </button>
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                                <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                                                <p>Добавьте товары в поставку</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Кнопки действий */}
                                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                          <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Общая стоимость: <span className="font-medium text-gray-900 dark:text-white">
                                              {formatCurrency((newShipment.items || []).reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price), 0))}
                                            </span>
                                          </div>
                                          
                                          <div>
                                            <button
                                              type="button"
                                              onClick={() => setShowAddShipmentModal(false)}
                                              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                                                        text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                                            >
                                              Отмена
                                            </button>
                                            <button
                                              type="button"
                                              onClick={handleAddShipment}
                                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                              disabled={(newShipment.items || []).length === 0}
                                            >
                                              Создать поставку
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Модальное окно для пересчета товара */}
                                {showInventoryCountModal && (
                                  <div className="fixed inset-0 z-50 overflow-y-auto">
                                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                                      </div>
                                      
                                      {/* Модальное окно */}
                                      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                        {/* Заголовок модального окна */}
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Пересчет товара
                                          </h2>
                                          <button onClick={() => setShowInventoryCountModal(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                          </button>
                                        </div>
                                        
                                        {/* Содержимое формы */}
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                  
                                                  // Если выбраны и товар, и склад - найдем текущее количество
                                                  if (newInventoryCount.product_id && warehouseId) {
                                                    const stockItem = stockItems.find(item => 
                                                      item.product_id === newInventoryCount.product_id && 
                                                      item.warehouse_id === warehouseId
                                                    );
                                                    
                                                    if (stockItem) {
                                                      setNewInventoryCount(prev => ({...prev, new_quantity: stockItem.quantity}));
                                                    } else {
                                                      setNewInventoryCount(prev => ({...prev, new_quantity: 0}));
                                                    }
                                                  }
                                                }}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                                placeholder="Причина корректировки"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Кнопки действий */}
                                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => setShowInventoryCountModal(false)}
                                            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                                                      text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
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
                                
                                {/* Модальное окно для просмотра деталей товара */}
                                {showProductDetailsModal && selectedProduct && (
                                  <div className="fixed inset-0 z-50 overflow-y-auto">
                                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                                      </div>
                                      
                                      {/* Модальное окно */}
                                      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                        {/* Заголовок модального окна */}
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Детали товара
                                          </h2>
                                          <button onClick={() => setShowProductDetailsModal(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                          </button>
                                        </div>
                                        
                                        {/* Содержимое */}
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
                                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
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
                                                
                                                <div>
                                                  <div className="text-sm text-gray-500 dark:text-gray-400">Создан</div>
                                                  <div className="text-base text-gray-900 dark:text-white">{formatDate(selectedProduct.created_at)}</div>
                                                </div>
                                                
                                                <div>
                                                  <div className="text-sm text-gray-500 dark:text-gray-400">Обновлен</div>
                                                  <div className="text-base text-gray-900 dark:text-white">{formatDateTime(selectedProduct.updated_at)}</div>
                                                </div>
                                                
                                                {selectedProduct.description && (
                                                  <div className="col-span-2 mt-2">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Описание</div>
                                                    <div className="text-base text-gray-900 dark:text-white">{selectedProduct.description}</div>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              {/* Складские запасы */}
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
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
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
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* История движений по товару */}
                                          <div className="mt-8">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">История движений</h4>
                                            
                                            {filteredStockMovements.filter(m => m.product_id === selectedProduct.id).length === 0 ? (
                                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                <p>История движений по товару отсутствует</p>
                                              </div>
                                            ) : (
                                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                  <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Дата
                                                      </th>
                                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Склад
                                                      </th>
                                                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Изменение
                                                      </th>
                                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Тип операции
                                                      </th>
                                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                      Комментарий
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredStockMovements
                            .filter(m => m.product_id === selectedProduct.id)
                            .map(movement => (
                              <tr key={movement.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {formatDateTime(movement.movement_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {movement.warehouse_name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                  <span className={`font-medium ${
                                    movement.quantity > 0 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : movement.quantity < 0 
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {movement.quantity > 0 && '+'}
                                    {movement.quantity} {selectedProduct.unit}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {movement.movement_type === 'receipt' && 'Поступление'}
                                  {movement.movement_type === 'issue' && 'Отгрузка'}
                                  {movement.movement_type === 'adjustment' && 'Корректировка'}
                                  {movement.movement_type === 'transfer' && 'Перемещение'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {movement.notes || '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowProductDetailsModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                            text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Находим связанные складские позиции
                    const stockItem = selectedProductStocks.find(item => 
                      item.warehouse_id === selectedWarehouseId
                    );
                    
                    if (stockItem) {
                      setNewInventoryCount({
                        product_id: selectedProduct.id,
                        warehouse_id: stockItem.warehouse_id,
                        new_quantity: stockItem.quantity,
                        notes: ''
                      });
                      setShowProductDetailsModal(false);
                      setShowInventoryCountModal(true);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  disabled={!selectedWarehouseId || selectedProductStocks.length === 0}
                >
                  Пересчет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Нижний колонтитул */}
      <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between items-center">
          <div>
            <p>Система управления складскими запасами</p>
          </div>
          <div className="text-right">
            <p>Последнее обновление: 2025-04-16 18:34:52</p>
            <p>Пользователь: katarymba</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;
                