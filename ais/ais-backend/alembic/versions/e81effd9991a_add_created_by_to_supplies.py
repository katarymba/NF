"""add_created_by_to_supplies

Revision ID: e81effd9991a
Revises: 20fce8aa767a
Create Date: 2025-05-29 11:54:56.745979

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e81effd9991a'
down_revision: Union[str, None] = '20fce8aa767a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Добавляет столбец created_by в таблицу supplies
    """
    # Добавляем столбец created_by
    op.add_column('supplies', sa.Column('created_by', sa.String(length=100), nullable=False, server_default='system'))

    # Создаем индекс для быстрого поиска по пользователю
    op.create_index(op.f('ix_supplies_created_by'), 'supplies', ['created_by'], unique=False)


def downgrade() -> None:
    """
    Удаляет столбец created_by из таблицы supplies
    """
    # Удаляем индекс
    op.drop_index(op.f('ix_supplies_created_by'), table_name='supplies')

    # Удаляем столбец
    op.drop_column('supplies', 'created_by')
