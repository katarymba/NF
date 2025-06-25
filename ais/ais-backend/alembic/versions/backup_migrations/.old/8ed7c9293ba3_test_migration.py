"""test_migration

Revision ID: 8ed7c9293ba3
Revises: 612e7ec9e24f
Create Date: 2025-04-16 21:53:38.034006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ed7c9293ba3'
down_revision: Union[str, None] = '612e7ec9e24f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
