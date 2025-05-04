import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Select, Input, DatePicker, Typography, Space, Spin, Tooltip, Modal, Drawer, Form, notification } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, EyeOutlined, EditOutlined, ExportOutlined, SyncOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Order, DeliveryStatus, getStatusText, getStatusClass, formatPrice, formatDate } from '../utils/apiconfig.orders';
import { sendOrderToSeverRyba } from '../services/integration';
import dayjs from 'dayjs';
import '../styles/Orders.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OrderWithPayment extends Order {
  payment_method?: string;
  payment_status?: string;
  transaction_id?: string;
  payment_created_at?: string;
  client_name?: string;
  phone?: string;
  email?: string;
}

interface OrdersProps {
  token: string;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
  const [orders, setOrders] = useState<OrderWithPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderWithPayment | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editForm] = Form.useForm();
  const [syncingOrder, setSyncingOrder] = useState<number | null>(null);

  // Исправлено: используем корректный URL для API
  const API_BASE_URL = 'http://localhost:8080';

  // Получение данных заказов с платежами
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Получаем данные из базы PostgreSQL через API
      const response = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Правильная обработка данных из PostgreSQL
        const formattedOrders = response.data.map((order: any) => {
          // Обработка order_items если они представлены в виде строки JSON
          let orderItems = order.order_items;
          if (typeof orderItems === 'string') {
            try {
              orderItems = JSON.parse(orderItems);
            } catch (e) {
              console.error('Ошибка при парсинге order_items:', e);
              orderItems = [];
            }
          }
          
          return {
            ...order,
            order_items: orderItems,
            // Преобразование платежного метода в русский текст
            payment_method: order.payment_method === 'online_card' ? 'Онлайн картой' : 
                            order.payment_method === 'sbp' ? 'СБП' : 
                            order.payment_method === 'cash' ? 'Наличными' : order.payment_method,
            // Устанавливаем статус оплаты на основе наличия payment_method
            payment_status: order.payment_method ? 'completed' : 'pending',
            // Добавляем другие необходимые поля
            items: orderItems
          };
        });
        
        setOrders(formattedOrders);
      } else {
        notification.error({
          message: 'Ошибка при загрузке данных',
          description: 'Не удалось загрузить данные заказов из базы данных'
        });
      }
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      notification.error({
        message: 'Ошибка при загрузке данных',
        description: 'Проверьте соединение с сервером и базой данных PostgreSQL'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Обновление статуса заказа
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/orders/${id}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      notification.success({
        message: 'Статус обновлен',
        description: `Статус заказа №${id} изменен на "${getStatusText(status)}"`
      });
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить статус заказа'
      });
    }
  };

  // Отправка заказа в Север-Рыбу
  const syncOrderWithSeverRyba = async (orderId: number) => {
    setSyncingOrder(orderId);
    try {
      // Здесь мы напрямую используем данные из PostgreSQL
      const orderToSync = orders.find(order => order.id === orderId);
      
      if (!orderToSync) {
        throw new Error('Заказ не найден');
      }
      
      // Формируем данные для отправки в Север-Рыбу в соответствии с форматом их таблицы
      const syncData = {
        id: orderToSync.id,
        user_id: orderToSync.user_id,
        total_price: orderToSync.total_price,
        created_at: orderToSync.created_at,
        status: orderToSync.status,
        client_name: orderToSync.client_name || 'Не указан',
        delivery_address: orderToSync.delivery_address,
        order_items: orderToSync.order_items || orderToSync.items,
        payment_method: orderToSync.payment_method
      };
      
      // Отправка данных через интеграционный сервис
      await sendOrderToSeverRyba(orderId, token, syncData);
      
      notification.success({
        message: 'Синхронизация выполнена',
        description: `Заказ №${orderId} успешно отправлен в Север-Рыбу`
      });
    } catch (error) {
      console.error(`Ошибка при отправке заказа ${orderId} в Север-Рыбу:`, error);
      notification.error({
        message: 'Ошибка синхронизации',
        description: 'Не удалось отправить заказ в Север-Рыбу'
      });
    } finally {
      setSyncingOrder(null);
    }
  };

  // Открытие деталей заказа
  const showOrderDetails = (order: OrderWithPayment) => {
    setOrderDetails(order);
    setDetailsVisible(true);
  };

  // Открытие формы редактирования
  const showEditForm = (order: OrderWithPayment) => {
    setOrderDetails(order);
    editForm.setFieldsValue({
      status: order.status,
      delivery_address: order.delivery_address,
      contact_phone: order.contact_phone,
      delivery_notes: order.delivery_notes
    });
    setEditVisible(true);
  };

  // Сохранение изменений заказа
  const handleSaveChanges = async (values: any) => {
    if (!orderDetails?.id) return;
    
    try {
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderDetails.id}`, 
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      notification.success({
        message: 'Заказ обновлен',
        description: `Заказ №${orderDetails.id} успешно обновлен`
      });
      setEditVisible(false);
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
      notification.error({
        message: 'Ошибка при обновлении',
        description: 'Не удалось обновить данные заказа'
      });
    }
  };

  // Применение фильтров
  const filteredOrders = orders.filter(order => {
    // Фильтр по строке поиска
    const searchMatch = !searchText || 
      order.id.toString().includes(searchText) || 
      (order.client_name && order.client_name.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.transaction_id && order.transaction_id.includes(searchText));
    
    // Фильтр по статусу
    const statusMatch = !statusFilter || order.status === statusFilter;
    
    // Фильтр по диапазону дат
    let dateMatch = true;
    if (dateRange && dateRange[0] && dateRange[1] && order.created_at) {
      const orderDate = dayjs(order.created_at);
      dateMatch = orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  // Экспорт в Excel
  const exportToExcel = () => {
    notification.info({
      message: 'Экспорт данных',
      description: 'Подготовка файла для экспорта...'
    });

    try {
      window.open(`${API_BASE_URL}/api/orders/export?format=excel&token=${encodeURIComponent(token)}`, '_blank');
    } catch (error) {
      notification.error({
        message: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать данные'
      });
    }
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setDateRange(null);
  };

  // Колонки таблицы
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: OrderWithPayment, b: OrderWithPayment) => a.id - b.id,
      render: (id: number) => (
        <Link to={`/orders/${id}`}>{id}</Link>
      ),
    },
    {
      title: 'Клиент',
      dataIndex: 'client_name',
      key: 'client_name',
      render: (text: string, record: OrderWithPayment) => (
        <div>
          <div>{text || 'Клиент не указан'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.user_id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number) => formatPrice(price),
      sorter: (a: OrderWithPayment, b: OrderWithPayment) => 
        (a.total_price || 0) - (b.total_price || 0),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
      sorter: (a: OrderWithPayment, b: OrderWithPayment) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime(),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag className={getStatusClass(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Оплата',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string, record: OrderWithPayment) => (
        <div>
          <Tag color={
            record.payment_status === 'completed' ? 'green' : 
            record.payment_status === 'processing' ? 'blue' : 
            record.payment_status === 'pending' ? 'orange' : 'default'
          }>
            {record.payment_status === 'completed' ? 'Оплачен' : 
             record.payment_status === 'processing' ? 'Обрабатывается' : 
             record.payment_status === 'pending' ? 'Ожидает' : 'Неизвестно'}
          </Tag>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {method}
          </div>
        </div>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (text: string, record: OrderWithPayment) => (
        <Space>
          <Tooltip title="Просмотр деталей">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              type="default" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => showEditForm(record)}
            />
          </Tooltip>
          <Tooltip title="Отправить в Север-Рыбу">
            <Button 
              type="default" 
              size="small" 
              icon={<SyncOutlined spin={syncingOrder === record.id} />} 
              onClick={() => syncOrderWithSeverRyba(record.id)}
              loading={syncingOrder === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={3}>Управление заказами</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchOrders}
              loading={loading}
            >
              Обновить
            </Button>
            <Button 
              type="default" 
              icon={<ExportOutlined />} 
              onClick={exportToExcel}
            >
              Экспорт в Excel
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Space wrap>
            <Input 
              placeholder="Поиск по ID, клиенту или транзакции" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Select 
              placeholder="Статус заказа" 
              style={{ width: 180 }} 
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value={DeliveryStatus.PENDING}>Ожидает обработки</Option>
              <Option value={DeliveryStatus.PROCESSING}>В обработке</Option>
              <Option value={DeliveryStatus.SHIPPED}>Отправлен</Option>
              <Option value={DeliveryStatus.DELIVERED}>Доставлен</Option>
              <Option value={DeliveryStatus.CANCELLED}>Отменен</Option>
            </Select>
            <RangePicker 
              placeholder={['Дата с', 'Дата по']}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              value={dateRange}
            />
            <Button type="default" onClick={clearFilters} icon={<FilterOutlined />}>
              Сбросить фильтры
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table 
            dataSource={filteredOrders}
            columns={columns}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true, 
              showTotal: (total) => `Всего: ${total} заказов`,
              pageSizeOptions: ['10', '20', '50']
            }}
          />
        </Spin>
      </Card>

      {/* Модальное окно с деталями заказа */}
      <Drawer
        title={`Детали заказа №${orderDetails?.id}`}
        width={600}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        extra={
          <Space>
            <Button type="primary" onClick={() => orderDetails && showEditForm(orderDetails)}>
              Редактировать
            </Button>
          </Space>
        }
      >
        {orderDetails && (
          <div>
            <Card title="Основная информация" style={{ marginBottom: '16px' }}>
              <p><strong>Клиент:</strong> {orderDetails.client_name || 'Не указан'}</p>
              <p><strong>ID пользователя:</strong> {orderDetails.user_id}</p>
              <p><strong>Дата создания:</strong> {formatDate(orderDetails.created_at || '')}</p>
              <p><strong>Статус:</strong> <Tag className={getStatusClass(orderDetails.status)}>{getStatusText(orderDetails.status)}</Tag></p>
              <p><strong>Сумма заказа:</strong> {formatPrice(orderDetails.total_price || 0)}</p>
            </Card>
            
            <Card title="Информация об оплате" style={{ marginBottom: '16px' }}>
              <p><strong>Способ оплаты:</strong> {orderDetails.payment_method || 'Не указан'}</p>
              <p><strong>Статус оплаты:</strong> {
                orderDetails.payment_status === 'completed' ? 'Оплачен' : 
                orderDetails.payment_status === 'processing' ? 'Обрабатывается' : 
                orderDetails.payment_status === 'pending' ? 'Ожидает оплаты' : 'Неизвестно'
              }</p>
              <p><strong>ID транзакции:</strong> {orderDetails.transaction_id || 'Нет данных'}</p>
              <p><strong>Дата оплаты:</strong> {orderDetails.payment_created_at ? formatDate(orderDetails.payment_created_at) : 'Нет данных'}</p>
            </Card>
            
            <Card title="Информация о доставке" style={{ marginBottom: '16px' }}>
              <p><strong>Адрес доставки:</strong> {orderDetails.delivery_address}</p>
              <p><strong>Трек-номер:</strong> {orderDetails.tracking_number || 'Не присвоен'}</p>
              <p><strong>Примечание к доставке:</strong> {orderDetails.delivery_notes || 'Нет'}</p>
            </Card>
            
            <Card title="Товары в заказе">
              <Table 
                dataSource={(() => {
                  // Обработка разных форматов данных о товарах
                  if (orderDetails.items && Array.isArray(orderDetails.items)) {
                    return orderDetails.items;
                  }
                  if (orderDetails.order_items) {
                    // Если order_items это JSON-строка, пробуем распарсить
                    if (typeof orderDetails.order_items === 'string') {
                      try {
                        return JSON.parse(orderDetails.order_items);
                      } catch (e) {
                        console.error('Ошибка парсинга JSON:', e);
                        return [];
                      }
                    }
                    // Если order_items уже объект или массив
                    if (Array.isArray(orderDetails.order_items)) {
                      return orderDetails.order_items;
                    }
                  }
                  return [];
                })()}
                pagination={false}
                rowKey={(record, index) => `${record.product_id || ''}-${index}`}
                columns={[
                  {
                    title: 'ID товара',
                    dataIndex: 'product_id',
                    key: 'product_id',
                  },
                  {
                    title: 'Название',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record: any) => text || record.product_name || 'Товар',
                  },
                  {
                    title: 'Количество',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Цена за ед.',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price: number) => formatPrice(price),
                  },
                  {
                    title: 'Итого',
                    key: 'total',
                    render: (text, record: any) => formatPrice(record.price * record.quantity),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* Форма редактирования заказа */}
      <Modal
        title={`Редактирование заказа №${orderDetails?.id}`}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveChanges}
        >
          <Form.Item
            name="status"
            label="Статус заказа"
            rules={[{ required: true, message: 'Выберите статус заказа' }]}
          >
            <Select>
              <Option value={DeliveryStatus.PENDING}>Ожидает обработки</Option>
              <Option value={DeliveryStatus.PROCESSING}>В обработке</Option>
              <Option value={DeliveryStatus.SHIPPED}>Отправлен</Option>
              <Option value={DeliveryStatus.DELIVERED}>Доставлен</Option>
              <Option value={DeliveryStatus.CANCELLED}>Отменен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="delivery_address"
            label="Адрес доставки"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Телефон для связи"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="delivery_notes"
            label="Примечание к доставке"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;