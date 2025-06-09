"""add_quantity_ordered_to_supply_items

Revision ID: 1426a01a1a2b
Revises: e81effd9991a
Create Date: 2025-05-29 12:45:45.278568

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1426a01a1a2b'
down_revision: Union[str, None] = 'e81effd9991a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('supply_items', sa.Column('quantity_ordered', sa.Integer(), nullable=False, server_default='0'))
    
# And this to the downgrade function:
def downgrade() -> None:
    op.drop_column('supply_items', 'quantity_ordered')
    