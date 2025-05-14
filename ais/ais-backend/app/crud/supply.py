# app/crud/supply.py
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

from app.models import Supply, SupplyItem, Product, Warehouse, StockMovement
from app.schemas import SupplyCreate, SupplyUpdate, SupplyItemUpdate, StockMovementCreate
from app.models.enums import SupplyStatus, StockMovementType
from app.crud.stock_movement import create_stock_movement, update_product_stock
from app.crud.stock import update_product_stock


def get_supplies(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        supplier: Optional[str] = None,  # Добавляем прямой параметр supplier
        warehouse_id: Optional[int] = None,  # Добавляем warehouse_id
        status: Optional[str] = None,  # Добавляем status
        filters: Dict = None,
        date_filter: Dict = None
) -> List[Supply]:
    """Получение списка поставок с возможностью фильтрации"""
    query = db.query(Supply)

    # Применяем прямые фильтры
    if supplier:
        query = query.filter(Supply.supplier == supplier)
    if warehouse_id:
        query = query.filter(Supply.warehouse_id == warehouse_id)
    if status:
        query = query.filter(Supply.status == status)

    # Применение дополнительных фильтров из словаря (оставляем для обратной совместимости)
    if filters:
        for field, value in filters.items():
            if value is not None and field not in ['supplier', 'warehouse_id', 'status']:  # Избегаем дублирования
                query = query.filter(getattr(Supply, field) == value)

    # Фильтрация по диапазону дат
    if date_filter and "start" in date_filter:
        query = query.filter(Supply.shipment_date >= date_filter["start"])
    if date_filter and "end" in date_filter:
        query = query.filter(Supply.shipment_date <= date_filter["end"])

    # Загружаем связанные данные для оптимизации запросов
    query = query.options(joinedload(Supply.items), joinedload(Supply.warehouse))

    # Применяем пагинацию и сортировку
    return query.order_by(Supply.created_at.desc()).offset(skip).limit(limit).all()


def get_supply(db: Session, supply_id: int) -> Optional[Supply]:
    """Получение поставки по ID"""
    return db.query(Supply).filter(Supply.id == supply_id).options(
        joinedload(Supply.items).joinedload(SupplyItem.product),
        joinedload(Supply.warehouse)
    ).first()


def create_supply(db: Session, supply: SupplyCreate, username: str) -> Supply:
    """Создание новой поставки с элементами"""
    # Создаем запись поставки
    db_supply = Supply(
        supplier=supply.supplier,
        warehouse_id=supply.warehouse_id,
        status=supply.status,
        shipment_date=supply.shipment_date,
        expected_arrival_date=supply.expected_arrival_date,
        reference_number=supply.reference_number,
        notes=supply.notes,
        created_by=username,  # Используем имя текущего пользователя
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_supply)
    db.flush()  # Получаем ID поставки

    # Добавляем элементы поставки
    for item in supply.items:
        # Получаем название продукта, если не указано
        product_name = item.product_name
        if not product_name:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product_name = product.name
            else:
                product_name = f"Продукт ID: {item.product_id}"

        # Создаем элемент поставки
        db_item = SupplyItem(
            supply_id=db_supply.id,
            product_id=item.product_id,
            product_name=product_name,
            quantity_ordered=item.quantity_ordered,
            unit_price=item.unit_price,
            warehouse_id=item.warehouse_id,
            is_received=False
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_supply)
    return db_supply


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
    db_supply = get_supply(db, supply_id)
    if not db_supply:
        return False

    db.delete(db_supply)
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

    # Если отмечаем как полученный и дата получения не указана, устанавливаем текущую дату
    if update_data.get("is_received") and not db_item.received_date:
        db_item.received_date = datetime.utcnow()

    db.commit()
    db.refresh(db_item)
    return db_item


def process_received_supply(db: Session, supply_id: int, username: str) -> bool:
    """
    Обработка полученной поставки путем создания движений запасов для каждого элемента.
    """
    # Получаем поставку со всеми элементами
    supply = get_supply(db, supply_id)
    if not supply or supply.status == SupplyStatus.PROCESSED:
        return False

    # Меняем статус поставки
    supply.status = SupplyStatus.PROCESSED
    supply.actual_arrival_date = datetime.utcnow()
    supply.updated_at = datetime.utcnow()

    # Обрабатываем каждый элемент поставки
    for item in supply.items:
        # Помечаем элемент как полученный
        item.is_received = True
        item.received_date = supply.actual_arrival_date
        item.quantity_received = item.quantity_ordered  # По умолчанию получено столько же, сколько заказано

        # Создаем движение запасов для пополнения
        stock_movement = StockMovementCreate(
            product_id=item.product_id,
            warehouse_id=item.warehouse_id,
            quantity=item.quantity_ordered,
            type=StockMovementType.RECEIPT,
            reference_id=supply.id,
            reference_type="supply",
            notes=f"Поставка №{supply.id} от {supply.supplier}",
            unit_price=item.unit_price
        )

        # Добавляем движение запасов и обновляем запасы
        create_stock_movement(db, stock_movement, username=username)

        # Обновляем запасы на складе
        update_product_stock(
            db=db,
            product_id=item.product_id,
            warehouse_id=item.warehouse_id,
            quantity_change=item.quantity_ordered
        )

    db.commit()
    db.refresh(supply)
    return True