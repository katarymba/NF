import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';

// Типы данных
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  weight: string | null;
  category_id: number;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  setSelectedCategory: (categoryId: string) => void;
  fetchProducts: () => Promise<void>;
  fetchProductsByCategory: (categorySlug: string) => Promise<void>;
  fetchProductById: (productId: number) => Promise<Product | null>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      await fetchProducts();
    };
    init();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_ENDPOINTS.PRODUCTS);
      setProducts(res.data);
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.CATEGORIES);
      setCategories(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const fetchProductsByCategory = async (categorySlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categorySlug));
      setProducts(res.data);
    } catch (err) {
      setError('Ошибка при загрузке товаров категории');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductById = async (productId: number): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      return res.data;
    } catch (err) {
      setError('Ошибка при загрузке товара');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      selectedCategory,
      isLoading,
      error,
      setSelectedCategory,
      fetchProducts,
      fetchProductsByCategory,
      fetchProductById,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};