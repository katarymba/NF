import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getProducts, getCategories } from '../services/api';
import { runFullSync } from '../services/integration';
import { useLoading } from '../context/LoadingContext';
import '../styles/Products.css';

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
  const [loading, setLoading] = useState(false);
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

  // Используем контекст загрузки
  const { startLoading, stopLoading } = useLoading();

  // Загрузка товаров и категорий при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Запускаем анимацию загрузки без сообщения
        startLoading();
        setLoading(true);
        
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
        // Останавливаем анимацию загрузки
        stopLoading();
      }
    };

    fetchData();
  }, [token]);

  // Функция для перезагрузки списка товаров
  const fetchProducts = async () => {
    try {
      startLoading();
      setLoading(true);
      
      const productsData = await getProducts(filter || undefined);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
      stopLoading();
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
      startLoading();
      
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем список товаров после удаления
      await fetchProducts();
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      setError('Не удалось удалить товар. Пожалуйста, попробуйте позже.');
      stopLoading();
    }
  };

  // Обработчик отправки формы добавления/редактирования товара
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      startLoading();
      
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
      
      await fetchProducts();
    } catch (err) {
      console.error('Ошибка при сохранении товара:', err);
      setError('Не удалось сохранить товар. Пожалуйста, проверьте введенные данные.');
      stopLoading();
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

  // Функция для синхронизации с Север-Рыба
  const handleSyncWithSeverRyba = async () => {
    try {
      setIsSyncing(true);
      startLoading();
      
      await runFullSync();
      
      // После успешной синхронизации обновляем список товаров
      await fetchProducts();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      setErrorMessage('Не удалось синхронизировать данные с Север-Рыба');
    } finally {
      setIsSyncing(false);
      stopLoading();
    }
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
    <div className="products-container">
      {/* Заголовок и кнопки */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="products-title">Управление товарами</h1>
        
        <div className="products-actions">
          <button 
            onClick={handleSyncWithSeverRyba}
            className="btn btn-secondary"
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
            className="btn btn-success"
          >
            Добавить товар
          </button>
        </div>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">
            Поиск по названию или описанию
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите текст для поиска..."
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">
            Фильтр по категории
          </label>
          <select
            value={filter === null ? '' : filter}
            onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">
            Сортировка
          </label>
          <div className="flex">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
              style={{ borderRadius: '6px 0 0 6px' }}
            >
              <option value="name">По названию</option>
              <option value="price">По цене</option>
              <option value="stock">По количеству</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="sort-direction-btn"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Уведомления */}
      {error && (
        <div className="notification notification-error">
          <p>{error}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="notification notification-error">
          <p>{errorMessage}</p>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="notification-close"
          >
            ×
          </button>
        </div>
      )}
      
      {showSuccessMessage && (
        <div className="fixed-notification notification-success">
          <p>Данные успешно синхронизированы с Север-Рыба</p>
        </div>
      )}
      
      {/* Таблица продуктов */}
      {loading && products.length === 0 ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-message">Нет товаров для отображения</p>
        </div>
      ) : (
        <div className="products-table-container">
          <div className="overflow-x-auto">
            <table className="products-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Название {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Категория</th>
                  <th onClick={() => handleSort('price')}>
                    Цена {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        {product.image_url && (
                          <img 
                            className="product-image" 
                            src={product.image_url} 
                            alt={product.name} 
                          />
                        )}
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryName(product.category_id)}</td>
                    <td>{product.price.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <button
                        onClick={() => openEditModal(product)}
                        className="table-action-btn"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="table-action-btn delete"
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Редактирование товара' : 'Добавление нового товара'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Название
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Описание
                  </label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Категория
                  </label>
                  <select
                    required
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({...newProduct, category_id: Number(e.target.value)})}
                    className="form-control"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Цена (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    URL изображения
                  </label>
                  <input
                    type="text"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="btn btn-outline"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;