# API Gateway для Север-Рыба и АИС

API Gateway предоставляет единую точку входа для взаимодействия клиентских приложений с бэкенд-системами Север-Рыба и АИС (Автоматизированная Информационная Система). Шлюз проксирует запросы к соответствующим бэкендам, обеспечивая интеграцию между системами и единую точку доступа.

## Основные возможности

- Проксирование запросов к бэкендам Север-Рыба и АИС
- Объединение данных из обеих систем для интеграционных сценариев
- Мониторинг состояния бэкенд-систем
- Кэширование часто запрашиваемых данных
- Логирование запросов и ответов
- Интеграционные API для обмена данными между системами

## Требования

- Python 3.9+
- FastAPI
- Uvicorn
- httpx
- python-dotenv

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd api-gateway
```

### 2. Создание виртуального окружения

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate     # Windows
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корневой директории проекта со следующим содержимым:

```
# API Gateway Configuration
API_GATEWAY_PORT=8080

# Backend URLs
SEVER_RYBA_API=http://localhost:8000
AIS_API=http://localhost:8001

# Security settings
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=30

# Cache settings
CACHE_TTL_SECONDS=900  # 15 minutes

# Logging
LOG_LEVEL=INFO
LOG_FILE=api_gateway.log
```

### 5. Запуск API Gateway

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## Структура API Gateway

### Основные маршруты

- `/` - Информация о API Gateway
- `/health` - Проверка состояния систем Север-Рыба и АИС
- `/sever-ryba/{path}` - Проксирование запросов к Север-Рыба API
- `/ais/{path}` - Проксирование запросов к АИС API

### Интеграционные маршруты

- `/api/integration/order-status/{order_id}` - Объединенная информация о заказе и его отслеживании
- `/api/integration/sales-analytics` - Аналитика продаж из обеих систем
- `/api/integration/auth` - Единая точка входа для аутентификации
- `/api/integration/sync/products` - Синхронизация товаров между АИС и Север-Рыба

## Документация API

После запуска API Gateway, документация OpenAPI будет доступна по адресу:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Логирование

API Gateway записывает логи в файл `api_gateway.log` и выводит их в консоль. Уровень логирования можно настроить в файле `.env`.

## Запуск бэкенд-систем

### Запуск Север-Рыба API

```bash
cd Sever-Fish/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Запуск АИС API (локально, без Docker)

```bash
cd ais/ais-backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Диагностика и мониторинг

- Для проверки состояния API Gateway и бэкенд-систем: `GET /health`
- Логи API Gateway находятся в файле `api_gateway.log`

## Решение проблем

### Проблема: Не удается подключиться к бэкенд-системам

1. Убедитесь, что бэкенд-системы запущены и доступны по указанным в `.env` URL
2. Проверьте логи API Gateway для получения дополнительной информации об ошибках
3. Используйте маршрут `/health` для проверки состояния бэкенд-систем

### Проблема: Ошибки при интеграции данных

1. Проверьте совместимость данных между системами Север-Рыба и АИС
2. Убедитесь, что обе системы доступны и возвращают корректные данные
3. Проверьте логи API Gateway для получения информации об ошибках интеграции