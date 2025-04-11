"""add_missing_user_fields

Revision ID: 60909076edb2
Revises: abee15aa05cd
Create Date: 2025-04-11 20:46:57.522195

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '60909076edb2'
down_revision: Union[str, None] = 'abee15aa05cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add missing columns to users table
    op.add_column('users', sa.Column('phone', sa.String(), nullable=False))
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Create a unique index on phone to ensure uniqueness
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)

    # Remove the role column if you decide to go that route
    # op.drop_column('users', 'role')

    # You might need to populate the phone field with default values
    # for existing users, since we're making it non-nullable


def downgrade():
    # Drop added columns for rollback
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'is_active')
