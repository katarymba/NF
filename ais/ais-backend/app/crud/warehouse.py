# app/crud/warehouse.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
import logging

from app.models.warehouse import Warehouse
from app.models.stock import Stock
from app.models.product import Product
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate
from app.schemas.enums import WarehouseType, StockStatus

logger = logging.getLogger(__name__)


def _convert_warehouse_type_to_display(warehouse_type) -> str:
    """
    Вспомогательная функция для преобразования типа склада в формат для отображения.
    """
    display_type = "general"

    if warehouse_type:
        # Если тип — это Enum объект (SQLAlchemy Enum)
        if hasattr(warehouse_type, 'value'):
            # Преобразуем WAREHOUSE -> general и STORE -> display
            if warehouse_type.value == "WAREHOUSE":
                display_type = "general"
            elif warehouse_type.value == "STORE":
                display_type = "display"
            elif warehouse_type.value in ["FRIDGE", "FREEZER", "GENERAL", "EXTERNAL"]:
                display_type = warehouse_type.value.lower()
        # Если тип — это строка (прямое значение из БД)
        elif isinstance(warehouse_type, str):
            if warehouse_type == "WAREHOUSE":
                display_type = "general"
            elif warehouse_type == "STORE":
                display_type = "display"
            else:
                display_type = warehouse_type.lower()

    return display_type


def _convert_frontend_type_to_warehouse_type(frontend_type) -> WarehouseType:
    """
    Вспомогательная функция для преобразования типа из фронтенда в тип склада.
    """
    if isinstance(frontend_type, WarehouseType):
        return frontend_type

    if isinstance(frontend_type, str):
        # Преобразование строковых значений от фронтенда в enum
        type_map = {
            "general": WarehouseType.WAREHOUSE,
            "display": WarehouseType.STORE,
            "fridge": WarehouseType.FRIDGE,
            "freezer": WarehouseType.FREEZER,
            "external": WarehouseType.EXTERNAL
        }
        return type_map.get(frontend_type.lower(), WarehouseType.WAREHOUSE)

    return WarehouseType.WAREHOUSE


def _format_warehouse_response(warehouse: Warehouse) -> Dict[str, Any]:
    """
    Вспомогательная функция для форматирования ответа с информацией о складе.
    """
    display_type = _convert_warehouse_type_to_display(warehouse.type)

    return {
        "id": str(warehouse.id),
        "name": warehouse.name,
        "address": warehouse.address or "",
        "type": display_type,
        "is_active": True,
        "capacity": getattr(warehouse, 'capacity', None),
        "manager_name": getattr(warehouse, 'manager_name', None),
        "phone": getattr(warehouse, 'phone', None),
        "created_at": warehouse.created_at.isoformat() if hasattr(warehouse,
                                                                  'created_at') and warehouse.created_at else datetime.now().isoformat()
    }


def get_all_warehouses(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name: Optional[str] = None,
        type: Optional[WarehouseType] = None
) -> List[Dict[str, Any]]:
    """
    Получение списка складов с возможностью фильтрации.
    Возвращает склады в формате, подходящем для фронтенда.
    """
    query = db.query(Warehouse)

    if name:
        query = query.filter(Warehouse.name.ilike(f"%{name}%"))

    if type:
        query = query.filter(Warehouse.type == type)

    warehouses = query.offset(skip).limit(limit).all()

    # Подготовка результата для фронтенда
    result = []
    for warehouse in warehouses:
        warehouse_data = _format_warehouse_response(warehouse)
        result.append(warehouse_data)

    return result


def get_warehouse_by_id(db: Session, warehouse_id: int) -> Optional[Dict[str, Any]]:
    """
    Получение информации о складе по ID.
    Добавляет статистику по запасам на складе.
    """
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

    if not warehouse:
        return None

    # Получаем статистику по запасам на складе
    stock_stats = db.query(
        func.count(Stock.id).label("total_items"),
        func.sum(Stock.quantity).label("total_quantity")
    ).filter(
        Stock.warehouse_id == warehouse_id
    ).first()

    # Подсчет товаров по группам (категориям)
    product_categories = db.query(
        Product.category_id,
        func.count(Stock.id).label("items_count"),
        func.sum(Stock.quantity).label("total_quantity")
    ).join(
        Stock, Stock.product_id == Product.id
    ).filter(
        Stock.warehouse_id == warehouse_id
    ).group_by(
        Product.category_id
    ).all()

    # Получаем категории для ответа
    categories = []
    for cat_id, items_count, total_quantity in product_categories:
        if cat_id:
            # Получаем имя категории через отдельный import
            from app.crud.category import get_category_by_id
            category = get_category_by_id(db, cat_id)
            cat_name = category.name if category else f"Category {cat_id}"

            categories.append({
                "id": str(cat_id),
                "name": cat_name,
                "items_count": items_count,
                "total_quantity": total_quantity or 0
            })

    # Формируем ответ на базе общего форматирования
    warehouse_data = _format_warehouse_response(warehouse)
    warehouse_data["stock_stats"] = {
        "total_items": stock_stats.total_items or 0,
        "total_quantity": stock_stats.total_quantity or 0,
        "categories": categories
    }

    return warehouse_data


