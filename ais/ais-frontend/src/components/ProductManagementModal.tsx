import React, { useState, useEffect } from 'react';
import './ProductManagementModal.css';

// Интерфейсы
interface Category {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  is_new?: boolean;
  is_bestseller?: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSave: (product: Product) => Promise<void>;
  isNew?: boolean;
}

const ProductManagementModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
  isNew = false
}) => {
  // Состояние формы
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: categories.length > 0 ? categories[0].id : 0,
    is_new: false,
    is_bestseller: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация формы при открытии
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
        is_new: false,
        is_bestseller: false
      });
    }
    setError(null);
  }, [product, categories, isOpen]);
  
  // Обработка темной темы для полей ввода
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const formInputs = document.querySelectorAll('.product-form-input');
    
    formInputs.forEach(input => {
      const element = input as HTMLElement;
      
      if (isDarkMode) {
        const darkProps = element.dataset.darkThemeProps;
        if (darkProps) {
          // Применяем стили темной темы
          darkProps.split(';').forEach(prop => {
            if (!prop.trim()) return;
            const [key, value] = prop.split(':');
            element.style.setProperty(key.trim(), value.trim());
          });
        }
      } else {
        // Сбрасываем к светлой теме
        element.style.backgroundColor = 'white';
        element.style.color = 'black';
      }
    });
  }, [isOpen]); // Перезапускаем при открытии окна

  // Обработчики изменения полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Обработка чекбоксов
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    }
    // Преобразование числовых значений
    else if (name === 'price' || name === 'stock_quantity' || name === 'category_id') {
      setFormData({
        ...formData,
        [name]: name === 'category_id' ? parseInt(value) : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full">
        <div className="p-6 modal-content">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isNew ? 'Добавить новый товар' : 'Редактировать товар'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 product-form-input"
                style={{ 
                  backgroundColor: 'white', 
                  color: 'black' 
                }}
                data-dark-theme-props="background-color: #374151; color: white;"
                style={{color: 'inherit'}}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Цена (₽) *
                </label>
                                  <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white product-form-input"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Количество на складе *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Категория *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Метки товара
              </label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_new"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_new" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Новинка
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_bestseller"
                    name="is_bestseller"
                    checked={formData.is_bestseller}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_bestseller" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Хит продаж
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : isNew ? 'Добавить товар' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementModal;