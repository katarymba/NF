"""add_order_delivery_fields

Revision ID: 458fca4f9a75
Revises: ce3a411280dc
Create Date: 2025-05-23 13:22:00.981761

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '458fca4f9a75'
down_revision: Union[str, None] = 'ce3a411280dc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Добавляем новые поля в таблицу orders
    op.add_column('orders', sa.Column('delivery_address', sa.String(255), nullable=True))
    op.add_column('orders', sa.Column('phone', sa.String(20), nullable=True))
    op.add_column('orders', sa.Column('email', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('name', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('comment', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('payment_method', sa.String(50), server_default='cash', nullable=True))


def downgrade():
    # Удаляем поля при откате
    op.drop_column('orders', 'payment_method')
    op.drop_column('orders', 'comment')
    op.drop_column('orders', 'name')
    op.drop_column('orders', 'email')
    op.drop_column('orders', 'phone')
    op.drop_column('orders', 'delivery_address')
