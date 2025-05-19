from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime

from app.models import Product, Category
from app.schemas import ProductCreate, ProductBase


def get_products(db: Session, category_id: Optional[int] = None, search: Optional[str] = None) -> List[Product]:
    """
    Получить список всех продуктов с опциональной фильтрацией
    по категории и поисковому запросу
    """
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )

    products = query.all()

    # Пытаемся загрузить категории, но не блокируем обработку при ошибке
    try:
        # Собираем все уникальные id категорий
        category_ids = set(p.category_id for p in products if p.category_id is not None)

        if category_ids:
            # Загружаем все необходимые категории одним запросом
            categories = {
                cat.id: cat
                for cat in db.query(Category).filter(Category.id.in_(category_ids)).all()
            }

            # Проставляем связи с категориями (если категория найдена)
            for product in products:
                if product.category_id and product.category_id in categories:
                    product.category = categories[product.category_id]
    except Exception as e:
        # Логируем ошибку с текущими датой и пользователем
        print(f"Error loading categories: {str(e)}")

    return products


def get_product(db: Session, product_id: int) -> Optional[Product]:
    """
    Получить продукт по ID с загрузкой категории
    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if product and product.category_id:
        try:
            # Загружаем категорию продукта
            category = db.query(Category).filter(Category.id == product.category_id).first()
            if category:
                product.category = category
        except Exception as e:
            # Логируем ошибку с текущими датой и пользователем
            print(f"Error loading category for product {product_id}: {str(e)}")

    return product


def create_product(db: Session, product: ProductCreate) -> Product:
    """
    Создать новый товар
    """
    try:
        product_data = product.dict()

        # Получаем поля, которые есть в модели
        valid_fields = {
            key: value for key, value in product_data.items()
            if hasattr(Product, key)
        }

        # Проверка, есть ли created_at в модели, если нет - не пытаемся его добавить
        if hasattr(Product, 'created_at') and 'created_at' not in valid_fields:
            # Некоторые модели могут использовать server_default вместо Python-значений
            # Проверяем, установлен ли server_default для created_at
            col_created_at = getattr(Product, 'created_at', None)
            if col_created_at is not None and col_created_at.server_default is None:
                valid_fields['created_at'] = datetime.utcnow()

        # Создаем экземпляр модели с валидными полями
        db_product = Product(**valid_fields)

        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        # Добавляем категорию к ответу
        if db_product.category_id:
            db_product.category = db.query(Category).filter(Category.id == db_product.category_id).first()

        return db_product
    except Exception as e:
        db.rollback()
        print(f"Error creating product: {str(e)}")
        raise


def update_product(
        db: Session,
        product_id: int,
        product_data: ProductBase
) -> Optional[Product]:
    """
    Обновить существующий товар
    """
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()

        if not db_product:
            return None

        # Обновляем только существующие поля в модели
        update_data = product_data.dict(exclude_unset=True)
        valid_fields = {
            key: value for key, value in update_data.items()
            if hasattr(Product, key)
        }

        for key, value in valid_fields.items():
            setattr(db_product, key, value)

        db.commit()
        db.refresh(db_product)

        # Добавляем категорию к ответу
        if db_product.category_id:
            db_product.category = db.query(Category).filter(Category.id == db_product.category_id).first()

        return db_product
    except Exception as e:
        db.rollback()
        print(f"Error updating product {product_id}: {str(e)}")
        raise


def delete_product(db: Session, product_id: int) -> bool:
    """
    Удалить товар
    """
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()

        if not db_product:
            return False

        db.delete(db_product)
        db.commit()

        return True
    except Exception as e:
        db.rollback()
        print(f"Error deleting product {product_id}: {str(e)}")
        return False