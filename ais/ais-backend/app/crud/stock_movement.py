# app/crud/stock_movement.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.models.stock_movement import StockMovement
from app.models.product import Product
from app.models.warehouse import Warehouse


def get_all_stock_movements(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[int] = None,
        warehouse_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Получение всех движений товаров с возможностью фильтрации.
    """
    # Обновляем запрос для новой схемы БД без warehouse_id
    query = db.query(
        StockMovement,
        Product.name.label("product_name")
    ).join(
        Product, StockMovement.product_id == Product.id
    )

    if product_id:
        query = query.filter(StockMovement.product_id == product_id)

    if warehouse_id:
        # Используем COALESCE для поиска по любому из warehouse полей
        query = query.filter(
            (StockMovement.source_warehouse_id == warehouse_id) |
            (StockMovement.target_warehouse_id == warehouse_id)
        )

    results = query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()

    movements = []
    for movement, product_name in results:
        # Получаем имена складов
        source_warehouse_name = None
        target_warehouse_name = None

        if movement.source_warehouse_id:
            source_warehouse = db.query(Warehouse).filter(Warehouse.id == movement.source_warehouse_id).first()
            source_warehouse_name = source_warehouse.name if source_warehouse else None

        if movement.target_warehouse_id:
            target_warehouse = db.query(Warehouse).filter(Warehouse.id == movement.target_warehouse_id).first()
            target_warehouse_name = target_warehouse.name if target_warehouse else None

        movement_dict = {
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": product_name,
            "source_warehouse_id": movement.source_warehouse_id,
            "target_warehouse_id": movement.target_warehouse_id,
            "source_warehouse_name": source_warehouse_name,
            "target_warehouse_name": target_warehouse_name,
            "quantity": movement.quantity,
            "movement_type": movement.movement_type,
            "movement_date": movement.movement_date.isoformat() if movement.movement_date else None,
            "created_at": movement.created_at.isoformat() if movement.created_at else None,
            "reference_id": movement.reference_id,
            "notes": movement.notes
        }

        movements.append(movement_dict)

    return movements


def create_stock_movement(db: Session, movement_data: dict) -> Dict[str, Any]:
    """
    Создание новой записи о движении товара.
    """
    try:
        new_movement = StockMovement(
            product_id=int(movement_data.get("product_id")),
            quantity=float(movement_data.get("quantity")),
            movement_type=movement_data.get("movement_type"),
            source_warehouse_id=movement_data.get("source_warehouse_id"),
            target_warehouse_id=movement_data.get("target_warehouse_id"),
            reference_id=movement_data.get("reference_id"),
            notes=movement_data.get("notes"),
            movement_date=datetime.now(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        db.add(new_movement)
        db.commit()
        db.refresh(new_movement)

        # Получаем дополнительную информацию для ответа
        product = db.query(Product).filter(Product.id == new_movement.product_id).first()

        source_warehouse_name = None
        target_warehouse_name = None

        if new_movement.source_warehouse_id:
            source_warehouse = db.query(Warehouse).filter(Warehouse.id == new_movement.source_warehouse_id).first()
            source_warehouse_name = source_warehouse.name if source_warehouse else None

        if new_movement.target_warehouse_id:
            target_warehouse = db.query(Warehouse).filter(Warehouse.id == new_movement.target_warehouse_id).first()
            target_warehouse_name = target_warehouse.name if target_warehouse else None

        return {
            "id": new_movement.id,
            "product_id": new_movement.product_id,
            "product_name": product.name if product else "Unknown",
            "source_warehouse_id": new_movement.source_warehouse_id,
            "target_warehouse_id": new_movement.target_warehouse_id,
            "source_warehouse_name": source_warehouse_name,
            "target_warehouse_name": target_warehouse_name,
            "quantity": new_movement.quantity,
            "movement_type": new_movement.movement_type,
            "movement_date": new_movement.movement_date.isoformat(),
            "created_at": new_movement.created_at.isoformat(),
            "reference_id": new_movement.reference_id,
            "notes": new_movement.notes
        }
    except Exception as e:
        db.rollback()
        raise e


# Добавляем функцию update_product_stock, которую ищет supply.py
def update_product_stock(db: Session, product_id: int, warehouse_id: int, quantity_change: int,
                         username: str = "admin") -> Optional[Dict[str, Any]]:
    """
    Обновление количества запаса товара на складе.
    Эта функция должна быть реализована в соответствии с вашей бизнес-логикой.
    """
    # Пока заглушка - нужно будет реализовать логику обновления stocks
    from app.crud.stock import update_product_stock as stock_update
    return stock_update(db, product_id, warehouse_id, quantity_change, username)


def adjust_stock_quantity(db: Session, product_id: int, warehouse_id: int, quantity_change: int, username: str = "admin") -> Optional[Dict[str, Any]]:
    """
    Функция для изменения количества запаса (ссылка из update_product_stock).
    """
    # Эта функция должна быть реализована в зависимости от вашей логики управления запасами
    # Пока возвращаем None, но нужно будет реализовать
    return None