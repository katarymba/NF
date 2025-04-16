"""add_birthday_column

Revision ID: 12dd9853ebb9
Revises: 60909076edb2
Create Date: 2025-04-11 20:58:04.552998

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12dd9853ebb9'
down_revision: Union[str, None] = '60909076edb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add birthday column as nullable (to not break existing records)
    op.add_column('users', sa.Column('birthday', sa.Date(), nullable=True))

def downgrade():
    op.drop_column('users', 'birthday')
