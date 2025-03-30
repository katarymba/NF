import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Product

# Подключение к базе данных
DATABASE_URL = "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Максимальная длина описания (символы)
MAX_DESCRIPTION_LENGTH = 500

# Функция для очистки и сокращения текста
def clean_and_truncate(text, max_length=MAX_DESCRIPTION_LENGTH):
    # Удаляем специальные символы, оставляя только буквы, цифры и базовую пунктуацию
    text = re.sub(r'[^\w\s\.,!?()-]', '', text, flags=re.UNICODE)
    
    # Заменяем множественные пробелы одиночными
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Сокращаем до указанной длины и добавляем многоточие, если текст был обрезан
    if len(text) > max_length:
        # Обрезаем до последнего целого предложения перед лимитом
        truncated = text[:max_length]
        last_sentence_end = max(
            truncated.rfind('.'), 
            truncated.rfind('!'), 
            truncated.rfind('?')
        )
        if last_sentence_end > 0:
            return text[:last_sentence_end+1]
        else:
            # Если нет точки, просто обрезаем до последнего целого слова
            last_space = truncated.rfind(' ')
            if last_space > 0:
                return text[:last_space] + '...'
            else:
                return truncated + '...'
    return text

# Чтение файла с описаниями
try:
    with open('descriptions.txt', 'r', encoding='utf-8') as file:
        content = file.read()
except UnicodeDecodeError:
    # Пробуем другую кодировку, если UTF-8 не работает
    with open('descriptions.txt', 'r', encoding='cp1251') as file:
        content = file.read()

# Разбиваем содержимое по паттерну: число, точка, пробел
descriptions = {}
pattern = r'(\d+)\.\s+(.*?)(?=\s+\d+\.\s+|\Z)'
matches = re.findall(pattern, content, re.DOTALL)

for match in matches:
    try:
        product_id = int(match[0])
        # Берем первые 2-3 предложения или около 200-300 символов
        product_description = clean_and_truncate(match[1], 300)
        descriptions[product_id] = product_description
    except Exception as e:
        print(f"Ошибка при обработке записи {match[0]}: {e}")

# Обновление описаний в базе данных
updated_count = 0
skipped_count = 0

for product_id, description in descriptions.items():
    try:
        product = session.query(Product).filter(Product.id == product_id).first()
        if product:
            original_desc = description  # Сохраняем оригинал для вывода
            # Ограничиваем длину до 250 символов для еще большей безопасности
            if len(description) > 250:
                description = description[:247] + '...'
            
            product.description = description
            updated_count += 1
            print(f"Обновлено описание для товара {product_id}: {product.name}")
            # Проверяем правильность обновления
            session.flush()  # Частичный коммит для проверки
        else:
            skipped_count += 1
            print(f"Товар с ID {product_id} не найден")
    except Exception as e:
        print(f"Ошибка при обновлении товара {product_id}: {e}")
        session.rollback()  # Откатываем изменения для этого товара

# Сохранение изменений
try:
    session.commit()
    print(f"Обновление завершено! Обновлено товаров: {updated_count}, пропущено: {skipped_count}")
except Exception as e:
    session.rollback()
    print(f"Ошибка при сохранении изменений: {e}")
finally:
    session.close()