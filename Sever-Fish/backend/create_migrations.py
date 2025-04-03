# create_migrations.py в Sever-Fish/backend/
from alembic import command
from alembic.config import Config


def regenerate_migrations():
    alembic_cfg = Config("alembic.ini")

    # Генерируем новую миграцию автоматически
    command.revision(alembic_cfg, autogenerate=True, message="Regenerate migrations")


if __name__ == "__main__":
    regenerate_migrations()