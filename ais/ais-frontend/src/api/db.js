const { Pool } = require('pg');

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  user: 'katarymba',           // Пользователь базы данных PostgreSQL
  host: 'localhost',      // Хост базы данных
  database: 'sever_ryba_db',  // Имя базы данных
  password: 'root', // Пароль, который вы указали
  port: 5432,             // Стандартный порт PostgreSQL
});

// Функция для выполнения запросов
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Выполнен запрос', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool
};