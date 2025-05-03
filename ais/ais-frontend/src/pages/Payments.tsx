import React, { useState, useEffect } from 'react';
import '../styles/Payments.css';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  full_name: string;
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
  amount?: number;
  user_id?: number;
  user?: User;
}

interface PaymentFilters {
  paymentMethod: string;
  paymentStatus: string;
  searchText: string;
}

// Функция для форматирования даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString.replace(' ', 'T'));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

// Функция для генерации ID транзакции
const generateTransactionId = (): string => {
  const now = new Date();
  const date = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN${date}${randomNum}`;
};

// Основной компонент страницы платежей
const Payments: React.FC = () => {
  // Состояния
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    paymentMethod: '',
    paymentStatus: '',
    searchText: '',
  });
  const [stats, setStats] = useState({
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    processingPayments: 0,
    totalAmount: 0,
  });
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    payment_method: 'online_card',
    payment_status: 'pending',
    transaction_id: generateTransactionId(),
    created_at: new Date().toISOString().substring(0, 16)
  });
  const [currentTab, setCurrentTab] = useState('all');

  // Тестовые данные пользователей на основе предоставленной таблицы
  const fetchTestUsers = () => {
    return [
      { id: 1, username: 'premium_client1', email: 'premium1@example.ru', phone: '79111111111', full_name: 'Александр Морской' },
      { id: 2, username: 'premium_client2', email: 'premium2@example.com', phone: '79111111112', full_name: 'Екатерина Великая' },
      { id: 3, username: 'premium_client3', email: 'premium3@example.ru', phone: '79111111113', full_name: 'Дмитрий Осетров' },
      { id: 4, username: 'premium_client4', email: 'premium4@example.ru', phone: '79111111114', full_name: 'Анна Карпова' },
      { id: 5, username: 'premium_client5', email: 'premium5@example.com', phone: '79111111115', full_name: 'Сергей Щучкин' },
      { id: 6, username: 'premium_client6', email: 'premium6@example.ru', phone: '79111111116', full_name: 'Мария Сазанова' },
      { id: 7, username: 'premium_client7', email: 'premium7@example.com', phone: '79111111117', full_name: 'Игорь Форелев' },
      { id: 8, username: 'premium_client8', email: 'premium8@example.ru', phone: '79111111118', full_name: 'Наталья Сёмгина' },
      { id: 9, username: 'premium_client9', email: 'premium9@example.com', phone: '79111111119', full_name: 'Антон Лещов' },
      { id: 10, username: 'premium_client10', email: 'premium10@example.ru', phone: '79111111120', full_name: 'Елена Палтусова' },
      { id: 11, username: 'premium_client11', email: 'premium11@example.com', phone: '79111111121', full_name: 'Павел Белуга' },
      { id: 12, username: 'premium_client12', email: 'premium12@example.ru', phone: '79111111122', full_name: 'Светлана Минтаева' },
      { id: 13, username: 'premium_client13', email: 'premium13@example.com', phone: '79111111123', full_name: 'Олег Тунцов' },
    ];
  };

  // Данные для тестирования - в реальном приложении их нужно заменить на данные API
  const fetchTestData = () => {
    const testUsers = fetchTestUsers();
    setUsers(testUsers);
    
    // Генерируем тестовую сумму для каждого платежа
    const getRandomAmount = () => Math.floor(Math.random() * 9000 + 1000) + Math.random();
    
    const testPayments: Payment[] = [
      { id: 1, order_id: 1, payment_method: 'online_card', payment_status: 'completed', transaction_id: 'TXN202505030001', created_at: '2025-05-03 10:35:00', amount: getRandomAmount(), user_id: 1, user: testUsers[0] },
      { id: 2, order_id: 2, payment_method: 'sbp', payment_status: 'pending', transaction_id: 'TXN202505030002', created_at: '2025-05-03 11:50:00', amount: getRandomAmount(), user_id: 2, user: testUsers[1] },
      { id: 3, order_id: 3, payment_method: 'cash_on_delivery', payment_status: 'completed', transaction_id: 'TXN202505030003', created_at: '2025-05-03 12:55:00', amount: getRandomAmount(), user_id: 3, user: testUsers[2] },
      { id: 4, order_id: 4, payment_method: 'online_wallet', payment_status: 'completed', transaction_id: 'TXN202505030004', created_at: '2025-05-03 13:35:00', amount: getRandomAmount(), user_id: 4, user: testUsers[3] },
      { id: 5, order_id: 5, payment_method: 'credit_card', payment_status: 'pending', transaction_id: 'TXN202505030005', created_at: '2025-05-03 14:20:00', amount: getRandomAmount(), user_id: 5, user: testUsers[4] },
      { id: 6, order_id: 6, payment_method: 'bank_transfer', payment_status: 'processing', transaction_id: 'TXN202505030006', created_at: '2025-05-03 10:35:00', amount: getRandomAmount(), user_id: 6, user: testUsers[5] },
      { id: 7, order_id: 7, payment_method: 'sbp', payment_status: 'completed', transaction_id: 'TXN202505030007', created_at: '2025-05-03 11:50:00', amount: getRandomAmount(), user_id: 7, user: testUsers[6] },
      { id: 8, order_id: 8, payment_method: 'online_card', payment_status: 'completed', transaction_id: 'TXN202505030008', created_at: '2025-05-03 12:05:00', amount: getRandomAmount(), user_id: 8, user: testUsers[7] },
      { id: 9, order_id: 9, payment_method: 'cash_on_delivery', payment_status: 'pending', transaction_id: 'TXN202505030009', created_at: '2025-05-03 13:20:00', amount: getRandomAmount(), user_id: 9, user: testUsers[8] },
      { id: 10, order_id: 10, payment_method: 'bank_transfer', payment_status: 'processing', transaction_id: 'TXN202505030010', created_at: '2025-05-03 14:35:00', amount: getRandomAmount(), user_id: 10, user: testUsers[9] },
      { id: 11, order_id: 11, payment_method: 'online_wallet', payment_status: 'completed', transaction_id: 'TXN202505030011', created_at: '2025-05-03 10:50:00', amount: getRandomAmount(), user_id: 11, user: testUsers[10] },
      { id: 12, order_id: 12, payment_method: 'credit_card', payment_status: 'completed', transaction_id: 'TXN202505030012', created_at: '2025-05-03 11:05:00', amount: getRandomAmount(), user_id: 12, user: testUsers[11] },
      { id: 13, order_id: 13, payment_method: 'sbp', payment_status: 'pending', transaction_id: 'TXN202505030013', created_at: '2025-05-03 12:20:00', amount: getRandomAmount(), user_id: 13, user: testUsers[12] },
      { id: 14, order_id: 14, payment_method: 'online_card', payment_status: 'processing', transaction_id: 'TXN202505030014', created_at: '2025-05-03 13:35:00', amount: getRandomAmount(), user_id: 1, user: testUsers[0] },
      { id: 15, order_id: 15, payment_method: 'cash_on_delivery', payment_status: 'completed', transaction_id: 'TXN202505030015', created_at: '2025-05-03 14:50:00', amount: getRandomAmount(), user_id: 2, user: testUsers[1] },
    ];

    setPayments(testPayments);
    calculateStats(testPayments);
    setLoading(false);
  };

  // Получение данных платежей
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await fetch('/api/payments');
      // const data = await response.json();
      // setPayments(data);
      // calculateStats(data);
      
      // Для демонстрации используем тестовые данные
      setTimeout(fetchTestData, 500);
    } catch (error) {
      console.error('Ошибка при загрузке платежей:', error);
      setLoading(false);
    }
  };

  // Рассчет статистики платежей
  const calculateStats = (paymentsData: Payment[]) => {
    const completed = paymentsData.filter(p => p.payment_status === 'completed');
    const pending = paymentsData.filter(p => p.payment_status === 'pending');
    const processing = paymentsData.filter(p => p.payment_status === 'processing');
    
    setStats({
      totalPayments: paymentsData.length,
      completedPayments: completed.length,
      pendingPayments: pending.length,
      processingPayments: processing.length,
      totalAmount: paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    });
  };

  // Хуки эффектов
  useEffect(() => {
    fetchPayments();
  }, []);

  // Обработка создания/обновления платежа
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        // Обновление существующего платежа
        // await fetch(`/api/payments/${editingPayment.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(editingPayment),
        // });
        
        // Демонстрационная логика
        setPayments(prev => prev.map(p => 
          p.id === editingPayment.id ? { ...p, ...editingPayment } : p
        ));
      } else {
        // Создание нового платежа
        // await fetch('/api/payments', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(newPayment),
        // });
        
        // Находим пользователя по ID
        const user_id = parseInt(newPayment.user_id as unknown as string);
        const user = users.find(u => u.id === user_id);
        
        // Демонстрационная логика
        const createdPayment: Payment = {
          id: Math.max(...payments.map(p => p.id), 0) + 1,
          order_id: parseInt(newPayment.order_id as unknown as string),
          payment_method: newPayment.payment_method || 'online_card',
          payment_status: newPayment.payment_status || 'pending',
          transaction_id: newPayment.transaction_id || generateTransactionId(),
          created_at: (newPayment.created_at || new Date().toISOString()).replace('T', ' ').substring(0, 19),
          amount: parseFloat(newPayment.amount as unknown as string) || 0,
          user_id: user_id,
          user: user
        };
        
        setPayments(prev => [...prev, createdPayment]);
      }
      
      // Обновляем статистику
      const updatedPayments = editingPayment 
        ? payments.map(p => p.id === editingPayment.id ? { ...p, ...editingPayment } : p)
        : [...payments, {
            id: Math.max(...payments.map(p => p.id), 0) + 1,
            order_id: parseInt(newPayment.order_id as unknown as string),
            payment_method: newPayment.payment_method || 'online_card',
            payment_status: newPayment.payment_status || 'pending',
            transaction_id: newPayment.transaction_id || generateTransactionId(),
            created_at: (newPayment.created_at || new Date().toISOString()).replace('T', ' ').substring(0, 19),
            amount: parseFloat(newPayment.amount as unknown as string) || 0,
            user_id: parseInt(newPayment.user_id as unknown as string)
          }];
      
      calculateStats(updatedPayments);
      
      setShowModal(false);
      setEditingPayment(null);
      setNewPayment({
        payment_method: 'online_card',
        payment_status: 'pending',
        transaction_id: generateTransactionId(),
        created_at: new Date().toISOString().substring(0, 16)
      });
    } catch (error) {
      console.error('Ошибка при сохранении платежа:', error);
    }
  };

  // Обработка удаления платежа
  const handleDeletePayment = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот платеж?')) {
      try {
        // await fetch(`/api/payments/${id}`, {
        //   method: 'DELETE',
        // });
        
        // Демонстрационная логика
        const filteredPayments = payments.filter(p => p.id !== id);
        setPayments(filteredPayments);
        
        // Обновляем статистику
        calculateStats(filteredPayments);
      } catch (error) {
        console.error('Ошибка при удалении платежа:', error);
      }
    }
  };

  // Фильтрация платежей по критериям
  const getFilteredPayments = () => {
    let filtered = [...payments];
    
    if (currentTab !== 'all') {
      filtered = filtered.filter(p => p.payment_status === currentTab);
    }
    
    return filtered.filter(payment => {
      const matchesMethod = !filters.paymentMethod || payment.payment_method === filters.paymentMethod;
      const matchesStatus = !filters.paymentStatus || payment.payment_status === filters.paymentStatus;
      const matchesSearch = !filters.searchText || 
        payment.transaction_id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        payment.order_id.toString().includes(filters.searchText) ||
        (payment.user?.full_name && payment.user.full_name.toLowerCase().includes(filters.searchText.toLowerCase())) ||
        (payment.user?.username && payment.user.username.toLowerCase().includes(filters.searchText.toLowerCase()));
      
      return matchesMethod && matchesStatus && matchesSearch;
    });
  };

  // Экспорт платежей в CSV
  const handleExportCSV = () => {
    const filteredData = getFilteredPayments();
    
    const headers = ['ID', 'Номер заказа', 'Клиент', 'Сумма', 'Способ оплаты', 'Статус', 'ID транзакции', 'Дата создания'];
    const csvData = filteredData.map(payment => [
      payment.id,
      payment.order_id,
      payment.user?.full_name || '',
      payment.amount?.toFixed(2) || '0.00',
      getPaymentMethodLabel(payment.payment_method),
      getPaymentStatusLabel(payment.payment_status),
      payment.transaction_id,
      payment.created_at
    ]);
    
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `платежи_экспорт_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Получение человекочитаемого названия метода оплаты
  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: Record<string, string> = {
      'online_card': 'Банковская карта онлайн',
      'sbp': 'СБП',
      'cash_on_delivery': 'Наличными при получении',
      'online_wallet': 'Электронный кошелек',
      'credit_card': 'Кредитная карта',
      'bank_transfer': 'Банковский перевод',
    };
    return methodLabels[method] || method;
  };

  // Получение человекочитаемого названия статуса
  const getPaymentStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'completed': 'Завершен',
      'pending': 'Ожидает оплаты',
      'processing': 'Обрабатывается',
      'failed': 'Ошибка',
    };
    return statusLabels[status] || status;
  };

  // Определение цвета для статуса платежа
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'tag-success';
      case 'pending':
        return 'tag-warning';
      case 'processing':
        return 'tag-processing';
      case 'failed':
        return 'tag-error';
      default:
        return '';
    }
  };

  // Обработчик изменения поля в форме
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (editingPayment) {
      setEditingPayment({ ...editingPayment, [name]: value });
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  return (
    <div className="payments-page">
      <h1>Управление платежами</h1>
      
      {/* Статистические карточки */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-title">Всего платежей</div>
          <div className="stat-value">{stats.totalPayments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Завершенные платежи</div>
          <div className="stat-value completed">{stats.completedPayments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Ожидающие оплаты</div>
          <div className="stat-value pending">{stats.pendingPayments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">В обработке</div>
          <div className="stat-value processing">{stats.processingPayments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Общая сумма</div>
          <div className="stat-value">₽{stats.totalAmount.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Панель действий */}
      <div className="actions-panel">
        <button className="btn btn-primary" onClick={() => {
          setEditingPayment(null);
          setShowModal(true);
        }}>
          <span className="icon">+</span> Новый платеж
        </button>
        <button className="btn btn-export" onClick={handleExportCSV}>
          <span className="icon">↓</span> Экспорт в CSV
        </button>
        <button className="btn btn-refresh" onClick={fetchPayments}>
          <span className="icon">↻</span> Обновить
        </button>
      </div>
      
      {/* Фильтры */}
      <div className="filters-panel">
        <h3>Фильтры</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Способ оплаты</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
            >
              <option value="">Все способы</option>
              <option value="online_card">Банковская карта онлайн</option>
              <option value="sbp">СБП</option>
              <option value="cash_on_delivery">Наличными при получении</option>
              <option value="online_wallet">Электронный кошелек</option>
              <option value="credit_card">Кредитная карта</option>
              <option value="bank_transfer">Банковский перевод</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Статус</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
            >
              <option value="">Все статусы</option>
              <option value="completed">Завершен</option>
              <option value="pending">Ожидает оплаты</option>
              <option value="processing">Обрабатывается</option>
              <option value="failed">Ошибка</option>
            </select>
          </div>
          
          <div className="filter-group filter-search">
            <label>Поиск</label>
            <input
              type="text"
              placeholder="Поиск по ID, заказу, клиенту"
              value={filters.searchText}
              onChange={(e) => setFilters({...filters, searchText: e.target.value})}
            />
          </div>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="tabs-container">
        <div 
          className={`tab ${currentTab === 'all' ? 'active' : ''}`}
          onClick={() => setCurrentTab('all')}
        >
          Все платежи
        </div>
        <div 
          className={`tab ${currentTab === 'completed' ? 'active' : ''}`}
          onClick={() => setCurrentTab('completed')}
        >
          Завершенные
        </div>
        <div 
          className={`tab ${currentTab === 'pending' ? 'active' : ''}`}
          onClick={() => setCurrentTab('pending')}
        >
          Ожидающие оплаты
        </div>
        <div 
          className={`tab ${currentTab === 'processing' ? 'active' : ''}`}
          onClick={() => setCurrentTab('processing')}
        >
          В обработке
        </div>
      </div>
      
      {/* Таблица платежей */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Заказ №</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Способ оплаты</th>
                <th>Статус</th>
                <th>ID транзакции</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredPayments().map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.order_id}</td>
                  <td>{payment.user?.full_name || '-'}</td>
                  <td>₽{payment.amount?.toFixed(2)}</td>
                  <td>{getPaymentMethodLabel(payment.payment_method)}</td>
                  <td>
                    <div className={`status-badge ${payment.payment_status}`}>
                      {getPaymentStatusLabel(payment.payment_status)}
                    </div>
                  </td>
                  <td>{payment.transaction_id}</td>
                  <td>{formatDate(payment.created_at)}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action edit"
                      onClick={() => {
                        setEditingPayment(payment);
                        setShowModal(true);
                      }}
                    >
                      Изменить
                    </button>
                    <button 
                      className="btn-action delete"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {getFilteredPayments().length === 0 && (
                <tr className="empty-row">
                  <td colSpan={9}>
                    <div className="no-data">
                      <span className="icon">📝</span>
                      <p>Нет данных для отображения</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно создания/редактирования платежа */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPayment ? 'Редактировать платеж' : 'Создать новый платеж'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEditingPayment(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSavePayment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Номер заказа *</label>
                    <input 
                      type="number" 
                      name="order_id"
                      value={editingPayment?.order_id || newPayment.order_id || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Клиент *</label>
                    <select
                      name="user_id"
                      value={editingPayment?.user_id || newPayment.user_id || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Выберите клиента</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.username})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Сумма *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="amount"
                      value={editingPayment?.amount || newPayment.amount || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Способ оплаты *</label>
                    <select 
                      name="payment_method"
                      value={editingPayment?.payment_method || newPayment.payment_method}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="online_card">Банковская карта онлайн</option>
                      <option value="sbp">СБП</option>
                      <option value="cash_on_delivery">Наличными при получении</option>
                      <option value="online_wallet">Электронный кошелек</option>
                      <option value="credit_card">Кредитная карта</option>
                      <option value="bank_transfer">Банковский перевод</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Статус платежа *</label>
                    <select 
                      name="payment_status"
                      value={editingPayment?.payment_status || newPayment.payment_status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="completed">Завершен</option>
                      <option value="pending">Ожидает оплаты</option>
                      <option value="processing">Обрабатывается</option>
                      <option value="failed">Ошибка</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>ID транзакции</label>
                    <input 
                      type="text"
                      name="transaction_id"
                      value={editingPayment?.transaction_id || newPayment.transaction_id || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Дата создания *</label>
                    <input 
                      type="datetime-local"
                      name="created_at"
                      value={(editingPayment?.created_at || newPayment.created_at || '').replace(' ', 'T')}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingPayment ? 'Сохранить' : 'Создать'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPayment(null);
                    }}
                  >
                    Отмена
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

export default Payments;