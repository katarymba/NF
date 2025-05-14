from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.models import Base
target_metadata = Base.metadata

# Импортируйте Base и модели
from app.database import Base
from app.models import (
    User, Product, Category, Order,
    OrderItem, Payment, Shipment,
    administrator  # Добавьте импорт Administrator
)

config = context.config

# Установите URL базы данных из переменных окружения или .env
config.set_main_option('sqlalchemy.url', 'postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db')

# Устанавливаем метаданные для миграций
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()