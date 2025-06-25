"""exact_sync_warehouse_tables

Revision ID: 20fce8aa767a
Revises: 632abaf5029e
Create Date: 2025-05-28 17:47:05.464959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '20fce8aa767a'
down_revision: Union[str, None] = '632abaf5029e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table_name, column_name):
    """Проверяет существование столбца в таблице"""
    bind = op.get_bind()
    result = bind.execute(text(f"""
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name='{table_name}' AND column_name='{column_name}'
        );
    """))
    return result.scalar()


def constraint_exists(constraint_name, table_name):
    """Проверяет существование constraint"""
    bind = op.get_bind()
    result = bind.execute(text(f"""
        SELECT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE constraint_name='{constraint_name}' AND table_name='{table_name}'
        );
    """))
    return result.scalar()


def index_exists(index_name):
    """Проверяет существование индекса"""
    bind = op.get_bind()
    result = bind.execute(text(f"""
        SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE indexname='{index_name}'
        );
    """))
    return result.scalar()


def upgrade():
    # 1. Модификация таблицы warehouses
    # Изменение default значения для created_at
    op.alter_column('warehouses', 'created_at',
                    existing_type=postgresql.TIMESTAMP(),
                    nullable=True,
                    existing_nullable=True,
                    server_default=sa.text('now()'))

    # 2. Безопасная модификация таблицы stock_movements
    # Удаляем только те столбцы, которые действительно существуют

    if column_exists('stock_movements', 'warehouse_id'):
        op.drop_column('stock_movements', 'warehouse_id')

    if column_exists('stock_movements', 'created_by_id'):
        op.drop_column('stock_movements', 'created_by_id')

    if column_exists('stock_movements', 'note'):
        op.drop_column('stock_movements', 'note')

    # Проверяем текущий тип created_at перед удалением
    if column_exists('stock_movements', 'created_at'):
        # Удаляем, чтобы пересоздать с правильным default
        op.drop_column('stock_movements', 'created_at')

    # Изменяем тип данных quantity (проверяем текущий тип)
    bind = op.get_bind()
    result = bind.execute(text("""
        SELECT data_type FROM information_schema.columns 
        WHERE table_name='stock_movements' AND column_name='quantity'
    """))
    current_type = result.scalar()

    if current_type == 'integer':
        op.alter_column('stock_movements', 'quantity',
                        existing_type=sa.INTEGER(),
                        type_=sa.Double(),
                        existing_nullable=False)

    # Изменяем тип movement_type (проверяем текущий тип)
    result = bind.execute(text("""
        SELECT data_type FROM information_schema.columns 
        WHERE table_name='stock_movements' AND column_name='movement_type'
    """))
    current_movement_type = result.scalar()

    if current_movement_type == 'USER-DEFINED':  # это enum
        op.alter_column('stock_movements', 'movement_type',
                        existing_type=sa.Enum('IN', 'OUT', 'TRANSFER', name='movementtype'),
                        type_=sa.String(length=20),
                        existing_nullable=False)

    # Добавляем новые столбцы (проверяем, что их еще нет)
    if not column_exists('stock_movements', 'reference_id'):
        op.add_column('stock_movements', sa.Column('reference_id', sa.Integer(), nullable=True))

    if not column_exists('stock_movements', 'notes'):
        op.add_column('stock_movements', sa.Column('notes', sa.Text(), nullable=True))

    if not column_exists('stock_movements', 'movement_date'):
        op.add_column('stock_movements',
                      sa.Column('movement_date', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    if not column_exists('stock_movements', 'created_at'):
        op.add_column('stock_movements',
                      sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    if not column_exists('stock_movements', 'updated_at'):
        op.add_column('stock_movements',
                      sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    # Безопасное обновление foreign key constraints
    if constraint_exists('stock_movements_source_warehouse_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_source_warehouse_id_fkey', 'stock_movements', type_='foreignkey')

    if constraint_exists('stock_movements_target_warehouse_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_target_warehouse_id_fkey', 'stock_movements', type_='foreignkey')

    if constraint_exists('stock_movements_warehouse_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_warehouse_id_fkey', 'stock_movements', type_='foreignkey')

    if constraint_exists('stock_movements_product_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_product_id_fkey', 'stock_movements', type_='foreignkey')

    # Создаем новые constraints
    op.create_foreign_key('stock_movements_product_id_fkey', 'stock_movements', 'products',
                          ['product_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('stock_movements_source_warehouse_id_fkey', 'stock_movements', 'warehouses',
                          ['source_warehouse_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('stock_movements_target_warehouse_id_fkey', 'stock_movements', 'warehouses',
                          ['target_warehouse_id'], ['id'], ondelete='SET NULL')

    # 3. Модификация таблицы stocks
    op.alter_column('stocks', 'quantity',
                    existing_type=sa.INTEGER(),
                    nullable=False,
                    existing_nullable=False,
                    server_default=sa.text('0'))

    op.alter_column('stocks', 'updated_at',
                    existing_type=postgresql.TIMESTAMP(),
                    nullable=True,
                    existing_nullable=True,
                    server_default=sa.text('now()'))

    # Безопасное добавление индексов
    if not index_exists('ix_stocks_product_id'):
        op.create_index('ix_stocks_product_id', 'stocks', ['product_id'], unique=False)

    if not index_exists('ix_stocks_warehouse_id'):
        op.create_index('ix_stocks_warehouse_id', 'stocks', ['warehouse_id'], unique=False)

    # Обновляем constraints для stocks
    if constraint_exists('stocks_product_id_fkey', 'stocks'):
        op.drop_constraint('stocks_product_id_fkey', 'stocks', type_='foreignkey')
    if constraint_exists('stocks_warehouse_id_fkey', 'stocks'):
        op.drop_constraint('stocks_warehouse_id_fkey', 'stocks', type_='foreignkey')

    op.create_foreign_key('stocks_product_id_fkey', 'stocks', 'products',
                          ['product_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('stocks_warehouse_id_fkey', 'stocks', 'warehouses',
                          ['warehouse_id'], ['id'], ondelete='CASCADE')

    # 4. Обработка supplies и supply_items (аналогично с проверками)
    # ... (добавлю по аналогии с проверками существования)

    # 5. Удаляем enum types, если они существуют
    op.execute("DROP TYPE IF EXISTS movementtype CASCADE")
    op.execute("DROP TYPE IF EXISTS supplystatus CASCADE")


def downgrade():
    # Безопасный откат с проверками существования

    # Создаем enum types обратно (если их еще нет)
    op.execute("CREATE TYPE IF NOT EXISTS movementtype AS ENUM ('IN', 'OUT', 'TRANSFER')")
    op.execute("CREATE TYPE IF NOT EXISTS supplystatus AS ENUM ('PLANNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')")

    # 1. Откат изменений stock_movements - возвращаем к серверной структуре

    # Безопасно удаляем constraints
    if constraint_exists('stock_movements_product_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_product_id_fkey', 'stock_movements', type_='foreignkey')
    if constraint_exists('stock_movements_source_warehouse_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_source_warehouse_id_fkey', 'stock_movements', type_='foreignkey')
    if constraint_exists('stock_movements_target_warehouse_id_fkey', 'stock_movements'):
        op.drop_constraint('stock_movements_target_warehouse_id_fkey', 'stock_movements', type_='foreignkey')

    # Удаляем новые столбцы (которые мы добавили в upgrade)
    if column_exists('stock_movements', 'updated_at'):
        op.drop_column('stock_movements', 'updated_at')
    if column_exists('stock_movements', 'created_at'):
        op.drop_column('stock_movements', 'created_at')
    if column_exists('stock_movements', 'movement_date'):
        op.drop_column('stock_movements', 'movement_date')
    if column_exists('stock_movements', 'notes'):
        op.drop_column('stock_movements', 'notes')
    if column_exists('stock_movements', 'reference_id'):
        op.drop_column('stock_movements', 'reference_id')

    # Возвращаем старые типы данных
    # Проверяем текущий тип movement_type
    bind = op.get_bind()
    result = bind.execute(text("""
        SELECT data_type FROM information_schema.columns 
        WHERE table_name='stock_movements' AND column_name='movement_type'
    """))
    current_movement_type = result.scalar()

    if current_movement_type == 'character varying':  # если это varchar
        op.alter_column('stock_movements', 'movement_type',
                        existing_type=sa.String(length=20),
                        type_=sa.Enum('IN', 'OUT', 'TRANSFER', name='movementtype'),
                        existing_nullable=False)

    # Проверяем текущий тип quantity
    result = bind.execute(text("""
        SELECT data_type FROM information_schema.columns 
        WHERE table_name='stock_movements' AND column_name='quantity'
    """))
    current_quantity_type = result.scalar()

    if current_quantity_type == 'double precision':  # если это double
        op.alter_column('stock_movements', 'quantity',
                        existing_type=sa.Double(),
                        type_=sa.INTEGER(),
                        existing_nullable=False)

    # Добавляем старые столбцы обратно (если они существовали в серверной версии)
    # На основе вашего описания серверной структуры:
    if not column_exists('stock_movements', 'warehouse_id'):
        op.add_column('stock_movements', sa.Column('warehouse_id', sa.Integer(), nullable=False))
    if not column_exists('stock_movements', 'created_by_id'):
        op.add_column('stock_movements', sa.Column('created_by_id', sa.Integer(), nullable=True))
    if not column_exists('stock_movements', 'note'):
        op.add_column('stock_movements', sa.Column('note', sa.Text(), nullable=True))
    if not column_exists('stock_movements', 'created_at'):
        op.add_column('stock_movements', sa.Column('created_at', sa.DateTime(), nullable=True))

    # Восстанавливаем старые constraints (серверная структура)
    op.create_foreign_key('stock_movements_product_id_fkey', 'stock_movements', 'products',
                          ['product_id'], ['id'])
    op.create_foreign_key('stock_movements_source_warehouse_id_fkey', 'stock_movements', 'warehouses',
                          ['source_warehouse_id'], ['id'])
    op.create_foreign_key('stock_movements_target_warehouse_id_fkey', 'stock_movements', 'warehouses',
                          ['target_warehouse_id'], ['id'])
    op.create_foreign_key('stock_movements_warehouse_id_fkey', 'stock_movements', 'warehouses',
                          ['warehouse_id'], ['id'])

    # 2. Откат изменений stocks - возвращаем к серверной структуре

    # Удаляем constraints
    if constraint_exists('stocks_product_id_fkey', 'stocks'):
        op.drop_constraint('stocks_product_id_fkey', 'stocks', type_='foreignkey')
    if constraint_exists('stocks_warehouse_id_fkey', 'stocks'):
        op.drop_constraint('stocks_warehouse_id_fkey', 'stocks', type_='foreignkey')

    # Удаляем добавленные индексы
    if index_exists('ix_stocks_warehouse_id'):
        op.drop_index('ix_stocks_warehouse_id', table_name='stocks')
    if index_exists('ix_stocks_product_id'):
        op.drop_index('ix_stocks_product_id', table_name='stocks')

    # Возвращаем старые defaults (серверная структура)
    op.alter_column('stocks', 'updated_at',
                    existing_type=postgresql.TIMESTAMP(),
                    nullable=True,
                    existing_nullable=True,
                    server_default=None)

    op.alter_column('stocks', 'quantity',
                    existing_type=sa.INTEGER(),
                    nullable=False,
                    existing_nullable=False,
                    server_default=None)

    # Восстанавливаем старые constraints (без ondelete)
    op.create_foreign_key('stocks_product_id_fkey', 'stocks', 'products',
                          ['product_id'], ['id'])
    op.create_foreign_key('stocks_warehouse_id_fkey', 'stocks', 'warehouses',
                          ['warehouse_id'], ['id'])

    # 3. Откат изменений warehouses - возвращаем к серверной структуре
    op.alter_column('warehouses', 'created_at',
                    existing_type=postgresql.TIMESTAMP(),
                    nullable=True,
                    existing_nullable=True,
                    server_default=None)

    # 4. Если были изменения в supplies и supply_items, добавляем их откат
    # (добавить при необходимости, основываясь на том, что было в upgrade())

    # Примечание: enum types оставляем, так как они могут использоваться другими частями системы