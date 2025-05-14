# app/crud/stock_movement.py
from sqlalchemy.orm import Session
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
    query = db.query(
        StockMovement,
        Product.name.label("product_name"),
        Warehouse.name.label("warehouse_name")
    ).join(
        Product, StockMovement.product_id == Product.id
    ).join(
        Warehouse, StockMovement.warehouse_id == Warehouse.id
    )

    if product_id:
        query = query.filter(StockMovement.product_id == product_id)

    if warehouse_id:
        query = query.filter(StockMovement.warehouse_id == warehouse_id)

    results = query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()

    movements = []
    for movement, product_name, warehouse_name in results:
        movement_dict = {
            "id": str(movement.id),
            "product_id": str(movement.product_id),
            "product_name": product_name,
            "warehouse_id": str(movement.warehouse_id),
            "warehouse_name": warehouse_name,
            "quantity": movement.quantity,
            "movement_type": movement.movement_type,
            "created_at": movement.created_at.isoformat(),
            "created_by_id": movement.created_by_id,
            "note": movement.note
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
            warehouse_id=int(movement_data.get("warehouse_id")),
            quantity=movement_data.get("quantity"),
            movement_type=movement_data.get("movement_type"),
            source_warehouse_id=movement_data.get("source_warehouse_id"),
            target_warehouse_id=movement_data.get("target_warehouse_id"),
            created_at=datetime.now(),
            created_by_id=movement_data.get("created_by_id"),
            note=movement_data.get("note")
        )

        db.add(new_movement)
        db.commit()
        db.refresh(new_movement)

        # Получаем дополнительную информацию для ответа
        product = db.query(Product).filter(Product.id == new_movement.product_id).first()
        warehouse = db.query(Warehouse).filter(Warehouse.id == new_movement.warehouse_id).first()

        return {
            "id": str(new_movement.id),
            "product_id": str(new_movement.product_id),
            "product_name": product.name if product else "Unknown",
            "warehouse_id": str(new_movement.warehouse_id),
            "warehouse_name": warehouse.name if warehouse else "Unknown",
            "quantity": new_movement.quantity,
            "movement_type": new_movement.movement_type,
            "created_at": new_movement.created_at.isoformat(),
            "created_by_id": new_movement.created_by_id,
            "note": new_movement.note
        }
    except Exception as e:
        db.rollback()
        raise e

def update_product_stock(db: Session, product_id: int, warehouse_id: int, quantity_change: int, username: str = "admin") -> Optional[Dict[str, Any]]:
    """
    Прокси-функция для изменения количества запаса.
    Прямой редирект на adjust_stock_quantity.
    """
    return adjust_stock_quantity(db, product_id, warehouse_id, quantity_change, username)