# Север-Рыба: Комплексная система управления и клиентская часть

<div align="center">
  <img src="ais/ais-frontend/public/logo.png" alt="NF logo" width="200"/>

  <p><strong>Разработка FullStack приложения для управления и автоматизации рыбного бизнеса</strong></p>

  ![License](https://img.shields.io/badge/license-MIT-blue)
  ![Version](https://img.shields.io/badge/version-0.0.0.4.2-green)
</div>

---

## 📖 Обзор проекта

**"Север-Рыба"** — это современная система, призванная автоматизировать управление рыбным производством, продажами и административными процессами. Она состоит из следующих компонентов:

1. **Sever-Fish**: клиентская часть для покупателей, включающая фронтенд и бэкенд.
2. **AIS (Административная Информационная Система)**: панель управления для сотрудников.
3. **API Gateway**: интеграционный слой между различными системами.

---

## 🏗️ Архитектура решения


## 🏗️ Архитектура решения

```
                                  ┌─────────────────┐    ┌─────────────────┐
                                  │                 │    │                 │
                                  │  Sever-Fish     │    │  AIS            │
                                  │  Frontend       │    │  Frontend       │
                                  │  (Клиентская    │    │  (Админ-        │
                                  │   часть)        │    │   панель)       │
                                  │                 │    │                 │
                                  └────────┬────────┘    └────────┬────────┘
                                           │                      │
                                           │                      │
                                           │                      │
                                  ┌────────▼────────┐    ┌────────▼────────┐
                                  │                 │    │                 │
                                  │  Sever-Fish     │    │  AIS            │
                                  │  Backend        │    │  Backend        │
                                  │  (API)          │    │  (API)          │
                                  │                 │    │                 │
                                  └────────┬────────┘    └────────┬────────┘
                                           │                      │
                                           └──────────┬───────────┘
                                                      │
                                            ┌─────────▼─────────┐
                                            │                   │
                                            │   API Gateway     │
                                            │                   │
                                            └─────────┬─────────┘
                                                      │
                                            ┌─────────▼─────────┐
                                            │                   │
                                            │   PostgreSQL DB   │
                                            │                   │
                                            └───────────────────┘
```


---

## 🛠️ Технологический стек

### Фронтенд
- **React** + **TypeScript**
- **TailwindCSS** для стилизации
- **Vite** для сборки

### Бэкенд
- **FastAPI** (Python)
- **SQLAlchemy** для ORM
- **Alembic** для миграций

### Интеграция
- **API Gateway** на FastAPI

### База данных
- **PostgreSQL**

---

## 🚀 Быстрый старт

### Предварительные требования

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

### Установка и запуск

#### 1. Клонирование репозитория

```bash
git clone https://your-repository-url/nf.git
cd nf
```

#### 2. Настройка окружения для бэкенда

##### Sever-Fish Бэкенд
```bash
cd Sever-Fish/backend
python -m venv .venv
source .venv/bin/activate  # На Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Настройка БД
alembic upgrade head

# Запуск сервера
python main.py
```

##### AIS Бэкенд
```bash
cd ais/ais-backend
python -m venv .venv
source .venv/bin/activate  # На Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Настройка БД
alembic upgrade head

# Создание администратора
python init_admin.py

# Запуск сервера
uvicorn app.main:app --reload
```

#### 3. Настройка окружения для фронтенда

##### Sever-Fish Фронтенд
```bash
cd Sever-Fish/frontend
npm install
npm run dev
```

##### AIS Фронтенд
```bash
cd ais/ais-frontend
npm install
npm run dev
```

#### 4. Настройка API Gateway

```bash
cd api-gateway
python -m venv .venv
source .venv/bin/activate  # На Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Запуск
uvicorn main:app --reload
```

#### 5. Быстрый запуск через скрипты (Windows)

Для удобства доступны bat-файлы:

```plaintext
run-all.bat           # Запуск всех компонентов
run-ais-backend.bat   # Запуск AIS бэкенда
run-ais-frontend.bat  # Запуск AIS фронтенда
run-api-gateway.bat   # Запуск API Gateway
run-sever-ryba-frontend.bat  # Запуск клиентского фронтенда
```

---

## 📂 Структура проекта

```plaintext
/NF
├── Sever-Fish/              # Клиентская часть
│   ├── backend/             # API для клиентского приложения
│   └── frontend/            # Клиентский веб-интерфейс
├── ais/                     # Административная система
│   ├── ais-backend/         # API для админки
│   └── ais-frontend/        # Административный веб-интерфейс
├── api-gateway/             # Интеграционный слой
└── *.bat                    # Скрипты для запуска компонентов
```

---

## 🎯 Основные функциональности

### Клиентская часть (Sever-Fish)
- Каталог товаров
- Корзина покупок
- Оформление заказов
- Личный кабинет пользователя
- История заказов

### Административная часть (AIS)
- Управление каталогом товаров и категориями
- Обработка заказов
- Аналитика продаж
- Управление пользователями
- Синхронизация данных

---

## 🔧 Разработка

### Добавление новых миграций

#### Sever-Fish
```bash
cd Sever-Fish/backend
alembic revision --autogenerate -m "описание изменений"
alembic upgrade head
```

#### AIS
```bash
cd ais/ais-backend
alembic revision --autogenerate -m "описание изменений"
alembic upgrade head
```

### Доступ к API

- **Sever-Fish API**: [http://localhost:8000](http://localhost:8000)
- **AIS API**: [http://localhost:8001](http://localhost:8001)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)

### Документация API

- **Sever-Fish API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **AIS API**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **API Gateway**: [http://localhost:8080/docs](http://localhost:8080/docs)

---

## 🔑 Данные для входа

### AIS (административная панель)
- **Логин**: `main_admin`
- **Пароль**: `qwerty123`

---

## 📜 Лицензия

Проект распространяется под лицензией [MIT License](LICENSE).
