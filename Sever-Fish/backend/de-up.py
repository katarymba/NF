import re
import unicodedata
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Product

def clean_text(text):
    """Очистка текста от посторонних символов и лишних пробелов"""
    # Удаляем символы, не относящиеся к кириллице, латинице, цифрам и базовой пунктуации
    text = re.sub(r'[^\w\s\.,!?()-]', '', text)
    # Заменяем несколько пробелов на один
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Подключение к базе данных
DATABASE_URL = "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Чтение файла с описаниями
with open('descriptions.txt', 'r', encoding='utf-8') as file:
    content = file.read()

# Очищаем текст от посторонних символов
content = clean_text(content)

# Улучшенный парсинг описаний с дополнительными проверками
pattern = r'(\d+)\.\s*([^0-9]+?)(?:\n|\r\n)([\s\S]+?)(?=\d+\.\s+|\Z)'
matches = re.findall(pattern, content, re.MULTILINE)

descriptions = {}
for match in matches:
    try:
        product_id = int(match[0])
        product_name = match[1].strip()
        product_description = match[2].strip()
        
        # Дополнительная проверка длины описания
        if len(product_description) > 50:  # Минимальная длина описания
            descriptions[product_id] = product_description
    except Exception as e:
        print(f"Ошибка при обработке записи {match[0]}: {e}")

# Обновление описаний в базе данных
updated_count = 0
skipped_count = 0

for product_id, description in descriptions.items():
    product = session.query(Product).filter(Product.id == product_id).first()
    if product:
        product.description = description
        updated_count += 1
        print(f"Обновлено описание для товара {product_id}: {product.name}")
    else:
        skipped_count += 1
        print(f"Товар с ID {product_id} не найден")

# Сохранение изменений
session.commit()
session.close()

print(f"Обновление завершено! Обновлено товаров: {updated_count}, пропущено: {skipped_count}")