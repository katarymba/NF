"""add_delivery_tracking_columns

Revision ID: 9e74e354be74
Revises: ae02b1dcf1f6
Create Date: 2025-05-06 20:07:56.750905

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e74e354be74'
down_revision: Union[str, None] = 'ae02b1dcf1f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Добавление полей для отслеживания доставки в таблицу orders"""
    
    # Добавляем необходимые колонки для отслеживания доставки
    op.add_column('orders', sa.Column('tracking_number', sa.String(50), nullable=True))
    op.add_column('orders', sa.Column('courier_name', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('delivery_notes', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('estimated_delivery', sa.Date(), nullable=True))
    op.add_column('orders', sa.Column('actual_delivery', sa.DateTime(), nullable=True))
    op.add_column('orders', sa.Column('delivery_status', sa.String(30), nullable=True))
    
    # Создаем индексы для оптимизации запросов по доставке
    op.create_index(op.f('ix_orders_tracking_number'), 'orders', ['tracking_number'], unique=False)
    op.create_index(op.f('ix_orders_courier_name'), 'orders', ['courier_name'], unique=False)
    op.create_index(op.f('ix_orders_delivery_status'), 'orders', ['delivery_status'], unique=False)


def downgrade() -> None:
    """Удаление полей отслеживания доставки из таблицы orders"""
    
    # Удаляем индексы
    op.drop_index(op.f('ix_orders_tracking_number'), table_name='orders')
    op.drop_index(op.f('ix_orders_courier_name'), table_name='orders')
    op.drop_index(op.f('ix_orders_delivery_status'), table_name='orders')
    
    # Удаляем колонки
    op.drop_column('orders', 'delivery_status')
    op.drop_column('orders', 'actual_delivery')
    op.drop_column('orders', 'estimated_delivery')
    op.drop_column('orders', 'delivery_notes')
    op.drop_column('orders', 'courier_name')
    op.drop_column('orders', 'tracking_number')