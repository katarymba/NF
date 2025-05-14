# app/crud/product.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models import Product, Category
from app.schemas import ProductCreate, ProductBase


def get_products(
        db: Session,
        category_id: Optional[int] = None,
        search: Optional[str] = None
) -> List[Product]:
    """
    Получить список всех товаров с опциональной фильтрацией по категории и поиску
    """
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.all()

    # Обогащаем продукты информацией о категории
    for product in products:
        if product.category_id:
            product.category = db.query(Category).filter(Category.id == product.category_id).first()

    return products


def get_product(db: Session, product_id: int) -> Optional[Product]:
    """
    Получить товар по ID
    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if product and product.category_id:
        product.category = db.query(Category).filter(Category.id == product.category_id).first()

    return product


def create_product(db: Session, product: ProductCreate) -> Product:
    """
    Создать новый товар
    """
    product_data = product.dict()

    # Получаем поля, которые есть в модели
    valid_fields = {
        key: value for key, value in product_data.items()
        if hasattr(Product, key)
    }

    # Создаем экземпляр модели с валидными полями
    db_product = Product(**valid_fields, created_at=datetime.utcnow())

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Добавляем категорию к ответу
    if db_product.category_id:
        db_product.category = db.query(Category).filter(Category.id == db_product.category_id).first()

    return db_product


def update_product(
        db: Session,
        product_id: int,
        product_data: ProductBase
) -> Optional[Product]:
    """
    Обновить существующий товар
    """
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


def delete_product(db: Session, product_id: int) -> bool:
    """
    Удалить товар
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()

    if not db_product:
        return False

    db.delete(db_product)
    db.commit()

    return True