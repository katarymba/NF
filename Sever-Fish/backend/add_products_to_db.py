from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Product, Category  # Импорт моделей

# Создание подключения к базе данных
DATABASE_URL = "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Пример товаров с категориями
all_products = [
    ("Набор «ПАТРИОТ»", 1999, None, "delicacies"),
    ("Навага-ЛЕДЯНАЯ", 199.99, "1 кг", "frozen_fish"),
    ("Котлета 'Царская' из СОМА", 599.99, None, "semi_finished"),
    ("ХРЕБТЫ ФОРЕЛИ Г/К", 899.99, "1 кг", "smoked"),
    ("ФОРЕЛЬ ТУШКА Х/К", 2789, "1 кг", "smoked"),
    ("ФИЛЕ МАСЛЯНОЙ КУСОК Х/К", 2289, "1 кг", "smoked"),
    ("СОМ Г/К КУСОК", 1089, "1 кг", "smoked"),
    ("СЁМГА С/С в/у пласт", 3599.99, "1 кг", "fresh_fish"),
    ("СЕЛЬДЬ ОЛЮТОРСКАЯ", 399, "1 кг", "frozen_fish"),
    ("СЕЛЬДЬ ФИЛЕ КУСОЧКИ ПО-ФРАНЦУЗСКИ", 349, "450 г", "delicacies"),
    ("МОЙВА Г/К нп сг", 969.99, "1 кг", "smoked"),
    ("МИНТАЙ с/м", 269.99, "1 кг", "frozen_fish"),
    ("ЗУБАТКА Г/К кусок", 1399.99, "1 кг", "smoked"),
    ("ЖЕРЕХ Х/К ПЛАСТ п бг", 989, "1 кг", "smoked"),
    ("ГОРБУША Х/К п юг", 1099.99, "1 кг", "smoked"),
    ("ЯЗЫК ТРЕСКИ ст.б", 390, "200 г", "delicacies"),
    ("ТУНЕЦ НАТУРАЛЬНЫЙ ст.б", 698, "500 г", "canned"),
    ("ПЕЧЕНЬ ТРЕСКИ ПО-МУРМАНСКИ ж.б", 499, "190 г", "canned"),
    ("ПЕЧЕНЬ ТРЕСКИ НАТУРАЛЬНАЯ ст.б", 998, "500 г", "canned"),
    ("ИКРА ТРЕСКИ АТЛ", 199.99, "160 г", "caviar"),
    ("ИКРА КИЖУЧА с/с", 14999, "1 кг", "caviar"),
    ("ИКРА КЕТЫ с/с", 13999, "1 кг", "caviar"),
    ("ФОРЕЛЬ С/С в/у пласт", 2789, "1 кг", "fresh_fish"),
    ("ФОРЕЛЬ КАРЕЛЬСКАЯ, ОХЛАЖДЕННАЯ", 887, "1 кг", "fresh_fish"),
    ("СТЕЙК ФОРЕЛИ", 1790, None, "fresh_fish"),
    ("СТЕЙК СЁМГИ", 2150, None, "fresh_fish"),
    ("ФАЛАНГИ КАМЧАТСКОГО КРАБА", 5900, None, "seafood"),
    ("ЛАНГУСТИНЫ без головы", 1640, "1 кг", "seafood"),
    ("СКУМБРИЯ КОРОЛЕВСКАЯ Х/К", 1099, "1 кг", "smoked"),
    ("ВОБЛА ВЯЛЕНАЯ", 1390, "1 кг", "smoked"),
    ("СУДАК ВЯЛЕНЫЙ", 519, "1 кг", "smoked"),
    ("ПАЛТУС охлажденный или с/м", 1790, "1 кг", "fresh_fish"),
    ("ТРЕСКА С/М", 579, "1 кг", "frozen_fish"),
    ("ОКУНЬ МОРСКОЙ С/М", 549, "1 кг", "frozen_fish"),
    ("СКУМБРИЯ косичка Х/К", 165, "300 г", "smoked"),
    ("ГОРБУША косичка х/к", 249, "300 г", "smoked"),
    ("ТРЕСКА филе-кусочки в масле", 239, "200 г", "canned"),
    ("Ассорти горбуша/сельдь", 112, "180 г", "canned"),
    ("Трио горбуша/сельдь/скумбрия", 105, "180 г", "canned"),
    ("СЕЛЬДЬ в масле", 179, "350 г", "canned"),
    ("СЕЛЬДЬ АТЛ. В МАСЛЕ ст.б", 349, "450 г", "canned"),
    ("СТЕЙК ЗУБАТКИ (синей) С/М", 289, "1 кг", "frozen_fish"),
    ("СТЕЙК ТРЕСКИ С/М", 590, "1 кг", "frozen_fish"),
    ("ФИЛЕ МИНТАЯ с/м", 419, "1 кг", "frozen_fish"),
    ("ФИЛЕ ТРЕСКИ с/м на коже", 579, "1 кг", "frozen_fish"),
    ("Филе ТРЕСКИ кубики", 589, "1 кг", "frozen_fish"),
    ("Филе ПАЛТУСА с/м", 599, "1 кг", "frozen_fish"),
    ("ОСЁТР сибирский", 1699, "1 кг", "fresh_fish"),
    ("Икра СТЕРЛЯДИ 50г с/с", 3900, "50 г", "caviar"),
    ("Икра Сибирского осетра 57г с/с", 3990, "57 г", "caviar"),
    ("Икра СТЕРЛЯДИ 100г с/с", 7800, "100 г", "caviar"),
    ("Икра Сибирского осетра 113г с/с", 8490, "113 г", "caviar"),
    ("Икра Сибирского осетра 125г с/с", 9500, "125 г", "caviar"),
    ("Икра Сибирского осетра 500г с/с", 35000, "500 г", "caviar"),
    ("Щепа Яблони", 95, None, "delicacies"),
    ("Щепа Ольхи", 75, None, "delicacies"),
    ("Щепа Груши", 95, None, "delicacies"),
    ("Щепа Вишни", 95, None, "delicacies"),
    ("Щепа Бука", 95, None, "delicacies"),
    ("МОРСИК 0,3л, 0.5л, 1л", 49, None, "delicacies"),
]

# Получаем все категории из базы данных и создаем словарь для быстрого доступа
categories = {category.slug: category.id for category in session.query(Category).all()}

# Добавляем товары в таблицу
for product in all_products:
    name, price, weight, category_slug = product
    category_id = categories.get(category_slug)  # Получаем ID категории по слагу
    
    if category_id:
        new_product = Product(
            name=name,
            price=price,
            weight=weight if weight else None,  # Если веса нет, оставляем None
            category_id=category_id
        )
        session.add(new_product)
    else:
        print(f"Категория '{category_slug}' не найдена для товара '{name}'")

# Сохраняем изменения в базе данных
session.commit()
session.close()

print("Товары успешно добавлены в базу данных!")