def get_warehouse_with_stocks(db: Session, warehouse_id: int) -> Optional[Dict[str, Any]]:
    """
    Получение информации о складе вместе со списком всех запасов на нем.
    """
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

    if not warehouse:
        return None

    # Получаем запасы на складе
    stocks = db.query(
        Stock,
        Product.name.label("product_name"),
        Product.category_id
    ).join(
        Product, Stock.product_id == Product.id
    ).filter(
        Stock.warehouse_id == warehouse_id
    ).all()

    # Формируем основную информацию о складе
    warehouse_data = _format_warehouse_response(warehouse)
    warehouse_data["stocks"] = []

    # Добавляем информацию о запасах
    for stock, product_name, category_id in stocks:
        # Определяем статус запаса
        minimum_quantity = getattr(stock, 'minimum_quantity', 30)
        maximum_quantity = getattr(stock, 'maximum_quantity', None)

        status = StockStatus.IN_STOCK.value
        if stock.quantity <= 0:
            status = StockStatus.OUT_OF_STOCK.value
        elif minimum_quantity and stock.quantity < minimum_quantity:
            status = StockStatus.LOW_STOCK.value
        elif maximum_quantity and stock.quantity > maximum_quantity:
            status = StockStatus.OVER_STOCK.value

        stock_data = {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": product_name,
            "category_id": str(category_id) if category_id else None,
            "quantity": stock.quantity,
            "minimum_quantity": getattr(stock, 'minimum_quantity', 30),
            "reorder_level": getattr(stock, 'reorder_level', 50),
            "quantity_reserved": getattr(stock, 'quantity_reserved', 0),
            "maximum_quantity": maximum_quantity,
            "last_count_date": stock.updated_at.isoformat() if stock.updated_at else datetime.now().isoformat(),
            "last_counted_by": getattr(stock, 'last_counted_by', "admin"),
            "status": status
        }
        warehouse_data["stocks"].append(stock_data)

    return warehouse_data


def create_warehouse(db: Session, warehouse_data: WarehouseCreate) -> Dict[str, Any]:
    """
    Создание нового склада.
    """
    try:
        # Определяем тип склада для сохранения в БД
        warehouse_type = _convert_frontend_type_to_warehouse_type(warehouse_data.type)

        # Создаем параметры для создания склада
        warehouse_model_params = {
            "name": warehouse_data.name,
            "address": warehouse_data.address,
            "type": warehouse_type
        }

        # Добавляем дополнительные поля, если они есть в модели
        if hasattr(Warehouse, 'capacity'):
            warehouse_model_params["capacity"] = warehouse_data.capacity

        if hasattr(Warehouse, 'manager_name'):
            warehouse_model_params["manager_name"] = warehouse_data.manager_name

        if hasattr(Warehouse, 'phone'):
            warehouse_model_params["phone"] = warehouse_data.phone

        if hasattr(Warehouse, 'created_at'):
            warehouse_model_params["created_at"] = datetime.now()

        # Создаем новый склад
        new_warehouse = Warehouse(**warehouse_model_params)
        db.add(new_warehouse)
        db.commit()
        db.refresh(new_warehouse)

        # Форматируем ответ
        return _format_warehouse_response(new_warehouse)

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating warehouse: {str(e)}")
        raise


def update_warehouse(db: Session, warehouse_id: int, warehouse_data: WarehouseUpdate) -> Optional[Dict[str, Any]]:
    """
    Обновление существующего склада.
    """
    try:
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

        if not warehouse:
            return None

        # Обновляем только предоставленные поля
        update_data = warehouse_data.dict(exclude_unset=True)

        # Обрабатываем тип склада отдельно, если он предоставлен
        if "type" in update_data:
            update_data["type"] = _convert_frontend_type_to_warehouse_type(update_data["type"])

        # Обновляем остальные поля
        for key, value in update_data.items():
            if hasattr(warehouse, key):
                setattr(warehouse, key, value)

        db.commit()
        db.refresh(warehouse)

        # Форматируем ответ
        return _format_warehouse_response(warehouse)

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating warehouse: {str(e)}")
        raise


def delete_warehouse(db: Session, warehouse_id: int) -> bool:
    """
    Удаление склада, если на нем нет запасов.
    """
    try:
        # Проверяем наличие запасов на складе
        stocks_count = db.query(func.count(Stock.id)).filter(Stock.warehouse_id == warehouse_id).scalar()

        if stocks_count > 0:
            logger.warning(f"Cannot delete warehouse {warehouse_id} with {stocks_count} stocks")
            return False

        # Получаем склад
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

        if not warehouse:
            return False

        # Удаляем склад
        db.delete(warehouse)
        db.commit()

        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting warehouse: {str(e)}")
        return False


def get_warehouse_statistics(db: Session) -> Dict[str, Any]:
    """
    Получение общей статистики по всем складам.
    """
    try:
        # Получаем количество складов
        warehouses_count = db.query(func.count(Warehouse.id)).scalar()

        # Получаем количество товаров и общее количество по всем складам
        stock_stats = db.query(
            func.count(Stock.id).label("total_items"),
            func.sum(Stock.quantity).label("total_quantity")
        ).first()

        # Получаем статистику по типам складов
        warehouse_types = db.query(
            Warehouse.type,
            func.count(Warehouse.id).label("count")
        ).group_by(Warehouse.type).all()

        # Форматируем типы для ответа
        types_stats = []
        for wh_type, count in warehouse_types:
            display_type = _convert_warehouse_type_to_display(wh_type)
            types_stats.append({
                "type": display_type,
                "count": count
            })

        return {
            "total_warehouses": warehouses_count or 0,
            "total_stock_items": stock_stats.total_items or 0,
            "total_quantity": stock_stats.total_quantity or 0,
            "warehouses_by_type": types_stats
        }

    except Exception as e:
        logger.error(f"Error getting warehouse statistics: {str(e)}")
        return {
            "total_warehouses": 0,
            "total_stock_items": 0,
            "total_quantity": 0,
            "warehouses_by_type": []
        }