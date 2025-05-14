# app/crud/stock.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.models.stock import Stock
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.schemas.enums import StockStatus
from app.schemas.stock import StockItemCreate, StockItemPatch

logger = logging.getLogger(__name__)


def get_all_stocks(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[int] = None,
        warehouse_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Получение всех записей о запасах с возможностью фильтрации.
    Возвращает расширенную информацию со статусами и именами продуктов и складов.
    """
    query = db.query(
        Stock,
        Product.name.label("product_name"),
        Warehouse.name.label("warehouse_name")
    ).join(
        Product, Stock.product_id == Product.id
    ).join(
        Warehouse, Stock.warehouse_id == Warehouse.id
    )

    if product_id:
        query = query.filter(Stock.product_id == product_id)

    if warehouse_id:
        query = query.filter(Stock.warehouse_id == warehouse_id)

    results = query.offset(skip).limit(limit).all()

    # Формирование результата с дополнительными расчетными полями
    stocks = []
    for stock, product_name, warehouse_name in results:
        # Определение статуса по количеству
        status = StockStatus.IN_STOCK

        # Проверяем наличие полей minimum_quantity и maximum_quantity, которые могут быть добавлены позже
        minimum_quantity = getattr(stock, 'minimum_quantity', 30)  # Значение по умолчанию, если поле не существует
        maximum_quantity = getattr(stock, 'maximum_quantity', None)

        if stock.quantity <= 0:
            status = StockStatus.OUT_OF_STOCK
        elif minimum_quantity and stock.quantity < minimum_quantity:
            status = StockStatus.LOW_STOCK
        elif maximum_quantity and stock.quantity > maximum_quantity:
            status = StockStatus.OVER_STOCK

        # Форматируем результат согласно схеме фронтенда
        stock_dict = {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": product_name,
            "warehouse_id": str(stock.warehouse_id),
            "warehouse_name": warehouse_name,
            "quantity": stock.quantity,
            "minimum_quantity": minimum_quantity,
            "reorder_level": getattr(stock, 'reorder_level', 50),
            "quantity_reserved": getattr(stock, 'quantity_reserved', 0),
            "maximum_quantity": maximum_quantity,
            "last_count_date": stock.updated_at.isoformat() if stock.updated_at else datetime.now().isoformat(),
            "last_counted_by": getattr(stock, 'last_counted_by', None) or "admin",
            "status": status.value
        }
        stocks.append(stock_dict)

    return stocks


def get_stock_by_id(db: Session, stock_id: int) -> Optional[Dict[str, Any]]:
    """Получение запаса по ID с дополнительной информацией"""
    result = db.query(
        Stock,
        Product.name.label("product_name"),
        Warehouse.name.label("warehouse_name")
    ).join(
        Product, Stock.product_id == Product.id
    ).join(
        Warehouse, Stock.warehouse_id == Warehouse.id
    ).filter(
        Stock.id == stock_id
    ).first()

    if not result:
        return None

    stock, product_name, warehouse_name = result

    # Определение статуса
    status = StockStatus.IN_STOCK
    minimum_quantity = getattr(stock, 'minimum_quantity', 30)
    maximum_quantity = getattr(stock, 'maximum_quantity', None)

    if stock.quantity <= 0:
        status = StockStatus.OUT_OF_STOCK
    elif minimum_quantity and stock.quantity < minimum_quantity:
        status = StockStatus.LOW_STOCK
    elif maximum_quantity and stock.quantity > maximum_quantity:
        status = StockStatus.OVER_STOCK

    # Формирование результата
    return {
        "id": str(stock.id),
        "product_id": str(stock.product_id),
        "product_name": product_name,
        "warehouse_id": str(stock.warehouse_id),
        "warehouse_name": warehouse_name,
        "quantity": stock.quantity,
        "minimum_quantity": minimum_quantity,
        "reorder_level": getattr(stock, 'reorder_level', 50),
        "quantity_reserved": getattr(stock, 'quantity_reserved', 0),
        "maximum_quantity": maximum_quantity,
        "last_count_date": stock.updated_at.isoformat() if stock.updated_at else datetime.now().isoformat(),
        "last_counted_by": getattr(stock, 'last_counted_by', None) or "admin",
        "status": status.value
    }


def get_product_stock_in_warehouse(db: Session, product_id: int, warehouse_id: int) -> Optional[Stock]:
    """Получение запаса продукта на складе"""
    return db.query(Stock).filter(
        Stock.product_id == product_id,
        Stock.warehouse_id == warehouse_id
    ).first()


def create_or_update_stock(
        db: Session,
        stock_data: StockItemCreate,
        username: str = "admin"
) -> Dict[str, Any]:
    """
    Создание или обновление запаса продукта на складе.
    Возвращает расширенную информацию о запасе.
    """
    try:
        # Проверяем наличие продукта и склада
        product = db.query(Product).filter(Product.id == int(stock_data.product_id)).first()
        warehouse = db.query(Warehouse).filter(Warehouse.id == int(stock_data.warehouse_id)).first()

        if not product or not warehouse:
            raise ValueError("Product or warehouse not found")

        # Ищем существующий запас
        stock = get_product_stock_in_warehouse(
            db,
            int(stock_data.product_id),
            int(stock_data.warehouse_id)
        )

        current_time = datetime.now()

        if stock:
            # Обновление существующего запаса
            stock.quantity = stock_data.quantity

            # Обновляем дополнительные поля, если они существуют в модели
            if hasattr(Stock, 'minimum_quantity'):
                stock.minimum_quantity = stock_data.minimum_quantity

            if hasattr(Stock, 'maximum_quantity') and stock_data.maximum_quantity:
                stock.maximum_quantity = stock_data.maximum_quantity

            if hasattr(Stock, 'reorder_level'):
                stock.reorder_level = stock_data.reorder_level

            if hasattr(Stock, 'quantity_reserved'):
                stock.quantity_reserved = stock_data.quantity_reserved or 0

            if hasattr(Stock, 'last_counted_by'):
                stock.last_counted_by = username

            stock.updated_at = current_time
        else:
            # Создание нового запаса
            stock_model_params = {
                "product_id": int(stock_data.product_id),
                "warehouse_id": int(stock_data.warehouse_id),
                "quantity": stock_data.quantity,
                "updated_at": current_time
            }

            # Добавляем дополнительные поля, если они есть в модели
            if hasattr(Stock, 'minimum_quantity'):
                stock_model_params["minimum_quantity"] = stock_data.minimum_quantity

            if hasattr(Stock, 'maximum_quantity') and stock_data.maximum_quantity:
                stock_model_params["maximum_quantity"] = stock_data.maximum_quantity

            if hasattr(Stock, 'reorder_level'):
                stock_model_params["reorder_level"] = stock_data.reorder_level

            if hasattr(Stock, 'quantity_reserved'):
                stock_model_params["quantity_reserved"] = stock_data.quantity_reserved or 0

            if hasattr(Stock, 'last_counted_by'):
                stock_model_params["last_counted_by"] = username

            if hasattr(Stock, 'status'):
                stock_model_params["status"] = (
                    StockStatus.OUT_OF_STOCK.value if stock_data.quantity <= 0
                    else StockStatus.LOW_STOCK.value if stock_data.quantity < stock_data.minimum_quantity
                    else StockStatus.IN_STOCK.value
                )

            stock = Stock(**stock_model_params)
            db.add(stock)

        db.commit()
        db.refresh(stock)

        # Определяем статус для ответа
        status = StockStatus.IN_STOCK
        if stock.quantity <= 0:
            status = StockStatus.OUT_OF_STOCK
        elif stock.quantity < stock_data.minimum_quantity:
            status = StockStatus.LOW_STOCK
        elif stock_data.maximum_quantity and stock.quantity > stock_data.maximum_quantity:
            status = StockStatus.OVER_STOCK

        # Формируем ответ
        return {
            "id": str(stock.id),
            "product_id": stock_data.product_id,
            "product_name": product.name,
            "warehouse_id": stock_data.warehouse_id,
            "warehouse_name": warehouse.name,
            "quantity": stock.quantity,
            "minimum_quantity": stock_data.minimum_quantity,
            "reorder_level": stock_data.reorder_level,
            "quantity_reserved": stock_data.quantity_reserved or 0,
            "maximum_quantity": stock_data.maximum_quantity,
            "last_count_date": stock.updated_at.isoformat(),
            "last_counted_by": username,
            "status": status.value
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating/updating stock: {str(e)}")
        raise


def update_stock(
        db: Session,
        stock_id: int,
        stock_update: StockItemPatch,
        username: str = "admin"
) -> Optional[Dict[str, Any]]:
    """
    Обновление запаса по ID.
    Обновляет только предоставленные поля.
    """
    try:
        # Получаем существующий запас
        stock = db.query(Stock).filter(Stock.id == stock_id).first()
        if not stock:
            return None

        # Обновляем только предоставленные поля
        update_data = stock_update.dict(exclude_unset=True)

        # Обрабатываем поля, которые могут быть в схеме, но не в модели
        has_custom_fields = False
        for key, value in update_data.items():
            if hasattr(stock, key):
                setattr(stock, key, value)
                has_custom_fields = True

        # Если не нашли ни одного поля для обновления, обновляем хотя бы quantity, если оно предоставлено
        if not has_custom_fields and "quantity" in update_data:
            stock.quantity = update_data["quantity"]

        # Всегда обновляем дату
        stock.updated_at = datetime.now()

        # Обновляем last_counted_by, если есть такое поле
        if hasattr(stock, 'last_counted_by'):
            stock.last_counted_by = update_data.get("last_counted_by", username)

        # Обновляем статус, если есть такое поле
        if hasattr(stock, 'status') and "status" in update_data:
            stock.status = update_data["status"]

        db.commit()
        db.refresh(stock)

        # Получаем связанные данные для ответа
        product = db.query(Product).filter(Product.id == stock.product_id).first()
        warehouse = db.query(Warehouse).filter(Warehouse.id == stock.warehouse_id).first()

        # Определяем статус для ответа
        minimum_quantity = getattr(stock, 'minimum_quantity', 30)
        maximum_quantity = getattr(stock, 'maximum_quantity', None)

        status = StockStatus.IN_STOCK
        if stock.quantity <= 0:
            status = StockStatus.OUT_OF_STOCK
        elif minimum_quantity and stock.quantity < minimum_quantity:
            status = StockStatus.LOW_STOCK
        elif maximum_quantity and stock.quantity > maximum_quantity:
            status = StockStatus.OVER_STOCK

        # Формируем ответ
        return {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": product.name if product else "Unknown Product",
            "warehouse_id": str(stock.warehouse_id),
            "warehouse_name": warehouse.name if warehouse else "Unknown Warehouse",
            "quantity": stock.quantity,
            "minimum_quantity": minimum_quantity,
            "reorder_level": getattr(stock, 'reorder_level', 50),
            "quantity_reserved": getattr(stock, 'quantity_reserved', 0),
            "maximum_quantity": maximum_quantity,
            "last_count_date": stock.updated_at.isoformat(),
            "last_counted_by": getattr(stock, 'last_counted_by', username),
            "status": getattr(stock, 'status', status.value)
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating stock: {str(e)}")
        raise


def adjust_stock_quantity(
        db: Session,
        product_id: int,
        warehouse_id: int,
        quantity_change: int,
        username: str = "admin"
) -> Optional[Dict[str, Any]]:
    """
    Изменение количества запаса продукта на складе.
    Положительное quantity_change увеличивает запас, отрицательное - уменьшает.
    """
    try:
        # Проверяем наличие продукта и склада
        product = db.query(Product).filter(Product.id == product_id).first()
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

        if not product or not warehouse:
            return None

        # Получаем текущий запас
        stock = get_product_stock_in_warehouse(db, product_id, warehouse_id)

        current_time = datetime.now()

        if stock:
            # Обновляем существующий запас
            new_quantity = stock.quantity + quantity_change
            stock.quantity = max(0, new_quantity)  # Не допускаем отрицательных значений
            stock.updated_at = current_time

            # Обновляем last_counted_by, если есть такое поле
            if hasattr(stock, 'last_counted_by'):
                stock.last_counted_by = username

            # Обновляем статус, если есть такое поле
            if hasattr(stock, 'status'):
                minimum_quantity = getattr(stock, 'minimum_quantity', 30)
                maximum_quantity = getattr(stock, 'maximum_quantity', None)

                if stock.quantity <= 0:
                    stock.status = StockStatus.OUT_OF_STOCK.value
                elif minimum_quantity and stock.quantity < minimum_quantity:
                    stock.status = StockStatus.LOW_STOCK.value
                elif maximum_quantity and stock.quantity > maximum_quantity:
                    stock.status = StockStatus.OVER_STOCK.value
                else:
                    stock.status = StockStatus.IN_STOCK.value
        else:
            # Создаем новый запас, только если изменение положительное
            if quantity_change <= 0:
                return None

            stock_model_params = {
                "product_id": product_id,
                "warehouse_id": warehouse_id,
                "quantity": quantity_change,
                "updated_at": current_time
            }

            # Добавляем дополнительные поля, если они есть в модели
            if hasattr(Stock, 'minimum_quantity'):
                stock_model_params["minimum_quantity"] = 30  # Значение по умолчанию

            if hasattr(Stock, 'reorder_level'):
                stock_model_params["reorder_level"] = 50  # Значение по умолчанию

            if hasattr(Stock, 'last_counted_by'):
                stock_model_params["last_counted_by"] = username

            if hasattr(Stock, 'status'):
                stock_model_params["status"] = StockStatus.IN_STOCK.value

            stock = Stock(**stock_model_params)
            db.add(stock)

        db.commit()
        db.refresh(stock)

        # Определяем статус для ответа
        minimum_quantity = getattr(stock, 'minimum_quantity', 30)
        maximum_quantity = getattr(stock, 'maximum_quantity', None)

        status = StockStatus.IN_STOCK
        if stock.quantity <= 0:
            status = StockStatus.OUT_OF_STOCK
        elif minimum_quantity and stock.quantity < minimum_quantity:
            status = StockStatus.LOW_STOCK
        elif maximum_quantity and stock.quantity > maximum_quantity:
            status = StockStatus.OVER_STOCK

        # Формируем ответ
        return {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": product.name,
            "warehouse_id": str(stock.warehouse_id),
            "warehouse_name": warehouse.name,
            "quantity": stock.quantity,
            "minimum_quantity": getattr(stock, 'minimum_quantity', 30),
            "reorder_level": getattr(stock, 'reorder_level', 50),
            "quantity_reserved": getattr(stock, 'quantity_reserved', 0),
            "maximum_quantity": maximum_quantity,
            "last_count_date": stock.updated_at.isoformat(),
            "last_counted_by": getattr(stock, 'last_counted_by', username),
            "status": getattr(stock, 'status', status.value)
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error adjusting stock quantity: {str(e)}")
        raise


def update_product_stock(db: Session, product_id: int, warehouse_id: int, quantity_change: int) -> Optional[Dict[str, Any]]:
    """
    Обновляет количество продукта на складе.
    Положительное значение quantity_change увеличивает запас, отрицательное - уменьшает.
    """
    return adjust_stock_quantity(
        db=db,
        product_id=product_id,
        warehouse_id=warehouse_id,
        quantity_change=quantity_change
    )


def delete_stock(db: Session, stock_id: int) -> bool:
    """Удаление записи о запасе"""
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not stock:
        return False

    try:
        db.delete(stock)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting stock: {str(e)}")
        return False


def calculate_stock_metrics(db: Session, product_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Расчёт статистики по запасам:
    - Общее количество товаров на всех складах
    - Количество товаров по статусам (в наличии, мало, нет)
    - Статистика по складам
    """
    try:
        query = db.query(Stock)

        if product_id:
            query = query.filter(Stock.product_id == product_id)

        stocks = query.all()

        total_quantity = sum(stock.quantity for stock in stocks)

        # Считаем количество товаров по статусам
        statuses = {
            "in_stock": 0,
            "low_stock": 0,
            "out_of_stock": 0,
            "over_stock": 0
        }

        # Группировка по складам
        warehouse_stats = {}

        for stock in stocks:
            minimum_quantity = getattr(stock, 'minimum_quantity', 30)
            maximum_quantity = getattr(stock, 'maximum_quantity', None)

            # Определяем статус
            if stock.quantity <= 0:
                status = "out_of_stock"
            elif minimum_quantity and stock.quantity < minimum_quantity:
                status = "low_stock"
            elif maximum_quantity and stock.quantity > maximum_quantity:
                status = "over_stock"
            else:
                status = "in_stock"

            statuses[status] += 1

            # Добавляем в статистику по складам
            wh_id = str(stock.warehouse_id)
            if wh_id not in warehouse_stats:
                warehouse = db.query(Warehouse).filter(Warehouse.id == stock.warehouse_id).first()
                warehouse_stats[wh_id] = {
                    "id": wh_id,
                    "name": warehouse.name if warehouse else f"Warehouse {wh_id}",
                    "total_quantity": 0,
                    "product_count": 0
                }

            warehouse_stats[wh_id]["total_quantity"] += stock.quantity
            warehouse_stats[wh_id]["product_count"] += 1

        return {
            "total_quantity": total_quantity,
            "statuses": statuses,
            "warehouses": list(warehouse_stats.values())
        }

    except Exception as e:
        logger.error(f"Error calculating stock metrics: {str(e)}")
        return {
            "total_quantity": 0,
            "statuses": {
                "in_stock": 0,
                "low_stock": 0,
                "out_of_stock": 0,
                "over_stock": 0
            },
            "warehouses": []
        }