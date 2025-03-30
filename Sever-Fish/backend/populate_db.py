from database import SessionLocal
from models import Category

db = SessionLocal()

categories = [
    {"name": "Консервы", "slug": "canned"},
    {"name": "Икра", "slug": "caviar"},
    {"name": "Деликатесы", "slug": "delicacies"},
    {"name": "Свежая рыба", "slug": "fresh_fish"},
    {"name": "Замороженная рыба", "slug": "frozen_fish"},
    {"name": "Морепродукты", "slug": "seafood"},
    {"name": "Полуфабрикаты", "slug": "semi_finished"},
    {"name": "Копчёная рыба", "slug": "smoked"}
]

for category in categories:
    db.add(Category(**category))

db.commit()
db.close()

print("✅ Категории успешно добавлены в базу данных!")
