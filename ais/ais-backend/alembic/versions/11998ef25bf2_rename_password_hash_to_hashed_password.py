"""rename password_hash to hashed_password

Revision ID: 11998ef25bf2
Revises: 371f831bbbeb
Create Date: 2025-02-24 01:49:28.859113

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11998ef25bf2'
down_revision: Union[str, None] = '371f831bbbeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
