"""Initial database setup

Revision ID: ce3a411280dc
Revises: 
Create Date: 2025-05-20 05:40:49.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import enum
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ce3a411280dc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Создание ENUM типа через Alembic операции
    warehouse_type = postgresql.ENUM('WAREHOUSE', 'STORE', name='warehousetype', create_type=False)
    warehouse_type.create(op.get_bind(), checkfirst=True)

    # Создание таблицы administrators
    op.create_table('administrators',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=128), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=True),
        sa.Column('role', sa.String(length=20), server_default='admin', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('permissions', sa.String(length=255), nullable=True),
        sa.Column('position', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_administrators_email'), 'administrators', ['email'], unique=False)
    op.create_index(op.f('ix_administrators_id'), 'administrators', ['id'], unique=False)
    op.create_index(op.f('ix_administrators_username'), 'administrators', ['username'], unique=False)

    # Создание последовательности для warehouses
    op.execute(sa.schema.CreateSequence(sa.Sequence('warehouses_id_seq')))

    # Создание таблицы warehouses
    op.create_table('warehouses',
        sa.Column('id', sa.Integer(), sa.Sequence('warehouses_id_seq'), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('type', postgresql.ENUM('WAREHOUSE', 'STORE', name='warehousetype', create_type=False), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('manager_name', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_warehouses_id'), 'warehouses', ['id'], unique=False)

    # Создание таблицы categories
    op.create_table('categories',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=100), nullable=False),
                    sa.Column('description', sa.Text(), nullable=True),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.Column('image_url', sa.String(length=255), nullable=True),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.ForeignKeyConstraint(['parent_id'], ['categories.id'], ondelete='SET NULL'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)

    # Создание таблицы products
    op.create_table('products',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=100), nullable=False),
                    sa.Column('description', sa.Text(), nullable=True),
                    sa.Column('category_id', sa.Integer(), nullable=True),
                    sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'),
                    sa.Column('image_url', sa.String(length=255), nullable=True),
                    sa.Column('sku', sa.String(length=50), nullable=True),
                    sa.Column('weight', sa.Float(), nullable=True),
                    sa.Column('unit', sa.String(length=20), nullable=True),
                    sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)

    # Создание последовательности stocks_id_seq
    op.execute('CREATE SEQUENCE IF NOT EXISTS stocks_id_seq')

    # Создание таблицы stocks
    op.create_table('stocks',
                    sa.Column('id', sa.Integer(), nullable=False, server_default=sa.text('nextval(\'stocks_id_seq\')')),
                    sa.Column('product_id', sa.Integer(), nullable=False),
                    sa.Column('warehouse_id', sa.Integer(), nullable=False),
                    sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
                    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_stocks_id'), 'stocks', ['id'], unique=False)
    op.create_index(op.f('ix_stocks_product_id'), 'stocks', ['product_id'], unique=False)
    op.create_index(op.f('ix_stocks_warehouse_id'), 'stocks', ['warehouse_id'], unique=False)

    # Создание таблицы suppliers
    op.create_table('suppliers',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=100), nullable=False),
                    sa.Column('contact_person', sa.String(length=100), nullable=True),
                    sa.Column('email', sa.String(length=100), nullable=True),
                    sa.Column('phone', sa.String(length=20), nullable=True),
                    sa.Column('address', sa.Text(), nullable=True),
                    sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('name')
                    )
    op.create_index(op.f('ix_suppliers_id'), 'suppliers', ['id'], unique=False)

    # Создание таблицы users если её еще нет
    # В этой реализации, мы проверяем существование таблицы перед созданием
    op.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(200) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        birthday DATE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
    )
    """)

    # Добавление индексов для users, если таблица была создана
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_id ON users (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone)")

    # Создание таблицы supplies
    op.create_table('supplies',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('supplier_id', sa.Integer(), nullable=False),
                    sa.Column('warehouse_id', sa.Integer(), nullable=False),
                    sa.Column('order_date', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('expected_delivery', sa.DateTime(), nullable=True),
                    sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
                    sa.Column('total_amount', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
                    sa.Column('notes', sa.Text(), nullable=True),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_supplies_id'), 'supplies', ['id'], unique=False)

    # Создание таблицы supply_items
    op.create_table('supply_items',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('supply_id', sa.Integer(), nullable=False),
                    sa.Column('product_id', sa.Integer(), nullable=False),
                    sa.Column('quantity', sa.Float(), nullable=False),
                    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.ForeignKeyConstraint(['supply_id'], ['supplies.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_supply_items_id'), 'supply_items', ['id'], unique=False)

    # Создание таблицы stock_movements
    op.create_table('stock_movements',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('product_id', sa.Integer(), nullable=False),
                    sa.Column('source_warehouse_id', sa.Integer(), nullable=True),
                    sa.Column('target_warehouse_id', sa.Integer(), nullable=True),
                    sa.Column('quantity', sa.Float(), nullable=False),
                    sa.Column('movement_type', sa.String(length=20), nullable=False),
                    sa.Column('reference_id', sa.Integer(), nullable=True),
                    sa.Column('notes', sa.Text(), nullable=True),
                    sa.Column('movement_date', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
                    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['source_warehouse_id'], ['warehouses.id'], ondelete='SET NULL'),
                    sa.ForeignKeyConstraint(['target_warehouse_id'], ['warehouses.id'], ondelete='SET NULL'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_stock_movements_id'), 'stock_movements', ['id'], unique=False)

    # Создание таблиц для заказов, если их еще нет
    op.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
        total_amount FLOAT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_orders_id ON orders (id)")

    op.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity FLOAT NOT NULL,
        unit_price FLOAT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_order_items_id ON order_items (id)")

    # Создание таблицы для корзины
    op.execute("""
    CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_cart_items_id ON cart_items (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_cart_items_user_id ON cart_items (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_cart_items_product_id ON cart_items (product_id)")


def downgrade():
    # Удаление таблиц в правильном порядке
    op.drop_table('cart_items', if_exists=True)
    op.drop_table('order_items', if_exists=True)
    op.drop_table('orders', if_exists=True)
    op.drop_table('stock_movements')
    op.drop_table('supply_items')
    op.drop_table('supplies')
    op.drop_table('suppliers')
    op.drop_table('stocks')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('warehouses')
    op.drop_table('administrators')

    # Удаление последовательностей
    op.execute(sa.schema.DropSequence(sa.Sequence('warehouses_id_seq')))
    op.execute(sa.schema.DropSequence(sa.Sequence('stocks_id_seq')))

    # Удаление ENUM типа
    postgresql.ENUM(name='warehousetype').drop(op.get_bind(), checkfirst=True)