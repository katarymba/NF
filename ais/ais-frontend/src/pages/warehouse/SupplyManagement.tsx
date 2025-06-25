import React, { useState, useMemo } from 'react';
import {
  TruckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import {
  Product,
  Warehouse,
  Shipment,
  ShipmentItem,
  Supplier,
  SHIPMENT_STATUSES
} from './interfaces';

// Импортируем настроенный apiClient вместо axios
import { apiClient, getAuthToken } from '../../utils/apiConfig';
import { logAPIError } from '../../utils/debugHelper';
import { API_FULL_URL } from '../../services/api';

interface SupplyManagementProps {
  isLoading: boolean;
  products: Product[];
  shipments: Shipment[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  fetchData: () => Promise<void>;
  API_BASE_URL: string;
  getCurrentDateTime: () => string;
  getCurrentUser: () => string;
}

const SupplyManagement: React.FC<SupplyManagementProps> = ({
                                                             isLoading,
                                                             products,
                                                             shipments,
                                                             warehouses,
                                                             suppliers,
                                                             fetchData,
                                                             API_BASE_URL,
                                                             getCurrentDateTime,
                                                             getCurrentUser
                                                           }) => {
  // State for new shipment
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    supplier_id: 0,
    shipment_date: getCurrentDateTime().split(' ')[0],
    expected_arrival_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 day
    status: SHIPMENT_STATUSES.PLANNED,
    created_by: getCurrentUser(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: []
  });

  // State for new shipment item
  const [newShipmentItem, setNewShipmentItem] = useState<Partial<ShipmentItem>>({
    product_id: '',
    quantity_ordered: 0,
    unit_price: 0,
    warehouse_id: ''
  });

  // UI state
  const [showAddShipmentModal, setShowAddShipmentModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    // Ensure shipments is an array before calling sort
    if (!Array.isArray(shipments)) {
      return [];
    }

    return shipments.sort((a, b) => {
      return new Date(b.shipment_date).getTime() - new Date(a.shipment_date).getTime();
    });
  }, [shipments]);

  const handleAddShipment = async () => {
    // Исправленная валидация - проверяем supplier_id вместо supplier
    if (!newShipment.supplier_id || !(newShipment.items || []).length || !newShipment.shipment_date) {
      alert('Пожалуйста, заполните обязательные поля: Поставщик, Дата поставки, Товары');
      return;
    }

    try {
      console.log("Начинаем отправку поставки:", newShipment);
      setIsSubmitting(true);

      // Определяем warehouse_id из первого товара или используем warehouse_id из основной формы
      const firstItem = (newShipment.items || [])[0] as ShipmentItem;
      const warehouse_id = newShipment.warehouse_id || firstItem?.warehouse_id;

      if (!warehouse_id) {
        alert('Не указан склад для поставки');
        setIsSubmitting(false);
        return;
      }

      const selectedSupplier = suppliers.find(s => s.id === Number(newShipment.supplier_id));

      if (!selectedSupplier) {
        alert('Выбранный поставщик не найден');
        setIsSubmitting(false);
        return;
      }

      const shipmentData = {
        supplier_id: Number(newShipment.supplier_id),
        warehouse_id: Number(warehouse_id),
        reference_number: newShipment.reference_number || null,
        notes: newShipment.notes || null,
        status: (newShipment.status || 'PLANNED').toUpperCase(),

        shipment_date: newShipment.shipment_date?.includes('T')
            ? newShipment.shipment_date
            : `${newShipment.shipment_date}T00:00:00.000Z`,

        expected_arrival_date: newShipment.expected_arrival_date?.includes('T')
            ? newShipment.expected_arrival_date
            : newShipment.expected_arrival_date ? `${newShipment.expected_arrival_date}T00:00:00.000Z` : null,

        items: (newShipment.items || []).map(item => ({
          product_id: Number(item.product_id),
          quantity_ordered: Number(item.quantity_ordered),
          unit_price: Number(item.unit_price),
          warehouse_id: Number(item.warehouse_id),
          product_name: item.product_name || null
        }))
      };

      console.log("Подготовленные данные для отправки:", JSON.stringify(shipmentData, null, 2));
      console.log("URL для отправки:", `${API_FULL_URL}/supplies/`);

      const response = await apiClient.post('/supplies/', shipmentData);
      console.log("Поставка успешно создана:", response.data);

      // Обновляем данные
      await fetchData();

      // Сбрасываем форму
      setNewShipment({
        supplier_id: 0,
        warehouse_id: '1',
        shipment_date: getCurrentDateTime().split(' ')[0],
        expected_arrival_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'PLANNED',
        reference_number: '',
        notes: '',
        items: []
      });

      setShowAddShipmentModal(false);
      alert('Поставка успешно добавлена!');

    } catch (apiError: any) {
      console.error('Ошибка при создании поставки:', apiError);

      if (apiError.response?.data?.detail) {
        const errorDetails = Array.isArray(apiError.response.data.detail)
            ? apiError.response.data.detail.map((err: any) => `Поле: ${err.loc?.join('.')}, Ошибка: ${err.msg}`).join('\n')
            : apiError.response.data.detail;
        console.error("Детали ошибки:", errorDetails);
        alert(`Ошибка валидации:\n${errorDetails}`);
      } else {
        alert('Произошла ошибка при создании поставки. Проверьте данные и попробуйте снова.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddShipmentItem = () => {
    if (!newShipmentItem.product_id || !newShipmentItem.quantity_ordered || !newShipmentItem.unit_price || !newShipmentItem.warehouse_id) {
      alert('Пожалуйста, заполните все данные о товаре');
      return;
    }

    // Преобразуем ID в число для гарантированного соответствия типов
    const productIdNumber = parseInt(newShipmentItem.product_id as string, 10);

    // Ищем продукт по числовому ID
    let product = products.find(p => p.id === productIdNumber);

    // Если не нашли по числовому ID, пробуем как строку (на всякий случай)
    if (!product) {
      product = products.find(p => String(p.id) === newShipmentItem.product_id);
    }

    console.log("Поиск товара:", {
      productIdAsString: newShipmentItem.product_id,
      productIdAsNumber: productIdNumber,
      foundProduct: product,
      productsList: products.map(p => ({id: p.id, name: p.name})).slice(0, 5) // Для отладки покажем первые 5 товаров
    });

    // Если не нашли продукт, покажем предупреждение
    if (!product) {
      console.warn(`Товар с ID ${newShipmentItem.product_id} не найден в списке товаров`);
    }

    // Имя продукта - берем из найденного продукта или используем заполнитель
    const productName = product ? product.name : `Товар ID: ${newShipmentItem.product_id}`;

    // Создаем новый элемент поставки
    const newItem: ShipmentItem = {
      id: `TEMP-${Date.now()}`,
      shipment_id: 'TEMP',
      product_id: newShipmentItem.product_id as string,
      product_name: productName,  // Используем найденное имя
      quantity_ordered: newShipmentItem.quantity_ordered as number,
      unit_price: newShipmentItem.unit_price as number,
      warehouse_id: newShipmentItem.warehouse_id as string,
      is_received: false
    };

    // Добавляем товар в поставку
    setNewShipment(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    // Очищаем форму товара
    setNewShipmentItem({
      product_id: '',
      quantity_ordered: 0,
      unit_price: 0,
      warehouse_id: ''
    });
  };

  const handleRemoveShipmentItem = (index: number) => {
    setNewShipment(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index)
    }));
  };

  // Исправленная функция handleReceiveShipment
  const handleReceiveShipment = async (shipmentId: string | undefined) => {
    // Проверяем, что ID существует
    if (!shipmentId) {
      alert('Ошибка: ID поставки отсутствует');
      return;
    }

    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) {
        alert('Поставка не найдена');
        return;
      }

      console.log("Обработка поставки:", shipmentId);

      // Используем настроенный apiClient вместо axios
      const response = await apiClient.post(`/supplies/${shipmentId}/process`);

      console.log("Поставка успешно обработана:", response.data);

      // Refresh data
      fetchData();

      // Notification
      alert('Поставка успешно принята!');
    } catch (err: any) {
      console.error("Error receiving shipment:", err);
      let errorMessage = "Ошибка при приеме поставки";

      if (err.response) {
        errorMessage += `: ${err.response.data?.detail || `Статус ${err.response.status}`}`;
      } else if (err.request) {
        errorMessage += ": Сервер не отвечает";
      } else {
        errorMessage += `: ${err.message}`;
      }

      alert(errorMessage);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Управление поставками</h2>
            <button
                onClick={() => setShowAddShipmentModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <TruckIcon className="h-5 w-5 mr-1" />
              Новая поставка
            </button>
          </div>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : filteredShipments.length === 0 ? (
            <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Поставки не найдены.</p>
              <button
                  onClick={() => setShowAddShipmentModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Добавить первую поставку
              </button>
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                    // Calculate total shipment amount
                    // Защита от undefined: проверяем, что shipment.items существует и является массивом
                    const items = Array.isArray(shipment.items) ? shipment.items : [];
                    const totalAmount = items.reduce((total, item) => {
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
                              {items.length} наим.
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {items.reduce((sum, item) => sum + item.quantity_ordered, 0)} шт.
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${shipment.status === 'PLANNED' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                          ${shipment.status === 'IN_TRANSIT' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                          ${shipment.status === 'RECEIVED' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                          ${shipment.status === 'PROCESSED' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}
                          ${shipment.status === 'CANCELLED' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                        `}>
                          {shipment.status === 'PLANNED' && 'Запланирована'}
                          {shipment.status === 'IN_TRANSIT' && 'В пути'}
                          {shipment.status === 'RECEIVED' && 'Получена'}
                          {shipment.status === 'PROCESSED' && 'Обработана'}
                          {shipment.status === 'CANCELLED' && 'Отменена'}
                        </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {(shipment.status === 'PLANNED' || shipment.status === 'IN_TRANSIT') ? (
                                  <button
                                      onClick={() => handleReceiveShipment(shipment.id)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    Принять
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => {
                                        // View shipment details
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
            </div>
        )}

        {/* Add Shipment Modal */}
        {showAddShipmentModal && (
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
                      Создание новой поставки
                    </h2>
                    <button onClick={() => setShowAddShipmentModal(false)} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Form content */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="supplier"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Поставщик <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="supplier"
                            value={newShipment.supplier_id || ''}
                            onChange={(e) => setNewShipment({...newShipment, supplier_id: Number(e.target.value)})}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          <option value="">Выберите поставщика</option>
                          {suppliers.filter(supplier => supplier.is_active).map(supplier => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                                {supplier.contact_person && ` (${supplier.contact_person})`}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="reference-number"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        <label htmlFor="shipment-date"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        <label htmlFor="expected-arrival-date"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        <label htmlFor="notes"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

                      {/* Add item to shipment form */}
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Селект для выбора товара */}
                          <div>
                            <label htmlFor="item-product"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Товар <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="item-product"
                                value={newShipmentItem.product_id || ''}
                                onChange={(e) => {
                                  const selectedId = e.target.value;
                                  // Преобразуем ID в число для поиска
                                  const productIdNumber = parseInt(selectedId, 10);

                                  // Строгая типизированная проверка
                                  const product = products.find(p => p.id === productIdNumber);

                                  if (product) {
                                    // Записываем и ID, и имя продукта
                                    setNewShipmentItem(prev => ({
                                      ...prev,
                                      product_id: selectedId,
                                      product_name: product.name,  // Сохраняем имя продукта
                                      unit_price: product.price || 0
                                    }));
                                    setSelectedProduct(product);
                                  } else {
                                    console.warn(`Товар с ID ${selectedId} не найден`);
                                    setNewShipmentItem(prev => ({
                                      ...prev,
                                      product_id: selectedId,
                                      product_name: `Товар ID: ${selectedId}`,
                                      unit_price: 0
                                    }));
                                    setSelectedProduct(null);
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            >
                              <option value="">Выберите товар</option>
                              {products.map(product => (
                                  <option key={product.id} value={String(product.id)}>
                                    {product.name} (ID: {product.id})
                                  </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="item-quantity"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Количество <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="item-quantity"
                                value={newShipmentItem.quantity_ordered || 0}
                                onChange={(e) => setNewShipmentItem({
                                  ...newShipmentItem,
                                  quantity_ordered: parseInt(e.target.value, 10) || 0
                                })}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                              bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                min="0"
                                step="1"
                            />
                          </div>

                          <div>
                            <label htmlFor="item-price"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label htmlFor="item-warehouse"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Склад <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                              <select
                                  id="item-warehouse"
                                  value={newShipmentItem.warehouse_id || ''}
                                  onChange={(e) => setNewShipmentItem({
                                    ...newShipmentItem,
                                    warehouse_id: e.target.value
                                  })}
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
                                <PlusIcon className="h-5 w-5"/>
                              </button>
                            </div>
                            <div className="flex justify-end mt-4 mb-2">
                              <button
                                  type="button"
                                  onClick={handleAddShipmentItem}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                              >
                                <PlusIcon className="h-5 w-5"/>
                                Добавить товар в список
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipment items table */}
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
                              {/* Таблица с добавленными товарами */}
                              <tbody
                                  className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {(newShipment.items || []).map((item, index) => {
                                // Находим данные о продукте по ID
                                const productId = typeof item.product_id === 'string' ? parseInt(item.product_id, 10) : item.product_id;
                                // Используем строгую проверку типов для поиска продукта
                                const product = products.find(p => p.id === productId);

                                // Находим данные о складе
                                const warehouse = warehouses.find(w => w.id === item.warehouse_id);

                                // Используем product_name из item, если оно есть, иначе из найденного продукта
                                const displayName = item.product_name || (product ? product.name : `Неизвестный товар (${item.product_id})`);

                                return (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {displayName}
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
                            <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2"/>
                            <p>Добавьте товары в поставку</p>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                      className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
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
                          disabled={isSubmitting || (newShipment.items || []).length === 0}
                          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md 
        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
        ${(newShipment.items || []).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={
                            isSubmitting ? 'Пожалуйста, подождите...' :
                                (newShipment.items || []).length === 0 ? 'Добавьте хотя бы один товар' :
                                    'Создать поставку'
                          }
                      >
                        {isSubmitting ? 'Создание...' : 'Создать поставку'}
                      </button>

                      {/* Добавить подсказку почему кнопка не активна */}
                      {(newShipment.items || []).length === 0 && (
                          <div className="text-xs text-red-500 mt-2">
                            * Для активации кнопки добавьте хотя бы один товар в поставку
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default SupplyManagement;