"""add_product_name_to_order_item

Revision ID: ce2e325031be
Revises: 458fca4f9a75
Create Date: 2025-05-23 13:37:07.631102

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce2e325031be'
down_revision: Union[str, None] = '458fca4f9a75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('order_items', sa.Column('product_name', sa.String(), nullable=True))

def downgrade():
    op.drop_column('order_items', 'product_name')
