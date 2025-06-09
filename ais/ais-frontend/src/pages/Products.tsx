import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../services/api";
import { runFullSync } from '../services/integration';
import { useLoading } from '../context/LoadingContext';
import '../styles/Products.css';
import { getProducts, getCategories } from '../services/api';

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
  token?: string;
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
  const [successMessage, setSuccessMessage] = useState<string>('Операция выполнена успешно');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Используем контекст загрузки
  const { startLoading, stopLoading } = useLoading();

  // Функция для получения базового URL API
  const getApiBaseUrl = () => {
    return 'http://localhost:8080/api';
  };

// Функция для загрузки категорий
  const fetchCategories = async () => {
    try {
      console.log("Запрос категорий - начало");

      // Сначала попробуем получить категории из списка продуктов, так как этот эндпоинт работает
      const productsEndpoint = `${getApiBaseUrl()}/products`;

      try {
        console.log(`Получаем категории из списка продуктов: ${productsEndpoint}`);
        const authToken = token || localStorage.getItem('token');
        const response = await axios.get(productsEndpoint, {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : undefined
          }
        });

        if (response.data && Array.isArray(response.data)) {
          console.log(`Успешно получены данные продуктов, извлекаем категории`);
          const products = response.data;

          // Создаем карту для отслеживания уже добавленных категорий
          const categoryMap = new Map();

          // Обходим все продукты и собираем встречающиеся категории
          products.forEach(product => {
            if (product && product.category_id !== undefined && product.category_id !== null) {
              // Если эта категория еще не добавлена в карту
              if (!categoryMap.has(product.category_id)) {
                let categoryName = "Неизвестная категория";

                // Проверяем различные поля, которые могут содержать имя категории
                if (product.category_name) {
                  categoryName = product.category_name;
                } else if (product.category && product.category.name) {
                  categoryName = product.category.name;
                } else {
                  // Проверим, есть ли у других продуктов в этой категории имя категории
                  const otherProductWithSameCategory = products.find(p =>
                      p.category_id === product.category_id &&
                      (p.category_name || (p.category && p.category.name))
                  );

                  if (otherProductWithSameCategory) {
                    categoryName = otherProductWithSameCategory.category_name ||
                        (otherProductWithSameCategory.category && otherProductWithSameCategory.category.name) ||
                        `Категория ${product.category_id}`;
                  } else {
                    categoryName = `Категория ${product.category_id}`;
                  }
                }

                // Добавляем категорию в карту
                categoryMap.set(product.category_id, {
                  id: product.category_id,
                  name: categoryName,
                  description: ''
                });
              }
            }
          });

          // Преобразуем карту в массив
          const extractedCategories = Array.from(categoryMap.values());

          if (extractedCategories.length > 0) {
            console.log(`Успешно извлечено ${extractedCategories.length} категорий из продуктов`);
            setCategories(extractedCategories);
            return extractedCategories;
          }
        }
      } catch (err) {
        console.error('Ошибка при извлечении категорий из продуктов:', err);
      }

      // Если не удалось получить категории из продуктов, пробуем еще несколько URL напрямую
      const directEndpoints = [
        `${getApiBaseUrl()}/categories`,
        "http://localhost:8080/ais/api/categories",
        "http://localhost:8080/categories"
      ];

      for (const endpoint of directEndpoints) {
        try {
          console.log(`Пробуем прямой запрос к: ${endpoint}`);
          const authToken = token || localStorage.getItem('token');
          const response = await axios.get(endpoint, {
            headers: {
              Authorization: authToken ? `Bearer ${authToken}` : undefined
            }
          });

          console.log(`Успешно получен ответ от ${endpoint}`);

          // Получаем данные
          let data = response.data;
          let categoriesData = [];

          // Обрабатываем различные форматы ответа API
          if (Array.isArray(data)) {
            categoriesData = data;
          } else if (data.categories && Array.isArray(data.categories)) {
            categoriesData = data.categories;
          } else if (data.data && Array.isArray(data.data)) {
            categoriesData = data.data;
          } else if (data.results && Array.isArray(data.results)) {
            categoriesData = data.results;
          }

          // Фильтруем и проверяем обязательные поля
          const validCategories = categoriesData.filter(item =>
              item && typeof item === 'object' &&
              item.hasOwnProperty('id') &&
              item.hasOwnProperty('name')
          );

          if (validCategories.length > 0) {
            console.log(`Успешно загружено ${validCategories.length} категорий из ${endpoint}`);
            setCategories(validCategories);
            return validCategories;
          }
        } catch (err) {
          console.log(`Ошибка при прямом запросе к ${endpoint}:`, err);
        }
      }

      // Если все запросы не удались, используем предустановленные категории
      console.log('Все запросы на получение категорий не удались, используем предустановленные категории');
      const defaultCategories = [
        { id: 1, name: 'Свежая рыба', description: 'Свежая рыба и морепродукты' },
        { id: 2, name: 'Замороженная рыба', description: 'Замороженная рыба и морепродукты' },
        { id: 3, name: 'Икра', description: 'Икра различных видов рыб' },
        { id: 4, name: 'Консервы', description: 'Рыбные консервы и пресервы' },
        { id: 5, name: 'Морепродукты', description: 'Различные морепродукты' }
      ];

      setCategories(defaultCategories);
      return defaultCategories;

    } catch (error) {
      console.error('Критическая ошибка при загрузке категорий:', error);

      // В случае критической ошибки, возвращаем базовые категории
      const fallbackCategories = [
        { id: 1, name: 'Категория 1', description: '' },
        { id: 2, name: 'Категория 2', description: '' }
      ];

      setCategories(fallbackCategories);
      return fallbackCategories;
    }
  };
  useEffect(() => {
    // Модифицируем функцию fetchData
    const fetchData = async () => {
      try {
        startLoading();
        setLoading(true);
        setError(null);

        console.log("Начало загрузки данных для Products.tsx");

        try {
          // Сначала загружаем категории
          const categoriesData = await fetchCategories();

          // Затем загружаем товары с учетом фильтра
          const productsData = await getProducts(filter || undefined);

          // Проверка что полученные данные являются массивами
          const productsArray = Array.isArray(productsData) ? productsData : [];

          setProducts(productsArray);
          console.log(`Успешно загружено ${productsArray.length} продуктов`);
        } catch (err) {
          console.error('Ошибка при загрузке данных:', err);
          // Установим пустые массивы в случае ошибки, чтобы избежать ошибки filter is not a function
          setProducts([]);
          setError('Не удалось загрузить данные товаров или категорий. Пожалуйста, убедитесь, что API доступен.');
        }

      } catch (err) {
        console.error('Критическая ошибка при загрузке данных:', err);
        setProducts([]);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже или обратитесь к администратору.');
      } finally {
        setLoading(false);
        stopLoading();
      }
    };

    fetchData();
  }, [filter]); // Добавим filter в зависимости для обновления при изменении фильтра


  // Функция для перезагрузки списка товаров
  const fetchProducts = async () => {
    try {
      startLoading();
      setLoading(true);

      const productsData = await getProducts(filter || undefined);
      // Проверка что полученные данные являются массивом
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setProducts([]);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Обработчик изменения фильтра по категории
  const handleFilterChange = (categoryId: number | null) => {
    setFilter(categoryId);
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

  // Обработчик удаления товара - расширенная версия с несколькими попытками
  const handleDelete = async (productId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      startLoading();
      
      // Получаем URL, который успешно работает для GET запросов товаров
      // Для этого вызовем метод getProducts и проанализируем его
      let workingApiBaseUrl = '';
      
      try {
        // Вызываем импортированную функцию getProducts и анализируем, какой URL она использует
        console.log("Определяем рабочий URL API...");
        
        // Пробуем несколько возможных URL для DELETE запроса
        const possibleUrls = [
          'http://localhost:8080/api/products',
          'http://localhost:8080/ais/api/products',
          API_BASE_URL + '/products'
        ];
        
        for (const url of possibleUrls) {
          try {
            console.log(`Проверка URL: ${url}`);
            const authToken = token || localStorage.getItem('token');
            const testResponse = await axios.get(`${url}`, {
              headers: { Authorization: authToken ? `Bearer ${authToken}` : undefined }
            });
            if (testResponse.status === 200) {
              workingApiBaseUrl = url;
              console.log(`Обнаружен рабочий URL API: ${workingApiBaseUrl}`);
              break;
            }
          } catch (e) {
            console.log(`URL ${url} не работает`);
          }
        }
      } catch (e) {
        console.error("Не удалось определить рабочий URL:", e);
        workingApiBaseUrl = 'http://localhost:8080/api/products'; // Используем URL из маршрутов бэкенда
      }
      
      // Используем обнаруженный рабочий URL
      const apiUrl = `${workingApiBaseUrl}/${productId}`;
      console.log(`Отправка запроса DELETE на: ${apiUrl}`);

      const authToken = token || localStorage.getItem('token');
      const response = await axios.delete(apiUrl, {
        headers: { 
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Ответ при удалении:', response.data);

      // Обновляем список товаров после удаления
      await fetchProducts();
      
      // Показываем сообщение об успешном удалении
      setSuccessMessage('Товар успешно удален');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('Ошибка при удалении товара:', err);
      
      // Подробный вывод ошибки с информацией из бэкенда
      const errorMsg = err.response 
        ? `Ошибка ${err.response.status}: ${err.response.data?.detail || err.response.statusText}` 
        : 'Не удалось удалить товар. Пожалуйста, попробуйте позже.';
        
      setError(errorMsg);
    } finally {
      stopLoading();
    }
  };

  // Обработчик отправки формы добавления/редактирования товара
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      startLoading();

      const authToken = token || localStorage.getItem('token');
      
      // Используем URL без /ais, согласно маршрутам бэкенда
      const baseApiUrl = 'http://localhost:8080/api/products';

      // Добавим логирование для отладки
      console.log('Сохраняем товар:', newProduct);
      console.log('URL для запроса:', baseApiUrl + (editingProduct ? `/${editingProduct.id}` : ''));

      if (editingProduct) {
        // Редактирование существующего товара
        const response = await axios.put(
          `${baseApiUrl}/${editingProduct.id}`,
          newProduct,
          { 
            headers: {
              'Content-Type': 'application/json',
              Authorization: authToken ? `Bearer ${authToken}` : undefined
            }
          }
        );
        
        console.log('Ответ сервера при редактировании:', response.data);
        setSuccessMessage('Товар успешно обновлен');
      } else {
        // Добавление нового товара
        const response = await axios.post(
          baseApiUrl,
          newProduct,
          { 
            headers: {
              'Content-Type': 'application/json',
              Authorization: authToken ? `Bearer ${authToken}` : undefined
            }
          }
        );
        
        console.log('Ответ сервера при добавлении:', response.data);
        setSuccessMessage('Новый товар успешно добавлен');
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
      
      // Показываем уведомление об успешном сохранении
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('Ошибка при сохранении товара:', err);
      
      // Подробная информация об ошибке
      const errorMsg = err.response 
        ? `Ошибка ${err.response.status}: ${err.response.data?.detail || err.response.statusText}` 
        : 'Не удалось сохранить товар. Пожалуйста, проверьте введенные данные.';
        
      setError(errorMsg);
    } finally {
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

      // Получаем токен из пропсов или из localStorage
      const authToken = token || localStorage.getItem('token');

      // Передаем токен в функцию runFullSync
      await runFullSync(authToken || '');

      // После успешной синхронизации обновляем список товаров
      await fetchProducts();
      // Обновляем также список категорий
      await fetchCategories();

      setSuccessMessage('Данные успешно синхронизированы с Север-Рыба');
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
            !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
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
              <button
                onClick={() => setError(null)}
                className="notification-close"
              >
                ×
              </button>
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
              <p>{successMessage}</p>
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
                    <th onClick={() => handleSort('stock')}>
                      Количество {sortBy === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                              <div className="product-description">{product.description || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>{getCategoryName(product.category_id)}</td>
                        <td>{product.price.toLocaleString('ru-RU')} ₽</td>
                        <td>{product.stock_quantity}</td>
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
                      <label className="form-label form-label-required">
                        Количество
                      </label>
                      <input
                          type="number"
                          min="0"
                          required
                          value={newProduct.stock_quantity}
                          onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value, 10)})}
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