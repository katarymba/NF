# app/crud/supply.py
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

from app.models import Supply, SupplyItem, Product, Warehouse, StockMovement, Supplier
from app.schemas import SupplyCreate, SupplyUpdate, SupplyItemUpdate, StockMovementCreate
from app.models.enums import SupplyStatus, StockMovementType
from app.crud.stock_movement import create_stock_movement
from app.crud.stock import update_product_stock


def get_supplies(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        supplier_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        status: Optional[str] = None,
        filters: Dict = None,
        date_filter: Dict = None
) -> List[Dict]:
    """Получение списка поставок с возможностью фильтрации"""
    query = db.query(Supply)

    # Применяем прямые фильтры
    if supplier_id:
        query = query.filter(Supply.supplier_id == supplier_id)
    if warehouse_id:
        query = query.filter(Supply.warehouse_id == warehouse_id)
    if status:
        query = query.filter(Supply.status == status)

    # Применение дополнительных фильтров из словаря
    if filters:
        for field, value in filters.items():
            if value is not None and field not in ['supplier_id', 'warehouse_id', 'status']:
                query = query.filter(getattr(Supply, field) == value)

    # Фильтрация по диапазону дат
    if date_filter and "start" in date_filter:
        query = query.filter(Supply.order_date >= date_filter["start"])
    if date_filter and "end" in date_filter:
        query = query.filter(Supply.order_date <= date_filter["end"])

    # Загружаем связанные данные для оптимизации запросов
    query = query.options(
        joinedload(Supply.items).joinedload(SupplyItem.product),
        joinedload(Supply.warehouse),
        joinedload(Supply.supplier)
    )

    # Применяем пагинацию и сортировку
    supplies = query.order_by(Supply.created_at.desc()).offset(skip).limit(limit).all()

    # Формируем список ответов с правильными полями
    result = []
    for supply in supplies:
        supply_data = {
            "id": supply.id,
            "supplier_id": supply.supplier_id,
            "supplier": supply.supplier.name if supply.supplier else f"Supplier {supply.supplier_id}",
            "warehouse_id": supply.warehouse_id,
            "warehouse_name": supply.warehouse.name if supply.warehouse else None,
            "status": supply.status,
            "order_date": supply.order_date,  # Используем правильное имя поля из БД
            "shipment_date": supply.order_date,  # Дублируем для совместимости
            "expected_delivery": supply.expected_delivery,  # Используем правильное имя поля из БД
            "expected_arrival_date": supply.expected_delivery,  # Дублируем для совместимости
            "actual_arrival_date": getattr(supply, 'actual_arrival_date', None),
            "reference_number": getattr(supply, 'reference_number', None),
            "notes": supply.notes,
            "total_amount": float(supply.total_amount),
            "created_by": supply.created_by,
            "created_at": supply.created_at,
            "updated_at": supply.updated_at,
            "items": [
                {
                    "id": item.id,
                    "supply_id": item.supply_id,
                    "product_id": item.product_id,
                    "product_name": item.product.name if item.product else f"Product {item.product_id}",
                    "quantity_ordered": item.quantity_ordered,
                    "unit_price": float(item.unit_price),
                    "warehouse_id": item.warehouse_id,
                    "quantity_received": None,  # Пока нет поля в БД, используем None
                    "is_received": item.is_received == 't',
                    "received_date": item.received_date,
                    "notes": item.notes
                }
                for item in supply.items
            ]
        }
        result.append(supply_data)

    return result


def get_supply(db: Session, supply_id: int) -> Optional[Dict]:
    """Получение поставки по ID"""
    supply = db.query(Supply).filter(Supply.id == supply_id).options(
        joinedload(Supply.items).joinedload(SupplyItem.product),
        joinedload(Supply.warehouse),
        joinedload(Supply.supplier)
    ).first()

    if not supply:
        return None

    # Формируем объект ответа с правильными полями
    return {
        "id": supply.id,
        "supplier_id": supply.supplier_id,
        "supplier": supply.supplier.name if supply.supplier else f"Supplier {supply.supplier_id}",
        "warehouse_id": supply.warehouse_id,
        "warehouse_name": supply.warehouse.name if supply.warehouse else None,
        "status": supply.status,
        "order_date": supply.order_date,
        "shipment_date": supply.order_date,
        "expected_delivery": supply.expected_delivery,
        "expected_arrival_date": supply.expected_delivery,
        "actual_arrival_date": getattr(supply, 'actual_arrival_date', None),
        "reference_number": getattr(supply, 'reference_number', None),
        "notes": supply.notes,
        "total_amount": float(supply.total_amount),
        "created_by": supply.created_by,
        "created_at": supply.created_at,
        "updated_at": supply.updated_at,
        "items": [
            {
                "id": item.id,
                "supply_id": item.supply_id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else f"Product {item.product_id}",
                "quantity_ordered": item.quantity_ordered,
                "unit_price": float(item.unit_price),
                "warehouse_id": item.warehouse_id,
                "quantity_received": None,
                "is_received": item.is_received == 't',
                "received_date": item.received_date,
                "notes": item.notes
            }
            for item in supply.items
        ]
    }


