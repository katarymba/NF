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

import '../styles/Warehouse.css';

// Import the three modules
import StockManagement from './warehouse/StockManagement';
import SupplyManagement from './warehouse/SupplyManagement';
import StockMovements from './warehouse/StockMovements';

// Import interfaces
import {
  Product,
  StockItem,
  Warehouse as WarehouseType,
  Category,
  Shipment,
  ShipmentItem,
  StockMovement
} from './warehouse/interfaces';

// Import API constants and functions
import {
  API_BASE_URL,
  getProducts,
  getStocks,
  getWarehouses,
  getCategories,
  getSupplies,
  getStockMovements,
  getAxiosAuthConfig
} from '../services/api';

// Helper functions
const getCurrentDateTime = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const getCurrentUser = () => {
  return localStorage.getItem('currentUser') || 'katarymba';
};

// API key and URL for Север-Рыба
const SEVER_RYBA_API_URL = `http://localhost:8000`;
const SEVER_RYBA_API_KEY = localStorage.getItem('severRybaApiKey') || 'sr_api_key_2025';

const Warehouse: React.FC = () => {
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipments' | 'movements'>('inventory');

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Use the imported functions where possible
      const productsData = await getProducts().catch(error => {
        console.warn("Failed to fetch products:", error);
        return [];
      });

      const stocksData = await getStocks().catch(error => {
        console.warn("Failed to fetch stocks:", error);
        return [];
      });

      const warehousesData = await getWarehouses().catch(error => {
        console.warn("Failed to fetch warehouses:", error);
        return [];
      });

      const categoriesData = await getCategories().catch(error => {
        console.warn("Failed to fetch categories:", error);
        return [];
      });

      const suppliesData = await getSupplies().catch(error => {
        console.warn("Failed to fetch supplies:", error);
        return [];
      });

      let stockMovementsData: any[] = [];
      try {
        stockMovementsData = await getStockMovements();
      } catch (error) {
        console.warn("Failed to fetch stock movements:", error);
        // Try direct axios call as fallback using both possible endpoints
        try {
          // Try with /api prefix first
          const response = await axios.get(`${API_BASE_URL}/api/stock-movements`, getAxiosAuthConfig());
          stockMovementsData = response.data;
        } catch (directError) {
          // Then try without /api prefix
          try {
            const fallbackResponse = await axios.get(`${API_BASE_URL}/stock-movements`, getAxiosAuthConfig());
            stockMovementsData = fallbackResponse.data;
          } catch (finalError) {
            console.error("All attempts to fetch stock movements failed:", finalError);
            stockMovementsData = [];
          }
        }
      }

      // Set state with the fetched data
      setProducts(productsData);
      setStockItems(stocksData);
      setWarehouses(warehousesData);
      setCategories(categoriesData);
      setShipments(suppliesData);
      setStockMovements(stockMovementsData);

      setError(null);
    } catch (err) {
      console.error("Failed to fetch warehouse data:", err);
      setError("Не удалось загрузить данные склада. Пожалуйста, проверьте подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component load
  useEffect(() => {
    fetchData();
  }, []);

  // Function to merge product data from different sources
  const mergeProductData = (aisProducts: Product[], severRybaProducts: any[], categoriesList: Category[]) => {
    // If there's no data from Север-Рыба, return AIS data
    if (!severRybaProducts || !severRybaProducts.length) {
      return aisProducts;
    }

    // Map for quick product search by SKU
    const productMap = new Map();
    aisProducts.forEach(product => {
      productMap.set(product.sku, product);
    });

    // Function to find category ID by name
    const findCategoryId = (categoryName: string) => {
      const category = categoriesList.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      return category ? category.id : '1'; // Return default ID if category not found
    };

    // Update or add products from Север-Рыба
    severRybaProducts.forEach(srProduct => {
      if (productMap.has(srProduct.sku)) {
        // Update existing product
        const existingProduct = productMap.get(srProduct.sku);
        existingProduct.price = srProduct.price || existingProduct.price;
        existingProduct.updated_at = srProduct.last_updated || existingProduct.updated_at;
        existingProduct.sr_stock_quantity = srProduct.quantity || 0;
        existingProduct.sr_sync = true;
      } else {
        // Add new product from Север-Рыба
        productMap.set(srProduct.sku, {
          id: `SR-${srProduct.id}`,
          sku: srProduct.sku,
          name: srProduct.name,
          category_id: findCategoryId(srProduct.category),
          category_name: srProduct.category,
          unit: srProduct.unit || 'шт',
          price: srProduct.price || 0,
          is_active: true,
          created_at: srProduct.created || new Date().toISOString(),
          updated_at: srProduct.last_updated || new Date().toISOString(),
          supplier: 'Север-Рыба',
          image_url: srProduct.image || '',
          sr_stock_quantity: srProduct.quantity || 0,
          sr_sync: true
        });
      }
    });

    return Array.from(productMap.values());
  };

  // Function to sync data with Север-Рыба
  const syncWithSeverRyba = async (showAlerts = true) => {
    if (showAlerts) setIsLoading(true);

    try {
      // Try different possible endpoints for Север-Рыба API
      let severRybaData = { products: [] };

      try {
        // First try /inventory
        const response = await axios.get(`${SEVER_RYBA_API_URL}/inventory`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('severRybaToken')}`,
            'X-API-Key': SEVER_RYBA_API_KEY
          }
        });
        severRybaData = response.data;
      } catch (err) {
        try {
          // Then try /products
          const response = await axios.get(`${SEVER_RYBA_API_URL}/products`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('severRybaToken')}`,
              'X-API-Key': SEVER_RYBA_API_KEY
            }
          });
          severRybaData = { products: response.data };
        } catch (innerErr) {
          // Finally try /api/products
          try {
            const response = await axios.get(`${SEVER_RYBA_API_URL}/api/products`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('severRybaToken')}`,
                'X-API-Key': SEVER_RYBA_API_KEY
              }
            });
            severRybaData = { products: response.data };
          } catch (finalErr) {
            console.error("All Север-Рыба API attempts failed:", finalErr);
            throw new Error("Не удалось подключиться к API Север-Рыба");
          }
        }
      }

      // Get actual data from our DB
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products`, getAxiosAuthConfig());

      // Combine data
      const combinedProducts = mergeProductData(
          productsResponse.data,
          severRybaData.products || [],
          categories
      );

      // Update products that have changed
      for (const product of combinedProducts) {
        if (product.sr_sync) {
          await axios.put(`${API_BASE_URL}/api/products/${product.id}`, {
            price: product.price,
            updated_at: new Date().toISOString()
          }, getAxiosAuthConfig());

          // If we have stock in our system but it's not in Север-Рыба
          // or vice versa - create or update records
          if (product.sr_stock_quantity !== undefined) {
            const stockItem = stockItems.find(item =>
                item.product_id === product.id &&
                item.warehouse_id === '1' // Assume the main warehouse has ID 1
            );

            if (stockItem) {
              // Update existing stock record
              await axios.patch(`${API_BASE_URL}/api/stocks/${stockItem.id}`, {
                quantity: product.sr_stock_quantity,
                last_count_date: new Date().toISOString(),
                last_counted_by: 'Север-Рыба Sync',
                status: determineStockStatus(product.sr_stock_quantity, stockItem.minimum_quantity)
              }, getAxiosAuthConfig());

              // Try to create stock movement record
              try {
                await axios.post(`${API_BASE_URL}/api/stock-movements`, {
                  product_id: product.id,
                  warehouse_id: '1',
                  quantity: product.sr_stock_quantity - stockItem.quantity,
                  previous_quantity: stockItem.quantity,
                  movement_type: 'adjustment',
                  performed_by: 'Север-Рыба Sync',
                  movement_date: new Date().toISOString(),
                  notes: 'Автоматическая синхронизация с Север-Рыба'
                }, getAxiosAuthConfig());
              } catch (moveError) {
                console.warn("Failed to create stock movement:", moveError);
              }
            } else {
              // Create new stock record
              await axios.post(`${API_BASE_URL}/api/stocks`, {
                product_id: product.id,
                warehouse_id: '1',
                quantity: product.sr_stock_quantity,
                minimum_quantity: 5, // Default value
                reorder_level: 10, // Default value
                status: determineStockStatus(product.sr_stock_quantity, 5),
                last_count_date: new Date().toISOString(),
                last_counted_by: 'Север-Рыба Sync'
              }, getAxiosAuthConfig());

              // Try to create stock movement record
              try {
                await axios.post(`${API_BASE_URL}/api/stock-movements`, {
                  product_id: product.id,
                  warehouse_id: '1',
                  quantity: product.sr_stock_quantity,
                  previous_quantity: 0,
                  movement_type: 'receipt',
                  performed_by: 'Север-Рыба Sync',
                  movement_date: new Date().toISOString(),
                  notes: 'Первоначальное добавление через синхронизацию с Север-Рыба'
                }, getAxiosAuthConfig());
              } catch (moveError) {
                console.warn("Failed to create stock movement:", moveError);
              }
            }
          }
        }
      }

      // Update page data
      await fetchData();

      if (showAlerts) {
        alert('Синхронизация с Север-Рыба выполнена успешно!');
      }
    } catch (err) {
      console.error("Ошибка при синхронизации с Север-Рыба:", err);
      if (showAlerts) {
        alert('Не удалось выполнить синхронизацию с Север-Рыба. Пожалуйста, проверьте подключение и попробуйте снова.');
      }
    } finally {
      if (showAlerts) setIsLoading(false);
    }
  };

  // Determine stock status
  const determineStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity < minQuantity) return 'low-stock';
    return 'in-stock';
  };

  // Calculate warehouse stats
  const warehouseStats = useMemo(() => {
    if (!stockItems || !stockItems.length || !products || !products.length) return {
      totalProducts: 0,
      totalItems: 0,
      totalValue: 0,
      totalValueBySR: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingSyncItems: 0
    };

    // Calculate stats and total value
    let totalValue = 0;
    let totalValueBySR = 0;
    let pendingSyncItems = 0;

    // Create Map for quick product lookup
    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    // Calculate total warehouse value considering data from both sources
    stockItems.forEach(item => {
      const product = productMap.get(item.product_id);
      if (product) {
        // Regular value based on AIS data
        totalValue += item.quantity * product.price;

        // Value considering Север-Рыба prices, if available
        const srPrice = product.sr_sync ? (product.price || 0) : 0;
        totalValueBySR += item.quantity * (srPrice || product.price);

        // Count items without sync
        if (!product.sr_sync) {
          pendingSyncItems++;
        }
      }
    });

    return {
      totalProducts: products.length,
      totalItems: stockItems.length,
      totalValue: parseFloat(totalValue.toFixed(2)), // Round for precision
      totalValueBySR: parseFloat(totalValueBySR.toFixed(2)),
      lowStockItems: stockItems.filter(item => item.status === 'low-stock').length,
      outOfStockItems: stockItems.filter(item => item.status === 'out-of-stock').length,
      pendingSyncItems
    };
  }, [stockItems, products]);

  return (
      <div className="container mx-auto p-4">
        {/* Header and action buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Склад</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Управление складскими запасами и поставками
            </p>
          </div>

          <div className="flex space-x-2">
            <button
                onClick={() => syncWithSeverRyba(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md flex items-center"
                disabled={isLoading}
            >
              {isLoading ? (
                  <span className="animate-spin mr-1">⟳</span>
              ) : (
                  <ArrowPathIcon className="h-5 w-5 mr-1" />
              )}
              Синхронизация с Север-Рыба
            </button>
          </div>
        </div>

        {/* Cards with general statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
              }).format(warehouseStats.totalValue)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">По данным АИС</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Стоимость по Север-Рыба</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
              }).format(warehouseStats.totalValueBySR)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">С учетом цен поставщика</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Заканчиваются</div>
            <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">{warehouseStats.lowStockItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Требуется пополнение</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Несинхронизировано</div>
            <div className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{warehouseStats.pendingSyncItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Требуется синхронизация</div>
          </div>
        </div>

        {/* Error message display */}
        {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Ошибка!</strong>
              <span className="block sm:inline"> {error}</span>
              <button
                  className="absolute top-0 right-0 px-4 py-3"
                  onClick={() => setError(null)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
            <div className="mb-6 p-4 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Загрузка данных...</span>
            </div>
        )}

        {/* Tabs */}
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

        {/* Tab content */}
        {activeTab === 'inventory' && (
            <StockManagement
                isLoading={isLoading}
                products={products}
                stockItems={stockItems}
                warehouses={warehouses}
                categories={categories}
                fetchData={fetchData}
                API_BASE_URL={`${API_BASE_URL}/api`}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
                determineStockStatus={determineStockStatus}
            />
        )}

        {activeTab === 'shipments' && (
            <SupplyManagement
                isLoading={isLoading}
                products={products}
                shipments={shipments}
                warehouses={warehouses}
                fetchData={fetchData}
                API_BASE_URL={`${API_BASE_URL}/api`}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
            />
        )}

        {activeTab === 'movements' && (
            <StockMovements
                isLoading={isLoading}
                products={products}
                stockItems={stockItems}
                warehouses={warehouses}
                stockMovements={stockMovements}
                fetchData={fetchData}
                API_BASE_URL={`${API_BASE_URL}/api`}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
            />
        )}

        {/* Footer */}
      </div>
  );
};

export default Warehouse;