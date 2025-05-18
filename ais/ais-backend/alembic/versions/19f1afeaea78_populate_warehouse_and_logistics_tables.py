"""populate_warehouse_and_logistics_tables

Revision ID: 19f1afeaea78
Revises: e909b3edfd56
Create Date: 2025-05-07 18:55:15.732948

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Float, DateTime, Text, ARRAY, JSON
from datetime import datetime, timedelta
import json

# revision identifiers, used by Alembic.
revision: str = '19f1afeaea78'
down_revision: Union[str, None] = 'e909b3edfd56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Заполняем таблицу warehouses
    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (1, 'ООО "Север-Рыба" Центральный склад', 'г. Шулма, ул. Портовая, 15', 'WAREHOUSE', 10000, 'Иванов Сергей Петрович', '+7(921)123-45-67', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (2, 'Оптовый склад', 'г. Череповец, ул. Гоголя, 88', 'WAREHOUSE', 8000, 'Петрова Елена Николаевна', '+7(921)234-56-78', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (3, 'Север-Рыба Устюженская', 'г. Череповец, ул. Устюженская, 8', 'STORE', 500, 'Смирнова Ольга Владимировна', '+7(921)345-67-89', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (4, 'Север-Рыба Горького', 'г. Череповец, ул. Максима Горького, 30', 'STORE', 450, 'Козлов Дмитрий Иванович', '+7(921)456-78-90', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (5, 'Север-Рыба Ленинградская', 'г. Череповец, ул. Ленинградская, 16', 'STORE', 400, 'Николаева Анна Сергеевна', '+7(921)567-89-01', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (6, 'Север-Рыба Октябрьский', 'г. Череповец, Октябрьский проспект, 49', 'STORE', 550, 'Васильев Игорь Александрович', '+7(921)678-90-12', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (7, 'Север-Рыба Победы', 'г. Череповец, Проспект Победы, 107', 'STORE', 480, 'Федорова Мария Алексеевна', '+7(921)789-01-23', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (8, 'Север-Рыба Пионерская', 'г. Череповец, ул. Пионерская, 21', 'STORE', 420, 'Алексеев Павел Дмитриевич', '+7(921)890-12-34', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (9, 'Север-Рыба Белинского', 'г. Череповец, ул. Белинского, 1/3 к2', 'STORE', 470, 'Морозова Екатерина Игоревна', '+7(921)901-23-45', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (10, 'Север-Рыба Краснодонцев', 'г. Череповец, ул. Краснодонцев, 110', 'STORE', 510, 'Соколов Артем Викторович', '+7(921)012-34-56', '2025-05-07 17:01:28')
    """)

    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (11, 'Север-Рыба Беляева', 'г. Череповец, ул. Космонавта Беляева, 29', 'STORE', 490, 'Лебедева Наталья Дмитриевна', '+7(921)123-45-67', '2025-05-07 17:01:28')
    """)

    # 2. Находим существующего пользователя
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT id FROM users WHERE username = 'katarymba' LIMIT 1"))
    user_row = result.fetchone()
    user_id = user_row[0] if user_row else 1

    # 3. Заполняем таблицу orders
    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (1, {user_id}, 12500.00, 'completed', '2025-05-01 17:01:28', 'TRK03660847', 'ЯндексДоставка', 'Позвонить перед доставкой', '2025-05-09', 'in_transit')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (2, {user_id}, 8700.50, 'processing', '2025-05-02 17:01:28', 'TRK03660855', 'СДЭК', 'Оставить у двери', '2025-05-12', 'processing')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (3, {user_id}, 9300.75, 'shipped', '2025-05-02 17:01:28', 'TRK03660848', 'ПЭК', 'Хрупкое, обращаться осторожно', '2025-05-10', 'shipped')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (4, {user_id}, 5600.25, 'delivered', '2025-05-03 17:01:28', 'TRK03660849', 'ЯндексДоставка', 'Доставка до двери', '2025-05-06', 'delivered')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (5, {user_id}, 7800.00, 'processing', '2025-05-03 17:01:28', 'TRK03660856', 'СДЭК', 'Требуется подпись при получении', '2025-05-12', 'processing')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (6, {user_id}, 11250.50, 'processing', '2025-05-04 17:01:28', 'TRK03660857', 'ПЭК', 'Звонить за час до прибытия', '2025-05-14', 'processing')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (7, {user_id}, 4950.75, 'shipped', '2025-05-04 17:01:28', 'TRK03660850', 'ЯндексДоставка', 'Доставка в офис', '2025-05-11', 'shipped')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (8, {user_id}, 6300.25, 'delivered', '2025-05-04 17:01:28', 'TRK03660851', 'СДЭК', 'Доставка до пункта выдачи', '2025-05-05', 'delivered')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (9, {user_id}, 8650.00, 'pending', '2025-05-05 17:01:28', 'TRK03660860', 'ПЭК', 'Доставка до транспортной компании', '2025-05-14', 'pending')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (10, {user_id}, 12100.00, 'processing', '2025-05-05 17:01:28', 'TRK03660858', 'ЯндексДоставка', 'Оплата при получении', '2025-05-13', 'processing')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (11, {user_id}, 7950.50, 'shipped', '2025-05-05 17:01:28', 'TRK03660852', 'СДЭК', 'Звонить курьеру', '2025-05-13', 'shipped')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (12, {user_id}, 5450.25, 'delivered', '2025-05-05 17:01:28', 'TRK03660853', 'ПЭК', 'Принимает консьерж', '2025-05-04', 'delivered')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (13, {user_id}, 9800.75, 'pending', '2025-05-06 17:01:28', 'TRK03660859', 'ЯндексДоставка', 'Не оставлять у соседей', '2025-05-15', 'pending')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (14, {user_id}, 11350.50, 'processing', '2025-05-06 17:01:28', 'TRK03660861', 'СДЭК', 'Можно оставить в постамате', '2025-05-11', 'processing')
    """)

    op.execute(f"""
    INSERT INTO orders (id, user_id, total_price, status, created_at, tracking_number, courier_name, delivery_notes, estimated_delivery, delivery_status)
    VALUES
        (15, {user_id}, 6700.25, 'shipped', '2025-05-06 17:01:28', 'TRK03660854', 'ПЭК', 'Доставка до двери', '2025-05-08', 'shipped')
    """)

    # 4. Заполняем таблицу shipments
    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (1, 1, 'ул. Набережная 10, Москва', 'TRK03660847', 'in_transit', '2025-05-09 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (2, 3, 'ул. Центральная 20, Казань', 'TRK03660848', 'shipped', '2025-05-10 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (3, 4, 'ул. Морская 25, Сочи', 'TRK03660849', 'delivered', '2025-05-06 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (4, 7, 'пр. Морской 40, Мурманск', 'TRK03660850', 'shipped', '2025-05-11 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (5, 8, 'ул. Рыбацкая 45, Калининград', 'TRK03660851', 'delivered', '2025-05-05 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (6, 11, 'пр. Лососевый 60, Петропавловск-Камчатский', 'TRK03660852', 'shipped', '2025-05-13 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (7, 12, 'ул. Красная 65, Красноярск', 'TRK03660853', 'delivered', '2025-05-04 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (8, 15, 'пр. Невский 15, Санкт-Петербург', 'TRK03660854', 'shipped', '2025-05-08 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (9, 2, 'пр. Невский 15, Санкт-Петербург', 'TRK03660855', 'processing', '2025-05-12 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (10, 5, 'пр. Ленина 30, Новосибирск', 'TRK03660856', 'processing', '2025-05-12 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (11, 6, 'ул. Речная 35, Владивосток', 'TRK03660857', 'processing', '2025-05-14 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (12, 10, 'ул. Океанская 55, Хабаровск', 'TRK03660858', 'processing', '2025-05-13 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (13, 13, 'пр. Дальневосточный 70, Южно-Сахалинск', 'TRK03660859', 'pending', '2025-05-15 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (14, 9, 'пр. Приморский 50, Архангельск', 'TRK03660860', 'pending', '2025-05-14 17:01:28')
    """)

    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (15, 14, 'ул. Набережная 10, Москва', 'TRK03660861', 'processing', '2025-05-11 17:01:28')
    """)

    # 5. Заполняем таблицу stock_movements - начинаем с проверки типа movement_type
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT data_type FROM information_schema.columns WHERE table_name = 'stock_movements' AND column_name = 'movement_type'"))
    type_info = result.fetchone()
    is_varchar = type_info and 'varchar' in str(type_info[0]).lower()

    # Определяем значения в зависимости от типа поля
    incoming_value = 'Поступление' if is_varchar else 'INCOMING'
    outgoing_value = 'Отгрузка' if is_varchar else 'OUTGOING'
    transfer_value = 'Перемещение' if is_varchar else 'TRANSFER'

    # Поступления на центральный склад
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (1, 1, 1, 100, '{incoming_value}', NULL, NULL, '2025-04-07 17:01:28', {user_id}, 'Первичное поступление от поставщика')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (2, 2, 1, 200, '{incoming_value}', NULL, NULL, '2025-04-07 17:01:28', {user_id}, 'Первичное поступление от поставщика')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (3, 3, 1, 150, '{incoming_value}', NULL, NULL, '2025-04-08 17:01:28', {user_id}, 'Первичное поступление от поставщика')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (4, 4, 1, 120, '{incoming_value}', NULL, NULL, '2025-04-08 17:01:28', {user_id}, 'Первичное поступление от поставщика')
    """)

    # Перемещения с центрального склада на оптовый
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (5, 1, 2, 50, '{transfer_value}', 1, 2, '2025-04-12 17:01:28', {user_id}, 'Перемещение для наполнения оптового склада')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (6, 2, 2, 80, '{transfer_value}', 1, 2, '2025-04-12 17:01:28', {user_id}, 'Перемещение для наполнения оптового склада')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (7, 3, 2, 60, '{transfer_value}', 1, 2, '2025-04-13 17:01:28', {user_id}, 'Перемещение для наполнения оптового склада')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (8, 4, 2, 40, '{transfer_value}', 1, 2, '2025-04-13 17:01:28', {user_id}, 'Перемещение для наполнения оптового склада')
    """)

    # Перемещения с оптового склада в магазины
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (9, 1, 3, 10, '{transfer_value}', 2, 3, '2025-04-17 17:01:28', {user_id}, 'Поставка в розничный магазин')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (10, 2, 3, 15, '{transfer_value}', 2, 3, '2025-04-17 17:01:28', {user_id}, 'Поставка в розничный магазин')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (11, 1, 4, 8, '{transfer_value}', 2, 4, '2025-04-18 17:01:28', {user_id}, 'Поставка в розничный магазин')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (12, 3, 4, 12, '{transfer_value}', 2, 4, '2025-04-18 17:01:28', {user_id}, 'Поставка в розничный магазин')
    """)

    # Продажи из магазинов
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (13, 1, 3, 5, '{outgoing_value}', 3, NULL, '2025-04-22 17:01:28', {user_id}, 'Продажа клиенту')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (14, 2, 3, 7, '{outgoing_value}', 3, NULL, '2025-04-23 17:01:28', {user_id}, 'Продажа клиенту')
    """)

    # Дополнительные перемещения из центрального склада в магазины
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (15, 2, 5, 20, '{transfer_value}', 1, 5, '2025-04-19 17:01:28', {user_id}, 'Прямая поставка с центрального склада')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (16, 3, 6, 18, '{transfer_value}', 1, 6, '2025-04-20 17:01:28', {user_id}, 'Прямая поставка с центрального склада')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (17, 4, 7, 15, '{transfer_value}', 1, 7, '2025-04-21 17:01:28', {user_id}, 'Прямая поставка с центрального склада')
    """)

    # Дополнительные поступления на центральный склад
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (18, 1, 1, 50, '{incoming_value}', NULL, NULL, '2025-04-27 17:01:28', {user_id}, 'Дополнительное поступление от поставщика')
    """)

    # Списания товаров
    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (19, 2, 2, 5, '{outgoing_value}', 2, NULL, '2025-04-29 17:01:28', {user_id}, 'Списание из-за истечения срока годности')
    """)

    op.execute(f"""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (20, 3, 11, 2, '{outgoing_value}', 11, NULL, '2025-05-02 17:01:28', {user_id}, 'Списание из-за повреждения упаковки')
    """)


def downgrade() -> None:
    # Удаление данных из таблиц в обратном порядке
    op.execute("DELETE FROM stock_movements WHERE id BETWEEN 1 AND 20")
    op.execute("DELETE FROM shipments WHERE id BETWEEN 1 AND 15")
    op.execute("DELETE FROM orders WHERE id BETWEEN 1 AND 15")
    op.execute("DELETE FROM warehouses WHERE id BETWEEN 1 AND 11")