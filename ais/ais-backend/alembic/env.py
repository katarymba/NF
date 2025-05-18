from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context
import os
import sys
import urllib.parse

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

# Get connection details with URL encoding for the password
user = 'northf_user'
# URL encode the password to handle special characters
password = urllib.parse.quote_plus('%KM041286)zz!')
host = 'northfish-db'
db = 'north_fish'

# Skip ConfigParser completely for the database URL
db_url = f"postgresql+psycopg2://{user}:{password}@{host}:5432/{db}"

# Override the entire config section for sqlalchemy
alembic_config = config.get_section(config.config_ini_section)
alembic_config['sqlalchemy.url'] = db_url

# Устанавливаем метаданные для миграций
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Use the constructed URL directly
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Create engine directly without using ConfigParser
    connectable = create_engine(db_url)

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