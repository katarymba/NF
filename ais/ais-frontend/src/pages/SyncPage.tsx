// ais/ais-frontend/src/pages/SyncPage.tsx
import React, { useState, useEffect } from 'react';

interface SyncTask {
  id: string;
  name: string;
  description: string;
  lastSync: string | null;
  status: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  error?: string;
}

interface SyncSettings {
  automaticSync: boolean;
  syncInterval: string;
  notifyOnComplete: boolean;
  syncErrors: boolean;
}

const SyncPage: React.FC = () => {
  // Данные о задачах синхронизации
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([
    {
      id: 'products',
      name: 'Синхронизация товаров',
      description: 'Обновление товаров из каталога в клиентском приложении',
      lastSync: '2025-04-02T14:30:00Z',
      status: 'idle'
    },
    {
      id: 'orders',
      name: 'Синхронизация заказов',
      description: 'Получение и обновление статусов заказов из клиентского приложения',
      lastSync: '2025-04-03T09:15:00Z',
      status: 'idle'
    },
    {
      id: 'customers',
      name: 'Синхронизация клиентов',
      description: 'Обновление базы данных клиентов',
      lastSync: '2025-04-01T16:45:00Z',
      status: 'idle'
    },
    {
      id: 'prices',
      name: 'Синхронизация цен',
      description: 'Обновление цен на товары в клиентском приложении',
      lastSync: '2025-04-02T18:20:00Z',
      status: 'idle'
    }
  ]);

  // Настройки синхронизации
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    automaticSync: true,
    syncInterval: '24',
    notifyOnComplete: true,
    syncErrors: true
  });

  // Лог синхронизации
  const [syncLogs, setSyncLogs] = useState<{timestamp: string, message: string, type: 'info' | 'success' | 'error'}[]>([
    {
      timestamp: '2025-04-03T09:15:00Z',
      message: 'Успешная синхронизация: заказы обновлены',
      type: 'success'
    },
    {
      timestamp: '2025-04-02T18:20:00Z',
      message: 'Успешная синхронизация: цены обновлены',
      type: 'success'
    },
    {
      timestamp: '2025-04-02T14:30:00Z',
      message: 'Успешная синхронизация: товары обновлены',
      type: 'success'
    },
    {
      timestamp: '2025-04-01T16:45:00Z',
      message: 'Успешная синхронизация: клиенты обновлены',
      type: 'success'
    }
  ]);

  // Состояние соединения с API
  const [apiStatus, setApiStatus] = useState<{
    gateway: 'online' | 'offline';
    client: 'online' | 'offline';
    db: 'online' | 'offline';
  }>({
    gateway: 'online',
    client: 'online',
    db: 'online'
  });

  // Добавление записи в лог
  const addLogEntry = (message: string, type: 'info' | 'success' | 'error') => {
    setSyncLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        message,
        type
      },
      ...prev
    ].slice(0, 100)); // Ограничиваем лог 100 записями
  };

  // Форматирование даты
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Никогда';
    
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение класса статуса
  const getStatusClass = (status: SyncTask['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  // Получение текста статуса
  const getStatusText = (status: SyncTask['status']) => {
    switch (status) {
      case 'idle':
        return 'Ожидает';
      case 'running':
        return 'В процессе';
      case 'success':
        return 'Успешно';
      case 'error':
        return 'Ошибка';
    }
  };

  // Запуск синхронизации для конкретной задачи
  const startSync = async (taskId: string) => {
    // Обновляем статус задачи
    setSyncTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'running', progress: 0 }
          : task
      )
    );

    // Добавляем запись в лог
    const task = syncTasks.find(t => t.id === taskId);
    if (task) {
      addLogEntry(`Начата синхронизация: ${task.name}`, 'info');
    }

    // В реальной реализации здесь был бы запрос к API
    // Для демонстрации используем имитацию процесса
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        setSyncTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'running', progress }
              : task
          )
        );
      } else {
        clearInterval(interval);
        
        // 10% шанс ошибки для демонстрации
        const hasError = Math.random() < 0.1;
        const currentTask = syncTasks.find(t => t.id === taskId);
        
        if (currentTask) {
          setSyncTasks(prev => {
            const updatedTasks = prev.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    status: hasError ? 'error' : 'success', 
                    lastSync: hasError ? task.lastSync : new Date().toISOString(),
                    progress: hasError ? 80 : 100,
                    error: hasError ? 'Ошибка соединения с сервером' : undefined
                  }
                : task
            );
            
            // Добавляем запись в лог
            if (hasError) {
              addLogEntry(`Ошибка синхронизации: ${currentTask.name} - Ошибка соединения с сервером`, 'error');
            } else {
              addLogEntry(`Успешная синхронизация: ${currentTask.name}`, 'success');
            }
            
            return updatedTasks;
          });
        }
      }
    }, 500);
  };

  // Запуск всех задач синхронизации
  const startAllSync = () => {
    syncTasks.forEach(task => {
      if (task.status !== 'running') {
        setTimeout(() => {
          startSync(task.id);
        }, Math.random() * 1000); // Случайная задержка для визуального эффекта
      }
    });
    
    // Добавляем запись в лог
    addLogEntry('Запущена полная синхронизация всех компонентов', 'info');
  };

  // Сброс задачи в исходное состояние
  const resetTask = (taskId: string) => {
    setSyncTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'idle', progress: undefined, error: undefined }
          : task
      )
    );
    const task = syncTasks.find(t => t.id === taskId);
    if (task) {
      addLogEntry(`Задача сброшена: ${task.name}`, 'info');
    }
  };

  // Сохранение настроек синхронизации
  const saveSettings = () => {
    // В реальном приложении здесь был бы запрос к API для сохранения настроек
    // Имитация запроса с задержкой
    setTimeout(() => {
      addLogEntry('Настройки синхронизации сохранены', 'success');
    }, 500);
  };

  // Обработчик изменения настроек (чекбоксы и селекты)
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSyncSettings({
      ...syncSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  useEffect(() => {
    // Здесь можно реализовать проверку состояния API
    const checkApiStatus = async () => {
      try {
        // В реальной реализации здесь будет запрос к API Gateway
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setApiStatus({
            gateway: data.services?.gateway?.status === 'up' ? 'online' : 'offline',
            client: data.services?.client?.status === 'up' ? 'online' : 'offline',
            db: data.services?.db?.status === 'up' ? 'online' : 'offline'
          });
        } else {
          // Если запрос не удался, устанавливаем все в онлайн для демонстрации
          setApiStatus({
            gateway: 'online',
            client: 'online',
            db: 'online'
          });
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса API:', error);
        // Для демонстрации оставляем все сервисы онлайн
      }
    };
    
    checkApiStatus();
    
    // Проверка статуса каждые 30 секунд
    const intervalId = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Синхронизация данных</h1>
      
      {/* Остальное содержимое компонента */}
      {/* Статус API */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        {/* Содержимое блока статуса систем */}
      </div>
      
      {/* Задачи синхронизации */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        {/* Содержимое блока задач синхронизации */}
      </div>
      
      {/* Настройки синхронизации */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        {/* Содержимое блока настроек */}
      </div>
      
      {/* Лог синхронизации */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* Содержимое блока логов */}
      </div>
    </div>
  );
};

export default SyncPage;