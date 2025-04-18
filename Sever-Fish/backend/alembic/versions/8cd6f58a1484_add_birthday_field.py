"""add_birthday_field

Revision ID: 8cd6f58a1484
Revises: 6c484cc5e712
Create Date: 2025-03-19 12:04:33.350956

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8cd6f58a1484'
down_revision: Union[str, None] = '6c484cc5e712'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Убираем попытки создания внешних ключей для cart
    # op.create_foreign_key(None, 'cart', 'users', ['user_id'], ['id'])
    # op.create_foreign_key(None, 'orders', 'users', ['user_id'], ['id'])

    # Оставляем только добавление колонки birthday
    op.add_column('users', sa.Column('birthday', sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'birthday')
    # op.drop_constraint(None, 'orders', type_='foreignkey')
    # op.drop_constraint(None, 'cart', type_='foreignkey')