def create_supply(db: Session, supply: SupplyCreate, created_by: str):
    """
    Создание новой поставки с элементами
    """
    # Проверяем существование поставщика
    supplier = db.query(Supplier).filter(Supplier.id == supply.supplier_id).first()
    if not supplier:
        raise ValueError(f"Поставщик с ID {supply.supplier_id} не найден")

    # Проверяем существование склада
    warehouse = db.query(Warehouse).filter(Warehouse.id == supply.warehouse_id).first()
    if not warehouse:
        raise ValueError(f"Склад с ID {supply.warehouse_id} не найден")

    # Создаем основную запись поставки
    db_supply = Supply(
        supplier_id=supply.supplier_id,
        warehouse_id=supply.warehouse_id,
        order_date=supply.shipment_date,
        expected_delivery=supply.expected_arrival_date,
        status=supply.status.value if hasattr(supply.status, 'value') else str(supply.status),
        total_amount=0,
        notes=supply.notes,
        created_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(db_supply)
    db.flush()

    # Создаем элементы поставки
    total_amount = 0
    for item_data in supply.items:
        # Проверяем существование продукта
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise ValueError(f"Продукт с ID {item_data.product_id} не найден")

        # Создаем элемент поставки
        db_item = SupplyItem(
            supply_id=db_supply.id,
            product_id=item_data.product_id,
            quantity_ordered=item_data.quantity_ordered,
            unit_price=item_data.unit_price,
            warehouse_id=item_data.warehouse_id,
            is_received='f',
            notes=item_data.notes
        )

        db.add(db_item)
        total_amount += item_data.quantity_ordered * item_data.unit_price

    # Обновляем общую сумму
    db_supply.total_amount = total_amount

    db.commit()

    # Загружаем созданную поставку с relationships
    created_supply = db.query(Supply).filter(Supply.id == db_supply.id).options(
        joinedload(Supply.items).joinedload(SupplyItem.product),
        joinedload(Supply.warehouse),
        joinedload(Supply.supplier)
    ).first()

    # Формируем объект ответа с правильными полями для схемы
    response_data = {
        "id": created_supply.id,
        "supplier_id": created_supply.supplier_id,
        "supplier": created_supply.supplier.name if created_supply.supplier else f"Supplier {created_supply.supplier_id}",
        "warehouse_id": created_supply.warehouse_id,
        "warehouse_name": created_supply.warehouse.name if created_supply.warehouse else None,
        "status": created_supply.status,
        "order_date": created_supply.order_date,  # Правильное поле для схемы
        "shipment_date": created_supply.order_date,  # Для совместимости с фронтендом
        "expected_delivery": created_supply.expected_delivery,  # Правильное поле для схемы
        "expected_arrival_date": created_supply.expected_delivery,  # Для совместимости с фронтендом
        "actual_arrival_date": getattr(created_supply, 'actual_arrival_date', None),
        "reference_number": getattr(created_supply, 'reference_number', None),
        "notes": created_supply.notes,
        "total_amount": float(created_supply.total_amount),
        "created_by": created_supply.created_by,
        "created_at": created_supply.created_at,
        "updated_at": created_supply.updated_at,
        "items": [
            {
                "id": item.id,
                "supply_id": item.supply_id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else f"Product {item.product_id}",
                "quantity_ordered": item.quantity_ordered,
                "unit_price": float(item.unit_price),
                "warehouse_id": item.warehouse_id,
                "quantity_received": None,  # Пока нет поля в БД
                "is_received": item.is_received == 't',
                "received_date": item.received_date,
                "notes": item.notes
            }
            for item in created_supply.items
        ]
    }

    return response_data


# Остальные функции остаются без изменений...
def update_supply(db: Session, supply_id: int, supply_update: SupplyUpdate) -> Optional[Supply]:
    """Обновление существующей поставки"""
    db_supply = get_supply(db, supply_id)
    if not db_supply:
        return None

    # Обновляем поля поставки
    update_data = supply_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supply, key, value)

    db_supply.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_supply)
    return db_supply


def delete_supply(db: Session, supply_id: int) -> bool:
    """Удаление поставки"""
    supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not supply:
        return False

    db.delete(supply)
    db.commit()
    return True


def get_supply_item(db: Session, item_id: int) -> Optional[SupplyItem]:
    """Получение элемента поставки по ID"""
    return db.query(SupplyItem).filter(SupplyItem.id == item_id).first()


def update_supply_item(db: Session, item_id: int, item_update: SupplyItemUpdate) -> Optional[SupplyItem]:
    """Обновление элемента поставки"""
    db_item = get_supply_item(db, item_id)
    if not db_item:
        return None

    # Обновляем поля элемента
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item


def process_received_supply(db: Session, supply_id: int, username: str) -> bool:
    """
    Обработка полученной поставки путем создания движений запасов для каждого элемента.
    """
    supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not supply:
        return False

    # Обновляем статус поставки
    supply.status = "processed"
    supply.actual_arrival_date = datetime.utcnow()

    # Обрабатываем каждый элемент поставки
    for item in supply.items:
        # Создаем движение запасов
        stock_movement = StockMovementCreate(
            product_id=item.product_id,
            warehouse_id=supply.warehouse_id,
            quantity=item.quantity_ordered,
            movement_type=StockMovementType.RECEIPT,
            movement_date=datetime.utcnow(),
            performed_by=username,
            notes=f"Поступление по поставке #{supply.id}"
        )

        # Добавляем движение запасов и обновляем запасы
        create_stock_movement(db, stock_movement, username=username)

        # Обновляем запасы на складе
        update_product_stock(
            db=db,
            product_id=item.product_id,
            warehouse_id=supply.warehouse_id,
            quantity_change=item.quantity_ordered
        )

    db.commit()
    db.refresh(supply)
    return True
