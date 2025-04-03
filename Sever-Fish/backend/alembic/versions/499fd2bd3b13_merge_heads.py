"""merge_heads

Revision ID: 499fd2bd3b13
Revises: c9f130569441, dc9ad07456f2
Create Date: 2025-04-03 18:32:40.267166

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '499fd2bd3b13'
down_revision: Union[str, None] = ('c9f130569441', 'dc9ad07456f2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
