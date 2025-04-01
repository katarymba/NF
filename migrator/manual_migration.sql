-- Копирование таблицы users (с изменением владельца)
CREATE TABLE north_fish.public.users (LIKE sever_ryba_db.public.users INCLUDING ALL);
INSERT INTO north_fish.public.users SELECT * FROM sever_ryba_db.public.users;
ALTER TABLE north_fish.public.users OWNER TO northf_user;

-- Копирование таблицы products
CREATE TABLE north_fish.public.products (LIKE sever_ryba_db.public.products INCLUDING ALL);
INSERT INTO north_fish.public.products SELECT * FROM sever_ryba_db.public.products;
ALTER TABLE north_fish.public.products OWNER TO northf_user;

-- Копирование таблицы categories
CREATE TABLE north_fish.public.categories (LIKE sever_ryba_db.public.categories INCLUDING ALL);
INSERT INTO north_fish.public.categories SELECT * FROM sever_ryba_db.public.categories;
ALTER TABLE north_fish.public.categories OWNER TO northf_user;

-- Копирование таблицы orders
CREATE TABLE north_fish.public.orders (LIKE sever_ryba_db.public.orders INCLUDING ALL);
INSERT INTO north_fish.public.orders SELECT * FROM sever_ryba_db.public.orders;
ALTER TABLE north_fish.public.orders OWNER TO northf_user;

-- Копирование таблицы order_items
CREATE TABLE north_fish.public.order_items (LIKE sever_ryba_db.public.order_items INCLUDING ALL);
INSERT INTO north_fish.public.order_items SELECT * FROM sever_ryba_db.public.order_items;
ALTER TABLE north_fish.public.order_items OWNER TO northf_user;

-- Копирование таблицы alembic_version
CREATE TABLE north_fish.public.alembic_version (LIKE sever_ryba_db.public.alembic_version INCLUDING ALL);
INSERT INTO north_fish.public.alembic_version SELECT * FROM sever_ryba_db.public.alembic_version;
ALTER TABLE north_fish.public.alembic_version OWNER TO northf_user;

-- Создание новых таблиц
CREATE TABLE north_fish.public.payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
ALTER TABLE north_fish.public.payments OWNER TO northf_user;

CREATE TABLE north_fish.public.shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'в пути',
    estimated_delivery TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
ALTER TABLE north_fish.public.shipments OWNER TO northf_user;