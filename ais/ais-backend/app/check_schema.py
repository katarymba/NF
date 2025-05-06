from sqlalchemy import create_engine, inspect
from app.database import Base
from app.models import *  # Импортируйте все ваши модели

def check_schema_consistency():
    # Подключение к БД
    engine = create_engine('postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db')
    
    # Инспектор БД
    inspector = inspect(engine)
    
    # Список таблиц из БД
    db_tables = set(inspector.get_table_names())
    
    # Список таблиц из моделей
    metadata = Base.metadata
    model_tables = set(metadata.tables.keys())
    
    # Проверка таблиц
    missing_in_db = model_tables - db_tables
    missing_in_models = db_tables - model_tables - {'alembic_version'}
    
    print("\n--- ПРОВЕРКА ТАБЛИЦ ---")
    if missing_in_db:
        print(f"⚠️ Таблицы, определенные в моделях, но отсутствующие в БД: {missing_in_db}")
    else:
        print("✅ Все таблицы из моделей существуют в БД")
    
    if missing_in_models:
        print(f"⚠️ Таблицы, существующие в БД, но не определенные в моделях: {missing_in_models}")
    else:
        print("✅ Все таблицы из БД определены в моделях")
    
    # Проверка колонок в каждой таблице
    print("\n--- ПРОВЕРКА КОЛОНОК ---")
    has_column_differences = False
    
    for table_name in model_tables.intersection(db_tables):
        # Колонки из БД
        db_columns = {col['name'] for col in inspector.get_columns(table_name)}
        
        # Колонки из модели
        model_columns = {col.name for col in metadata.tables[table_name].columns}
        
        # Пропущенные колонки
        missing_cols_in_db = model_columns - db_columns
        missing_cols_in_model = db_columns - model_columns
        
        if missing_cols_in_db or missing_cols_in_model:
            has_column_differences = True
            print(f"\nТаблица: {table_name}")
            
            if missing_cols_in_db:
                print(f"  ⚠️ Колонки в модели, но не в БД: {missing_cols_in_db}")
            
            if missing_cols_in_model:
                print(f"  ⚠️ Колонки в БД, но не в модели: {missing_cols_in_model}")
    
    if not has_column_differences:
        print("✅ Все колонки согласованы между моделями и БД")
    
    # Итоговый результат
    print("\n--- ИТОГ ---")
    if not missing_in_db and not missing_in_models and not has_column_differences:
        print("🎉 Схема базы данных полностью согласована с моделями SQLAlchemy!")
        return True
    else:
        print("❌ Обнаружены расхождения между схемой БД и моделями.")
        return False

if __name__ == "__main__":
    check_schema_consistency()