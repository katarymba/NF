"""add_missing_supply_items_columns

Revision ID: bc02f5348534
Revises: 1426a01a1a2b
Create Date: 2025-05-29 14:30:21.609217

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc02f5348534'
down_revision: Union[str, None] = '1426a01a1a2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add warehouse_id column
    op.add_column('supply_items', sa.Column('warehouse_id', sa.Integer(), nullable=True))
    
    # Set warehouse_id for existing supply_items based on their supply's warehouse_id
    op.execute("""
        UPDATE supply_items 
        SET warehouse_id = supplies.warehouse_id 
        FROM supplies 
        WHERE supply_items.supply_id = supplies.id
    """)
    
    # Now make warehouse_id NOT NULL
    op.alter_column('supply_items', 'warehouse_id', nullable=False)
    
    # Add other missing columns - Using Boolean for is_received (better approach)
    op.add_column('supply_items', sa.Column('is_received', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('supply_items', sa.Column('received_date', sa.DateTime(), nullable=True))
    op.add_column('supply_items', sa.Column('notes', sa.Text(), nullable=True))
    
    # Create foreign key constraint for warehouse_id
    op.create_foreign_key(
        'supply_items_warehouse_id_fkey', 
        'supply_items', 
        'warehouses', 
        ['warehouse_id'], 
        ['id'], 
        ondelete='CASCADE'
    )
    
    # Remove the redundant quantity column
    op.drop_column('supply_items', 'quantity')

def downgrade() -> None:
    op.add_column('supply_items', sa.Column('quantity', sa.Float(), nullable=False, server_default='0'))
    op.drop_constraint('supply_items_warehouse_id_fkey', 'supply_items', type_='foreignkey')
    op.drop_column('supply_items', 'notes')
    op.drop_column('supply_items', 'received_date')
    op.drop_column('supply_items', 'is_received')
    op.drop_column('supply_items', 'warehouse_id')
    