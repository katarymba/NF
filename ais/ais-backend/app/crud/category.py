# app/crud/category.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.models.category import Category
from app.models.product import Product
from app.schemas import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)


def get_all_categories(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name: Optional[str] = None,
        parent_id: Optional[int] = None
) -> List[Category]:
    """
    Получение списка всех категорий с возможностью фильтрации.
    """
    query = db.query(Category)

    if name:
        query = query.filter(Category.name.ilike(f"%{name}%"))

    if parent_id is not None:
        query = query.filter(Category.parent_category_id == parent_id)

    return query.offset(skip).limit(limit).all()


def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    """
    Получение категории по ID.
    """
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_with_products(db: Session, category_id: int) -> Optional[Dict[str, Any]]:
    """
    Получение категории с информацией о товарах в ней.
    """
    category = get_category_by_id(db, category_id)

    if not category:
        return None

    # Получаем товары в категории
    products = db.query(Product).filter(Product.category_id == category_id).all()

    # Получаем количество товаров и статистику
    products_count = len(products)
    products_with_stock = db.query(func.count(Product.id)).filter(
        Product.category_id == category_id,
        Product.stocks.any()
    ).scalar()

    # Получаем подкатегории
    subcategories = db.query(Category).filter(Category.parent_category_id == category_id).all()

    # Формируем ответ
    result = {
        "id": category.id,
        "name": category.name,
        "parent_category_id": category.parent_category_id,
        "products_count": products_count,
        "products_with_stock": products_with_stock or 0,
        "subcategories": [
            {
                "id": subcategory.id,
                "name": subcategory.name
            }
            for subcategory in subcategories
        ],
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock_quantity": sum(stock.quantity for stock in product.stocks) if hasattr(product, 'stocks') else 0
            }
            for product in products
        ]
    }

    return result


def get_categories_tree(db: Session) -> List[Dict[str, Any]]:
    """
    Получение всех категорий в виде дерева (с подкатегориями).
    """
    # Получаем все категории
    categories = db.query(Category).all()

    # Создаем словарь для быстрого доступа к категориям по ID
    categories_dict = {category.id: {
        "id": category.id,
        "name": category.name,
        "parent_category_id": category.parent_category_id,
        "subcategories": []
    } for category in categories}

    # Строим дерево категорий
    root_categories = []
    for category_id, category_data in categories_dict.items():
        parent_id = category_data["parent_category_id"]
        if parent_id is None:
            # Корневая категория
            root_categories.append(category_data)
        elif parent_id in categories_dict:
            # Добавляем подкатегорию
            categories_dict[parent_id]["subcategories"].append(category_data)

    return root_categories


def create_category(db: Session, category_data: CategoryCreate) -> Optional[Category]:
    """
    Создание новой категории.
    """
    try:
        # Проверяем существование родительской категории
        if category_data.parent_category_id:
            parent = get_category_by_id(db, category_data.parent_category_id)
            if not parent:
                logger.error(f"Parent category with ID {category_data.parent_category_id} not found")
                return None

        new_category = Category(
            name=category_data.name,
            parent_category_id=category_data.parent_category_id
        )

        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return new_category

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating category: {str(e)}")
        raise


def update_category(db: Session, category_id: int, category_data: CategoryUpdate) -> Optional[Category]:
    """
    Обновление существующей категории.
    """
    try:
        category = get_category_by_id(db, category_id)

        if not category:
            return None

        # Проверяем существование родительской категории и циклические зависимости
        if category_data.parent_category_id:
            if category_data.parent_category_id == category_id:
                # Категория не может быть своим родителем
                logger.error(f"Category {category_id} cannot be its own parent")
                return None

            if category_data.parent_category_id != category.parent_category_id:
                parent = get_category_by_id(db, category_data.parent_category_id)
                if not parent:
                    logger.error(f"Parent category with ID {category_data.parent_category_id} not found")
                    return None

                # Проверка на циклическую зависимость (категория не может быть родителем своего родителя)
                current_parent_id = parent.parent_category_id
                while current_parent_id:
                    if current_parent_id == category_id:
                        logger.error(f"Circular dependency detected for category {category_id}")
                        return None

                    current_parent = get_category_by_id(db, current_parent_id)
                    if not current_parent:
                        break

                    current_parent_id = current_parent.parent_category_id

        # Обновляем только предоставленные поля
        update_data = category_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)

        db.commit()
        db.refresh(category)

        return category

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating category: {str(e)}")
        raise


def delete_category(db: Session, category_id: int) -> bool:
    """
    Удаление категории, если с ней не связаны товары или подкатегории.
    """
    try:
        category = get_category_by_id(db, category_id)

        if not category:
            return False

        # Проверяем наличие товаров в категории
        products_count = db.query(func.count(Product.id)).filter(Product.category_id == category_id).scalar()

        if products_count > 0:
            logger.warning(f"Cannot delete category {category_id} with {products_count} products")
            return False

        # Проверяем наличие подкатегорий
        subcategories_count = db.query(func.count(Category.id)).filter(
            Category.parent_category_id == category_id).scalar()

        if subcategories_count > 0:
            logger.warning(f"Cannot delete category {category_id} with {subcategories_count} subcategories")
            return False

        # Удаляем категорию
        db.delete(category)
        db.commit()

        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting category: {str(e)}")
        return False


def get_category_count_by_products(db: Session) -> List[Dict[str, Any]]:
    """
    Получение статистики по категориям: количество товаров в каждой категории.
    """
    try:
        # Получаем количество товаров в каждой категории
        category_stats = db.query(
            Product.category_id,
            func.count(Product.id).label("products_count")
        ).group_by(Product.category_id).all()

        # Создаем результат
        result = []
        for category_id, products_count in category_stats:
            if category_id:
                category = get_category_by_id(db, category_id)
                if category:
                    result.append({
                        "id": category_id,
                        "name": category.name,
                        "products_count": products_count
                    })

        return result

    except Exception as e:
        logger.error(f"Error getting category stats: {str(e)}")
        return []