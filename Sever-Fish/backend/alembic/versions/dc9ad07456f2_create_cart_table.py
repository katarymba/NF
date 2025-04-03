"""create_cart_table

Revision ID: dc9ad07456f2
Revises: c9f130569441
Create Date: 2025-04-03 18:20:37.766310

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc9ad07456f2'
down_revision: Union[str, None] = '8cd6f58a1484'  # Изменено с 'c9f130569441' на '8cd6f58a1484'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Создание таблицы cart."""
    op.create_table('cart',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('user_id', sa.Integer(), nullable=False),
                    sa.Column('product_id', sa.Integer(), nullable=False),
                    sa.Column('quantity', sa.Integer(), nullable=True, default=1),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_cart_id'), 'cart', ['id'], unique=False)

    # Добавляем внешние ключи отдельно, так как они пытались быть добавлены в миграции 8cd6f58a1484
    op.create_foreign_key(None, 'cart', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'cart', 'products', ['product_id'], ['id'])


def downgrade() -> None:
    """Удаление таблицы cart."""
    op.drop_index(op.f('ix_cart_id'), table_name='cart')
    op.drop_table('cart')