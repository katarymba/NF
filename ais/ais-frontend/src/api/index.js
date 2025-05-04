const express = require('express');
const router = express.Router();
const ordersRouter = require('./orders');

// Middleware для обработки JSON
router.use(express.json());

// Базовый маршрут API
router.get('/', (req, res) => {
  res.json({ message: 'API работает' });
});

// Маршруты для заказов
router.use('/orders', ordersRouter);

// Маршрут для аутентификации
router.post('/auth/me', (req, res) => {
  // Здесь должна быть логика проверки токена аутентификации
  // Для тестирования возвращаем успешный ответ
  res.json({ authenticated: true, user: { username: req.body.username } });
});

// Обработка ошибок
router.use((err, req, res, next) => {
  console.error('API ошибка:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера', error: err.message });
});

module.exports = router;