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
    # 1. Сначала очистим существующие данные в таблицах
    op.execute("DELETE FROM stock_movements")
    op.execute("DELETE FROM shipments")
    op.execute("DELETE FROM warehouses")
    
    # 2. Заполняем таблицу warehouses - типы складов: WAREHOUSE и STORE
    op.execute("""
    INSERT INTO warehouses (id, name, address, type, capacity, manager_name, phone, created_at)
    VALUES
        (1, 'ООО "Север-Рыба" Центральный склад', 'г. Шулма, ул. Портовая, 15', 'WAREHOUSE', 10000, 'Иванов Сергей Петрович', '+7(921)123-45-67', '2025-05-07 16:13:00'),
        (2, 'Оптовый склад', 'г. Череповец, ул. Гоголя, 88', 'WAREHOUSE', 8000, 'Петрова Елена Николаевна', '+7(921)234-56-78', '2025-05-07 16:13:00'),
        (3, 'Север-Рыба Устюженская', 'г. Череповец, ул. Устюженская, 8', 'STORE', 500, 'Смирнова Ольга Владимировна', '+7(921)345-67-89', '2025-05-07 16:13:00'),
        (4, 'Север-Рыба Горького', 'г. Череповец, ул. Максима Горького, 30', 'STORE', 450, 'Козлов Дмитрий Иванович', '+7(921)456-78-90', '2025-05-07 16:13:00'),
        (5, 'Север-Рыба Ленинградская', 'г. Череповец, ул. Ленинградская, 16', 'STORE', 400, 'Николаева Анна Сергеевна', '+7(921)567-89-01', '2025-05-07 16:13:00'),
        (6, 'Север-Рыба Октябрьский', 'г. Череповец, Октябрьский проспект, 49', 'STORE', 550, 'Васильев Игорь Александрович', '+7(921)678-90-12', '2025-05-07 16:13:00'),
        (7, 'Север-Рыба Победы', 'г. Череповец, Проспект Победы, 107', 'STORE', 480, 'Федорова Мария Алексеевна', '+7(921)789-01-23', '2025-05-07 16:13:00'),
        (8, 'Север-Рыба Пионерская', 'г. Череповец, ул. Пионерская, 21', 'STORE', 420, 'Алексеев Павел Дмитриевич', '+7(921)890-12-34', '2025-05-07 16:13:00'),
        (9, 'Север-Рыба Белинского', 'г. Череповец, ул. Белинского, 1/3 к2', 'STORE', 470, 'Морозова Екатерина Игоревна', '+7(921)901-23-45', '2025-05-07 16:13:00'),
        (10, 'Север-Рыба Краснодонцев', 'г. Череповец, ул. Краснодонцев, 110', 'STORE', 510, 'Соколов Артем Викторович', '+7(921)012-34-56', '2025-05-07 16:13:00'),
        (11, 'Север-Рыба Беляева', 'г. Череповец, ул. Космонавта Беляева, 29', 'STORE', 490, 'Лебедева Наталья Дмитриевна', '+7(921)123-45-67', '2025-05-07 16:13:00');
    """)
    
    # 3. Заполняем таблицу shipments
    op.execute("""
    INSERT INTO shipments (id, order_id, shipping_address, tracking_number, status, estimated_delivery)
    VALUES
        (1, 1, 'ул. Набережная 10, Москва', 'TRK03660847', 'in_transit', '2025-05-09 16:13:00'),
        (2, 3, 'ул. Центральная 20, Казань', 'TRK03660848', 'shipped', '2025-05-10 16:13:00'),
        (3, 4, 'ул. Морская 25, Сочи', 'TRK03660849', 'delivered', '2025-05-06 16:13:00'),
        (4, 7, 'пр. Морской 40, Мурманск', 'TRK03660850', 'shipped', '2025-05-11 16:13:00'),
        (5, 8, 'ул. Рыбацкая 45, Калининград', 'TRK03660851', 'delivered', '2025-05-05 16:13:00'),
        (6, 11, 'пр. Лососевый 60, Петропавловск-Камчатский', 'TRK03660852', 'shipped', '2025-05-13 16:13:00'),
        (7, 12, 'ул. Красная 65, Красноярск', 'TRK03660853', 'delivered', '2025-05-04 16:13:00'),
        (8, 15, 'пр. Невский 15, Санкт-Петербург', 'TRK03660854', 'shipped', '2025-05-08 16:13:00'),
        (9, 2, 'пр. Невский 15, Санкт-Петербург', 'TRK03660855', 'processing', '2025-05-12 16:13:00'),
        (10, 5, 'пр. Ленина 30, Новосибирск', 'TRK03660856', 'processing', '2025-05-12 16:13:00'),
        (11, 6, 'ул. Речная 35, Владивосток', 'TRK03660857', 'processing', '2025-05-14 16:13:00'),
        (12, 10, 'ул. Океанская 55, Хабаровск', 'TRK03660858', 'processing', '2025-05-13 16:13:00'),
        (13, 13, 'пр. Дальневосточный 70, Южно-Сахалинск', 'TRK03660859', 'pending', '2025-05-15 16:13:00'),
        (14, 9, 'пр. Приморский 50, Архангельск', 'TRK03660860', 'pending', '2025-05-14 16:13:00'),
        (15, 14, 'ул. Набережная 10, Москва', 'TRK03660861', 'processing', '2025-05-11 16:13:00');
    """)
    
    # 4. Заполняем таблицу stock_movements - типы движений: INCOMING, OUTGOING, TRANSFER
    # Разбиваем на несколько блоков для облегчения отладки
    
    # Поступления на центральный склад (INCOMING)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (1, 1, 1, 100, 'INCOMING', NULL, NULL, '2025-04-07 16:13:00', 1, 'Первичное поступление от поставщика'),
        (2, 2, 1, 200, 'INCOMING', NULL, NULL, '2025-04-07 16:13:00', 1, 'Первичное поступление от поставщика'),
        (3, 3, 1, 150, 'INCOMING', NULL, NULL, '2025-04-08 16:13:00', 1, 'Первичное поступление от поставщика'),
        (4, 4, 1, 120, 'INCOMING', NULL, NULL, '2025-04-08 16:13:00', 1, 'Первичное поступление от поставщика');
    """)
    
    # Перемещения с центрального склада на оптовый (TRANSFER)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (5, 1, 2, 50, 'TRANSFER', 1, 2, '2025-04-12 16:13:00', 1, 'Перемещение для наполнения оптового склада'),
        (6, 2, 2, 80, 'TRANSFER', 1, 2, '2025-04-12 16:13:00', 1, 'Перемещение для наполнения оптового склада'),
        (7, 3, 2, 60, 'TRANSFER', 1, 2, '2025-04-13 16:13:00', 1, 'Перемещение для наполнения оптового склада'),
        (8, 4, 2, 40, 'TRANSFER', 1, 2, '2025-04-13 16:13:00', 1, 'Перемещение для наполнения оптового склада');
    """)
    
    # Перемещения с оптового склада в магазины (TRANSFER)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (9, 1, 3, 10, 'TRANSFER', 2, 3, '2025-04-17 16:13:00', 2, 'Поставка в розничный магазин'),
        (10, 2, 3, 15, 'TRANSFER', 2, 3, '2025-04-17 16:13:00', 2, 'Поставка в розничный магазин'),
        (11, 1, 4, 8, 'TRANSFER', 2, 4, '2025-04-18 16:13:00', 2, 'Поставка в розничный магазин'),
        (12, 3, 4, 12, 'TRANSFER', 2, 4, '2025-04-18 16:13:00', 2, 'Поставка в розничный магазин');
    """)
    
    # Продажи из магазинов (OUTGOING)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (13, 1, 3, 5, 'OUTGOING', 3, NULL, '2025-04-22 16:13:00', 3, 'Продажа клиенту'),
        (14, 2, 3, 7, 'OUTGOING', 3, NULL, '2025-04-23 16:13:00', 3, 'Продажа клиенту');
    """)
    
    # Дополнительные перемещения из центрального склада в магазины (TRANSFER)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (15, 2, 5, 20, 'TRANSFER', 1, 5, '2025-04-19 16:13:00', 1, 'Прямая поставка с центрального склада'),
        (16, 3, 6, 18, 'TRANSFER', 1, 6, '2025-04-20 16:13:00', 1, 'Прямая поставка с центрального склада'),
        (17, 4, 7, 15, 'TRANSFER', 1, 7, '2025-04-21 16:13:00', 1, 'Прямая поставка с центрального склада');
    """)
    
    # Дополнительные поступления на центральный склад (INCOMING)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (18, 1, 1, 50, 'INCOMING', NULL, NULL, '2025-04-27 16:13:00', 1, 'Дополнительное поступление от поставщика');
    """)
    
    # Списания товаров (OUTGOING)
    op.execute("""
    INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, source_warehouse_id, target_warehouse_id, created_at, created_by_id, note)
    VALUES
        (19, 2, 2, 5, 'OUTGOING', 2, NULL, '2025-04-29 16:13:00', 2, 'Списание из-за истечения срока годности'),
        (20, 3, 11, 2, 'OUTGOING', 11, NULL, '2025-05-02 16:13:00', 11, 'Списание из-за повреждения упаковки');
    """)

def downgrade() -> None:
    # Удаление данных из таблиц в обратном порядке
    op.execute("DELETE FROM stock_movements")
    op.execute("DELETE FROM shipments")
    op.execute("DELETE FROM warehouses")