// ais/ais-frontend/src/pages/Products.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getProducts, getCategories } from '../services/api';
import { runFullSync } from '../services/integration';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock_quantity: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductsProps {
  token: string;
}

const Products: React.FC<ProductsProps> = ({ token }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock_quantity: 0,
    image_url: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Загрузка товаров и категорий при монтировании
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Функция для перезагрузки списка товаров
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts(filter || undefined);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения фильтра по категории
  const handleFilterChange = (categoryId: number | null) => {
    setFilter(categoryId);
    fetchProducts();
  };

  // Функция получения имени категории по ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Без категории';
  };

  // Сортировка товаров
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Обработчик удаления товара
  const handleDelete = async (productId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем список товаров после удаления
      fetchProducts();
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      setError('Не удалось удалить товар. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработчик отправки формы добавления/редактирования товара
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Редактирование существующего товара
        await axios.put(
          `${API_BASE_URL}/api/products/${editingProduct.id}`,
          newProduct,
          { headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            } 
          }
        );
      } else {
        // Добавление нового товара
        await axios.post(
          `${API_BASE_URL}/api/products`,
          newProduct,
          { headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            } 
          }
        );
      }
      
      // Закрываем модальное окно и обновляем список товаров
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category_id: 0,
        stock_quantity: 0,
        image_url: ''
      });
      fetchProducts();
    } catch (err) {
      console.error('Ошибка при сохранении товара:', err);
      setError('Не удалось сохранить товар. Пожалуйста, проверьте введенные данные.');
    }
  };

  // Открытие модального окна для редактирования товара
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || ''
    });
    setShowAddModal(true);
  };

  // Фильтрация товаров по поисковому запросу и категории
  const filteredProducts = products
    .filter(product => {
      // Фильтрация по поисковому запросу
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Фильтрация по категории
      if (filter !== null && product.category_id !== filter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Сортировка по выбранному полю
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortDirection === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortBy === 'stock') {
        return sortDirection === 'asc' 
          ? a.stock_quantity - b.stock_quantity 
          : b.stock_quantity - a.stock_quantity;
      }
      return 0;
    });

  return (
    <div className="container mx-auto p-4">
      {/* Заголовок и кнопки */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Управление товарами</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={async () => {
              try {
                setIsSyncing(true);
                await runFullSync();
                // После успешной синхронизации обновляем список товаров
                fetchProducts();
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
              } catch (error) {
                console.error('Ошибка синхронизации:', error);
                setErrorMessage('Не удалось синхронизировать данные с Север-Рыба');
              } finally {
                setIsSyncing(false);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
            disabled={isSyncing}
          >
            {isSyncing ? 'Синхронизация...' : 'Синхронизировать с Север-Рыба'}
          </button>
          
          <button 
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({
                name: '',
                description: '',
                price: 0,
                category_id: categories.length > 0 ? categories[0].id : 0,
                stock_quantity: 0,
                image_url: ''
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Добавить товар
          </button>
        </div>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="flex flex-wrap mb-4 gap-4">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Поиск по названию или описанию
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите текст для поиска..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Фильтр по категории
          </label>
          <select
            value={filter === null ? '' : filter}
            onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Сортировка
          </label>
          <div className="flex">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name">По названию</option>
              <option value="price">По цене</option>
              <option value="stock">По количеству</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Уведомления */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <p>{errorMessage}</p>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <p>Данные успешно синхронизированы с Север-Рыба</p>
        </div>
      )}
      
      {/* Таблица товаров */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Нет товаров для отображения</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Название {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Категория
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    Цена {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stock')}
                  >
                    На складе {sortBy === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img 
                            className="h-10 w-10 rounded-full mr-3 object-cover" 
                            src={product.image_url} 
                            alt={product.name} 
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getCategoryName(product.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock_quantity > 10 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : product.stock_quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.stock_quantity} шт.
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Модальное окно добавления/редактирования товара */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingProduct ? 'Редактирование товара' : 'Добавление нового товара'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Название */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Название *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Описание */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Описание
                    </label>
                    <textarea
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Категория */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Категория *
                    </label>
                    <select
                      required
                      value={newProduct.category_id}
                      onChange={(e) => setNewProduct({...newProduct, category_id: Number(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Цена */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Цена (₽) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Количество на складе */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Количество на складе *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* URL изображения */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      URL изображения
                    </label>
                    <input
                      type="text"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;