import os
import psycopg2
import subprocess
import datetime
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Получаем строку подключения к БД из переменных окружения
db_url = os.getenv("DATABASE_URL")

# Парсим параметры подключения из строки
if "postgresql" in db_url:
    # Формат: postgresql+psycopg2://username:password@host:port/database
    connection_parts = db_url.replace("postgresql+psycopg2://", "").split("@")

    # Извлекаем учетные данные и информацию о хосте
    credentials = connection_parts[0].split(":")
    host_info = connection_parts[1].split("/")

    # Извлекаем имя пользователя, пароль, хост и имя базы данных
    DB_USER = credentials[0]
    DB_PASSWORD = credentials[1] if len(credentials) > 1 else ""
    host_port = host_info[0].split(":")
    DB_HOST = host_port[0]
    DB_PORT = host_port[1] if len(host_port) > 1 else "5432"
    DB_NAME = host_info[1]

    # Создаем директорию для резервных копий
    backup_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db_backups")
    os.makedirs(backup_dir, exist_ok=True)

    # Генерируем имя файла с текущей датой и временем
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"{DB_NAME}_backup_{timestamp}.sql")

    print(f"Подключение к базе данных {DB_NAME}...")

    # SQL для создания недостающих таблиц
    create_tables_sql = """
    -- Создание таблицы payments, если она не существует
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Создание таблицы shipments, если она не существует
    CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        shipping_address VARCHAR(255) NOT NULL,
        tracking_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'в пути',
        estimated_delivery TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
    """

    # SQL для удаления ненужной таблицы cart
    drop_cart_sql = """
    -- Удаление таблицы cart
    DROP TABLE IF EXISTS cart;
    """

    try:
        # Шаг 1: Делаем резервную копию перед изменениями
        print(f"Создание резервной копии базы данных в {backup_file}...")
        pg_dump_cmd = f"PGPASSWORD={DB_PASSWORD} pg_dump -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -F c -b -v -f {backup_file} {DB_NAME}"

        try:
            subprocess.run(pg_dump_cmd, shell=True, check=True)
            print(f"Резервная копия успешно создана: {backup_file}")
        except subprocess.CalledProcessError as e:
            print(f"Ошибка при создании резервной копии: {e}")
            response = input("Продолжить без резервной копии? (да/нет): ")
            if response.lower() not in ['да', 'yes', 'y', 'д']:
                print("Операция отменена пользователем.")
                exit(1)

        # Подключаемся к базе данных
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Шаг 2: Создаем недостающие таблицы
        print("Создание недостающих таблиц (payments, shipments)...")
        cursor.execute(create_tables_sql)

        # Шаг 3: Удаляем ненужную таблицу cart
        print("Удаление таблицы cart...")

        # Сначала проверим, существует ли таблица
        cursor.execute(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cart')")
        cart_exists = cursor.fetchone()[0]

        if cart_exists:
            # Спросим пользователя перед удалением
            response = input("Таблица cart существует. Удалить? (да/нет): ")
            if response.lower() in ['да', 'yes', 'y', 'д']:
                cursor.execute(drop_cart_sql)
                print("Таблица cart удалена.")
            else:
                print("Таблица cart не была удалена.")
        else:
            print("Таблица cart не найдена.")

        # Шаг 4: Проверяем структуру БД после изменений
        print("Проверка структуры БД после изменений...")
        cursor.execute("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cursor.fetchall()

        print("\nТаблицы в БД после изменений:")
        for table in tables:
            print(f" - {table[0]}")

        # Закрываем соединение
        cursor.close()
        conn.close()

        print("\nСтруктура базы данных успешно обновлена!")

    except Exception as e:
        print(f"\nОшибка при обновлении структуры базы данных: {e}")
        print(f"Вы можете восстановить базу данных из резервной копии: {backup_file}")
else:
    print(f"Неподдерживаемый тип базы данных: {db_url}")
    print("Этот скрипт поддерживает только PostgreSQL.")