"""sync_docker_tables_with_local_schema

Revision ID: 632abaf5029e
Revises: ce2e325031be
Create Date: 2025-05-26 17:01:40.217041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = '632abaf5029e'
down_revision: Union[str, None] = 'ce2e325031be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Изменения в таблице orders
    
    # 1.1 Переименование колонок
    op.alter_column('orders', 'total_amount', new_column_name='total_price')
    op.alter_column('orders', 'phone', new_column_name='contact_phone')
    op.alter_column('orders', 'name', new_column_name='client_name')
    op.alter_column('orders', 'comment', new_column_name='delivery_notes')
    
    # 1.2 Добавление отсутствующих колонок
    op.add_column('orders', sa.Column('tracking_number', sa.String(50), nullable=True))
    op.add_column('orders', sa.Column('courier_name', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('estimated_delivery', sa.Date(), nullable=True))
    op.add_column('orders', sa.Column('actual_delivery', sa.DateTime(), nullable=True))
    op.add_column('orders', sa.Column('delivery_status', sa.String(30), nullable=True))
    op.add_column('orders', sa.Column('order_items', JSONB(), nullable=True))
    
    # 1.3 Добавление индексов
    op.create_index(op.f('ix_orders_courier_name'), 'orders', ['courier_name'], unique=False)
    op.create_index(op.f('ix_orders_delivery_status'), 'orders', ['delivery_status'], unique=False)
    op.create_index(op.f('ix_orders_tracking_number'), 'orders', ['tracking_number'], unique=False)
    
    # 1.4 Удаление колонок, которых нет в локальной БД
    op.drop_column('orders', 'email')
    
    # 2. Изменения в таблице order_items
    
    # 2.1 Переименование колонок
    op.alter_column('order_items', 'unit_price', new_column_name='price')
    
    # 2.2 Изменение типа колонки quantity с double precision на integer
    op.execute('ALTER TABLE order_items ALTER COLUMN quantity TYPE integer USING quantity::integer')
    
    # 2.3 Удаление колонок, которых нет в локальной БД
    op.drop_column('order_items', 'product_name')


def downgrade():
    # 1. Откат изменений в таблице order_items
    
    # 1.1 Восстановление удаленных колонок
    op.add_column('order_items', sa.Column('product_name', sa.String(), nullable=True))
    
    # 1.2 Возврат типа колонки quantity
    op.execute('ALTER TABLE order_items ALTER COLUMN quantity TYPE double precision')
    
    # 1.3 Восстановление исходных имен колонок
    op.alter_column('order_items', 'price', new_column_name='unit_price')
    
    # 2. Откат изменений в таблице orders
    
    # 2.1 Восстановление удаленных колонок
    op.add_column('orders', sa.Column('email', sa.String(100), nullable=True))
    
    # 2.2 Удаление добавленных индексов
    op.drop_index(op.f('ix_orders_tracking_number'), table_name='orders')
    op.drop_index(op.f('ix_orders_delivery_status'), table_name='orders')
    op.drop_index(op.f('ix_orders_courier_name'), table_name='orders')
    
    # 2.3 Удаление добавленных колонок
    op.drop_column('orders', 'order_items')
    op.drop_column('orders', 'delivery_status')
    op.drop_column('orders', 'actual_delivery')
    op.drop_column('orders', 'estimated_delivery')
    op.drop_column('orders', 'courier_name')
    op.drop_column('orders', 'tracking_number')
    
    # 2.4 Восстановление исходных имен колонок
    op.alter_column('orders', 'delivery_notes', new_column_name='comment')
    op.alter_column('orders', 'client_name', new_column_name='name')
    op.alter_column('orders', 'contact_phone', new_column_name='phone')
    op.alter_column('orders', 'total_price', new_column_name='total_amount')
    