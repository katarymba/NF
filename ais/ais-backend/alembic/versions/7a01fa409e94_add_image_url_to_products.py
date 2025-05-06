"""add_image_url_to_products

Revision ID: 7a01fa409e94
Revises: 3079b57da89a
Create Date: 2025-05-04 23:39:50.638043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a01fa409e94'
down_revision: Union[str, None] = '3079b57da89a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем столбец image_url в таблицу products
    op.add_column('products', sa.Column('image_url', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем столбец при откате
    op.drop_column('products', 'image_url')