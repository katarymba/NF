// ais/ais-frontend/src/pages/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

const AnalyticsDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Массив цветов для графиков
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    // Функция загрузки данных
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении здесь был бы запрос к API
        // const response = await axios.get(`${API_BASE_URL}/api/analytics?range=${timeRange}`);
        // setSalesData(response.data.sales);
        // setProductData(response.data.products);
        
        // Тестовые данные
        const mockSalesData = generateMockSalesData(timeRange);
        const mockProductData = [
          { name: 'Лосось', value: 35 },
          { name: 'Форель', value: 25 },
          { name: 'Палтус', value: 20 },
          { name: 'Икра', value: 15 },
          { name: 'Треска', value: 5 }
        ];
        
        setSalesData(mockSalesData);
        setProductData(mockProductData);
        setError(null);
      } catch (err) {
        console.error("Ошибка при загрузке данных аналитики:", err);
        setError("Не удалось загрузить данные аналитики");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Функция для генерации тестовых данных
  const generateMockSalesData = (range) => {
    const data = [];
    let daysCount = 30;
    
    if (range === 'week') {
      daysCount = 7;
    } else if (range === 'year') {
      daysCount = 12; // Месяцы вместо дней
    }
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date();
      
      if (range === 'year') {
        date.setMonth(date.getMonth() - (daysCount - i - 1));
        data.push({
          name: date.toLocaleString('ru-RU', { month: 'short' }),
          Продажи: Math.floor(Math.random() * 500000) + 100000,
          Прибыль: Math.floor(Math.random() * 300000) + 50000
        });
      } else {
        date.setDate(date.getDate() - (daysCount - i - 1));
        data.push({
          name: date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit' }),
          Продажи: Math.floor(Math.random() * 50000) + 10000,
          Прибыль: Math.floor(Math.random() * 30000) + 5000
        });
      }
    }
    
    return data;
  };

  // Форматирование чисел для осей и тултипов
  const formatNumber = (number) => {
    return new Intl.NumberFormat('ru-RU').format(number);
  };

  // Форматирование для тултипа
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-lg rounded">
          <p className="font-bold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)} ₽
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Аналитика продаж</h1>
      
      {/* Переключатель периода времени */}
      <div className="mb-6">
        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-md">
          <button 
            className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setTimeRange('week')}
          >
            Неделя
          </button>
          <button 
            className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setTimeRange('month')}
          >
            Месяц
          </button>
          <button 
            className={`px-4 py-2 rounded ${timeRange === 'year' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setTimeRange('year')}
          >
            Год
          </button>
        </div>
      </div>
      
      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* График продаж */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Динамика продаж</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line type="monotone" dataKey="Продажи" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Прибыль" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* График товаров */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Распределение продаж по товарам</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Доля продаж']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Барчарт продаж */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Сравнение продаж и прибыли</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="Продажи" fill="#3b82f6" />
              <Bar dataKey="Прибыль" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Выручка за период</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(salesData.reduce((sum, item) => sum + item.Продажи, 0))} ₽</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Прибыль за период</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(salesData.reduce((sum, item) => sum + item.Прибыль, 0))} ₽</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Средний чек</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(Math.floor(salesData.reduce((sum, item) => sum + item.Продажи, 0) / (salesData.length * 5)))} ₽</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Средняя маржинальность</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.floor(salesData.reduce((sum, item) => sum + item.Прибыль, 0) / salesData.reduce((sum, item) => sum + item.Продажи, 0) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;