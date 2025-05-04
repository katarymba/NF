const express = require('express');
const router = express.Router();
const db = require('./db');

// Получение всех заказов
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов', error: error.message });
  }
});

// Получение заказа по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ message: 'Ошибка при получении заказа', error: error.message });
  }
});

module.exports = router;