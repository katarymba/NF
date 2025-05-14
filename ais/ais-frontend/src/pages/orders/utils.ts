import dayjs from 'dayjs';

// Форматирование цены
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Форматирование даты
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD.MM.YYYY HH:mm');
};

// Получение текста статуса заказа
export const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Ожидает обработки',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'in_transit': 'В пути',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
};

// Получение текста статуса оплаты
export const getPaymentStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Ожидает оплаты',
        'processing': 'Обрабатывается',
        'completed': 'Оплачен',
        'failed': 'Ошибка оплаты',
        'refunded': 'Возврат средств'
    };
    return statusMap[status] || status;
};

// Получение текста метода оплаты
export const getPaymentMethodText = (method: string): string => {
    const methodMap: { [key: string]: string } = {
        'online_card': 'Картой онлайн',
        'sbp': 'СБП',
        'cash': 'Наличными',
        'cash_on_delivery': 'Наличными при получении',
        'online_wallet': 'Электронный кошелёк',
        'credit_card': 'Кредитной картой',
        'bank_transfer': 'Банковский перевод'
    };
    return methodMap[method] || method;
};