"""add_user_fields_fixed

Revision ID: 612e7ec9e24f
Revises: 12dd9853ebb9
Create Date: 2025-04-16 18:51:30

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '612e7ec9e24f'
down_revision = '12dd9853ebb9'  # Изменяем на текущую голову
branch_labels = None
depends_on = None


def upgrade():
    # Поля уже добавлены через SQL
    pass


def downgrade():
    # Операции для отката, если понадобится
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'phone')