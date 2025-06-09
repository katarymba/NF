from datetime import datetime

"""add_delivery_tracking_columns_fix

Revision ID: e909b3edfd56
Revises: ae02b1dcf1f6
Create Date: 2025-05-06 20:29:58.580129

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e909b3edfd56'
down_revision: Union[str, None] = 'ae02b1dcf1f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Добавление полей для отслеживания доставки в таблицу orders"""
    
    # Проверяем существование колонок перед их добавлением
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('orders')]
    
    # Добавляем необходимые колонки для отслеживания доставки, если они еще не существуют
    if 'tracking_number' not in columns:
        op.add_column('orders', sa.Column('tracking_number', sa.String(50), nullable=True))
    if 'courier_name' not in columns:
        op.add_column('orders', sa.Column('courier_name', sa.String(100), nullable=True))
    if 'delivery_notes' not in columns:
        op.add_column('orders', sa.Column('delivery_notes', sa.Text(), nullable=True))
    if 'estimated_delivery' not in columns:
        op.add_column('orders', sa.Column('estimated_delivery', sa.Date(), nullable=True))
    if 'actual_delivery' not in columns:
        op.add_column('orders', sa.Column('actual_delivery', sa.DateTime(), nullable=True))
    if 'delivery_status' not in columns:
        op.add_column('orders', sa.Column('delivery_status', sa.String(30), nullable=True))
    
    # Создаем индексы только если они не существуют
    try:
        op.create_index(op.f('ix_orders_tracking_number'), 'orders', ['tracking_number'], unique=False)
    except Exception:
        pass
    
    try:
        op.create_index(op.f('ix_orders_courier_name'), 'orders', ['courier_name'], unique=False)
    except Exception:
        pass
    
    try:
        op.create_index(op.f('ix_orders_delivery_status'), 'orders', ['delivery_status'], unique=False)
    except Exception:
        pass


def downgrade() -> None:
    """Удаление полей отслеживания доставки из таблицы orders"""
    
    # Удаляем индексы, только если они существуют
    try:
        op.drop_index(op.f('ix_orders_tracking_number'), table_name='orders')
    except Exception:
        pass
    
    try:
        op.drop_index(op.f('ix_orders_courier_name'), table_name='orders')
    except Exception:
        pass
    
    try:
        op.drop_index(op.f('ix_orders_delivery_status'), table_name='orders')
    except Exception:
        pass
    
    # Удаляем колонки, только если они существуют
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('orders')]
    
    if 'delivery_status' in columns:
        op.drop_column('orders', 'delivery_status')
    if 'actual_delivery' in columns:
        op.drop_column('orders', 'actual_delivery')
    if 'estimated_delivery' in columns:
        op.drop_column('orders', 'estimated_delivery')
    if 'delivery_notes' in columns:
        op.drop_column('orders', 'delivery_notes')
    if 'courier_name' in columns:
        op.drop_column('orders', 'courier_name')
    if 'tracking_number' in columns:
        op.drop_column('orders', 'tracking_number')