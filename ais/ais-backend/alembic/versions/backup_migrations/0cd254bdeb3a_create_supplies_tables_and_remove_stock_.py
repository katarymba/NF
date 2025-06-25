from datetime import datetime

"""create_supplies_tables_and_remove_stock_quantity

Revision ID: 0cd254bdeb3a
Revises: 19f1afeaea78
Create Date: 2025-05-08 19:40:00.565945

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cd254bdeb3a'
down_revision: Union[str, None] = '19f1afeaea78'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create supplies table
    op.create_table(
        'supplies',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('supplier', sa.String(length=100), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='planned'),
        sa.Column('shipment_date', sa.DateTime(), nullable=False),
        sa.Column('expected_arrival_date', sa.DateTime(), nullable=True),
        sa.Column('actual_arrival_date', sa.DateTime(), nullable=True),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on supplier and status for faster searches
    op.create_index(op.f('ix_supplies_supplier'), 'supplies', ['supplier'], unique=False)
    op.create_index(op.f('ix_supplies_status'), 'supplies', ['status'], unique=False)

    # Create supply_items table
    op.create_table(
        'supply_items',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('supply_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('product_name', sa.String(length=255), nullable=False),
        sa.Column('quantity_ordered', sa.Integer(), nullable=False),
        sa.Column('quantity_received', sa.Integer(), nullable=True),
        sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=False),  # Changed to Integer to match warehouses.id
        sa.Column('is_received', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('received_date', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['supply_id'], ['supplies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on supply_id for faster lookups
    op.create_index(op.f('ix_supply_items_supply_id'), 'supply_items', ['supply_id'], unique=False)

    # Remove stock_quantity column from products table
    op.drop_column('products', 'stock_quantity')


def downgrade():
    # Add stock_quantity column back to products table
    op.add_column('products', sa.Column('stock_quantity', sa.Integer(), nullable=True, server_default='0'))

    # Drop supply_items table
    op.drop_table('supply_items')

    # Drop supplies table
    op.drop_table('supplies')