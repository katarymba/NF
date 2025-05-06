"""add delivery fields to orders

Revision ID: a1b2c3d4e5f6
Revises: previous_revision_id
Create Date: 2025-05-06 16:20:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'previous_revision_id'  # Укажите ID вашей предыдущей миграции
branch_labels = None
depends_on = None

def upgrade():
    # Проверяем, существуют ли уже колонки перед их добавлением
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('orders')]
    
    if 'tracking_number' not in columns:
        op.add_column('orders', sa.Column('tracking_number', sa.String(50), nullable=True))
    
    if 'courier_name' not in columns:
        op.add_column('orders', sa.Column('courier_name', sa.String(100), nullable=True))
    
    if 'delivery_notes' not in columns:
        op.add_column('orders', sa.Column('delivery_notes', sa.Text(), nullable=True))
    
    if 'estimated_delivery' not in columns:
        op.add_column('orders', sa.Column('estimated_delivery', sa.Date(), nullable=True))

def downgrade():
    op.drop_column('orders', 'tracking_number')
    op.drop_column('orders', 'courier_name')
    op.drop_column('orders', 'delivery_notes')
    op.drop_column('orders', 'estimated_delivery')