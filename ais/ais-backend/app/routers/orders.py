from fastapi import APIRouter, HTTPException, Depends, Path, Query
<<<<<<< HEAD
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.services.logging_service import logger
from app.services.orders_service import OrderService
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderWithPayment, OrderInDB
from app.routers.auth import get_current_user, get_current_user_optional

# Создаем роутер для заказов
router = APIRouter(tags=["Orders"])

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
    responses={404: {"description": "Заказ не найден"}},
)
=======
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
import traceback
import json

# Импортируем модули
from ..database import get_db
from ..services.logging_service import logger
from app.routers.auth import get_current_user, get_current_user_optional
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2

# Модели данных Pydantic
class OrderItem(BaseModel):
    id: int
    name: str
    quantity: int
    price: float
    product_id: Optional[int] = None
    product_name: Optional[str] = None

<<<<<<< HEAD
# Получить все заказы
@router.get("/", response_model=List[OrderWithPayment])
def get_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить все заказы в системе"""
    try:
        return OrderService.get_all_orders(db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении всех заказов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов: {str(e)}")


# Получить все заказы пользователя
@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить заказы конкретного пользователя"""
    try:
        return OrderService.get_orders_for_user(user_id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказов пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов пользователя: {str(e)}")


# Получить детали заказа
@router.get("/{order_id}", response_model=OrderWithPayment)
def get_order_detail(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить подробную информацию о заказе по его ID"""
    try:
        return OrderService.get_order(order_id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказа: {str(e)}")


# Получить детали заказа (для совместимости)
@router.get("/detail/{order_id}", response_model=OrderWithPayment)
def get_order_detail_compat(order_id: int, db: Session = Depends(get_db),
                            current_user=Depends(get_current_user_optional)):
    """Альтернативный эндпоинт для получения информации о заказе (для совместимости)"""
    return get_order_detail(order_id, db, current_user)


# Создать новый заказ
@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user_optional)):
    """Создать новый заказ"""
    try:
        return OrderService.create_new_order(order_data, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при создании заказа: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при создании заказа: {str(e)}")


# Обновление статуса заказа
@router.patch("/{order_id}/status", response_model=OrderWithPayment)
def update_order_status(
        data: dict,
        order_id: int = Path(...),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Обновить статус заказа"""
    try:
        status = data.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Статус не указан")

        return OrderService.update_order_status(order_id, status, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении статуса заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")


# Обновление данных заказа
@router.patch("/{order_id}", response_model=OrderWithPayment)
def update_order(
        order_id: int,
        data: dict,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Обновить детали заказа"""
    try:
        return OrderService.update_order_details(order_id, data, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении данных заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении данных заказа: {str(e)}")
=======
class OrderUpdate(BaseModel):
    status: str

class Order(BaseModel):
    id: int
    customer_name: Optional[str] = None
    client_name: Optional[str] = None
    status: str
    total_amount: float
    total_price: Optional[float] = None
    created_at: datetime
    tracking_number: Optional[str] = None
    delivery_address: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    payment_method: Optional[str] = None
    delivery_notes: Optional[str] = None
    courier_name: Optional[str] = None
    items: Optional[List[OrderItem]] = None
    order_items: Optional[List[OrderItem]] = None
    user_id: Optional[int] = None
    delivery_status: Optional[str] = None
    actual_delivery: Optional[datetime] = None

# Модель для создания заказа
class ExtendedOrderCreate(BaseModel):
    user_id: int
    total_amount: float
    items: List[OrderItem]

# Модель для ответа
class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    created_at: datetime
    total_amount: float
    items: Optional[List[OrderItem]] = None

# Создаем роутер для заказов - обратите внимание, что мы не указываем prefix
# Это позволит нам включить этот роутер под разными префиксами
router = APIRouter(tags=["Orders"])

# Вспомогательная функция для генерации трекинг-номера
def generate_tracking_number() -> str:
    """Генерирует случайный трекинг-номер для заказов в статусе SHIPPED или DELIVERED"""
    import random
    prefix = "TRK"
    digits = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{digits}"

# Функция для парсинга order_items
def parse_order_items(order_items_data):
    """Парсит данные о товарах из JSON или списка"""
    order_items = []
    
    if not order_items_data:
        return order_items
    
    try:
        # Если данные уже являются списком, используем их напрямую
        if isinstance(order_items_data, list):
            items_data = order_items_data
        else:
            # Иначе пробуем распарсить JSON строку
            items_data = json.loads(order_items_data)
        
        for i, item in enumerate(items_data, 1):
            product_id = item.get("product_id", i)
            product_name = item.get("product_name", f"Товар #{product_id}")
            name = item.get("name", product_name)
            
            order_items.append({
                "id": i,
                "product_id": product_id,
                "name": name,
                "product_name": product_name,
                "quantity": item.get("quantity", 1),
                "price": float(item.get("price", 0))
            })
    except Exception as e:
        logger.warning(f"Не удалось обработать данные о товарах: {str(e)}")
    
    return order_items

# Получить все заказы
@router.get("/", response_model=List[Order])
def get_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info("Запрос на получение всех заказов")
        
        # Сначала пробуем сделать rollback на случай, если предыдущая транзакция была прервана
        db.rollback()
        
        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status
        FROM orders 
        ORDER BY created_at DESC
        """)
        
        orders_result = db.execute(query).fetchall()
        
        if not orders_result:
            logger.warning("Заказы не найдены")
            return []
        
        orders = []
        for row in orders_result:
            # Получаем имя клиента либо из заказа, либо из таблицы пользователей
            client_name = row.client_name or f"Клиент #{row.user_id}"
            user_id = row.user_id or 0
            
            if not row.client_name and user_id:
                try:
                    user_query = text("""
                    SELECT full_name, username 
                    FROM users 
                    WHERE id = :user_id
                    """)
                    
                    user_row = db.execute(user_query, {"user_id": user_id}).fetchone()
                    if user_row:
                        if user_row.full_name:
                            client_name = user_row.full_name
                        elif user_row.username:
                            client_name = user_row.username
                except Exception as e:
                    logger.warning(f"Не удалось получить данные пользователя: {str(e)}")
            
            # Получаем данные о товарах в заказе из поля order_items
            order_items = parse_order_items(row.order_items)
            
            # Если товары не найдены в JSON, пробуем получить их из таблицы order_items
            if not order_items:
                try:
                    items_query = text("""
                    SELECT oi.product_id, oi.quantity, oi.price, p.name
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = :order_id
                    """)
                    
                    items_result = db.execute(items_query, {"order_id": row.id}).fetchall()
                    
                    if items_result:
                        for item_row in items_result:
                            product_name = item_row.name or f"Товар #{item_row.product_id}"
                            
                            order_items.append({
                                "id": item_row.product_id,
                                "product_id": item_row.product_id,
                                "name": product_name,
                                "product_name": product_name,
                                "quantity": item_row.quantity,
                                "price": float(item_row.price or 0)
                            })
                except Exception as e:
                    logger.warning(f"Не удалось получить данные о товарах из таблицы: {str(e)}")
            
            # Если товары все еще не найдены, создаем заглушку для необходимого поля
            if not order_items:
                order_items = [
                    {
                        "id": 1,
                        "product_id": 1,
                        "name": f"Товары в заказе #{row.id}",
                        "product_name": f"Товары в заказе #{row.id}",
                        "quantity": 1,
                        "price": float(row.total_price or 0)
                    }
                ]
            
            # Создаем словарь с данными заказа
            order_dict = {
                "id": row.id,
                "user_id": user_id,
                "customer_name": client_name,
                "client_name": client_name,
                "status": row.status.strip() if row.status else "pending",
                "total_amount": float(row.total_price or 0),
                "total_price": float(row.total_price or 0),
                "created_at": row.created_at or datetime.now(),
                "tracking_number": row.tracking_number,
                "delivery_address": row.delivery_address or "",
                "estimated_delivery": row.estimated_delivery,
                "payment_method": row.payment_method,
                "delivery_notes": row.delivery_notes,
                "courier_name": row.courier_name,
                "items": order_items,
                "order_items": order_items,
                "delivery_status": row.delivery_status,
                "actual_delivery": row.actual_delivery
            }
            orders.append(Order(**order_dict))
        
        logger.info(f"Найдено {len(orders)} заказов")
        return orders
    
    except Exception as e:
        # Делаем rollback в случае ошибки
        db.rollback()
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказов: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов: {str(e)}")
        
# Получить все заказы пользователя
@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Запрос на получение заказов пользователя {user_id}")
        
        query = text("""
        SELECT id, user_id, total_price, created_at, status, order_items 
        FROM orders 
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        """)
        
        orders_result = db.execute(query, {"user_id": user_id}).fetchall()
        
        if not orders_result:
            return []
        
        orders = []
        for row in orders_result:
            order_items = parse_order_items(row.order_items)
            
            order = OrderResponse(
                id=row.id,
                user_id=row.user_id,
                status=row.status.strip() if row.status else "pending",
                created_at=row.created_at or datetime.now(),
                total_amount=float(row.total_price or 0),
                items=order_items
            )
            orders.append(order)
        
        return orders
    except Exception as e:
        logger.error(f"Ошибка при получении заказов пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов пользователя: {str(e)}")

# Получить детали заказа
@router.get("/{order_id}", response_model=Order)
def get_order_detail(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Запрос на получение заказа с ID {order_id}")
        
        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status
        FROM orders 
        WHERE id = :order_id
        """)
        
        order_row = db.execute(query, {"order_id": order_id}).fetchone()
        
        if not order_row:
            logger.warning(f"Заказ с ID {order_id} не найден")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Получаем имя клиента либо из заказа, либо из таблицы пользователей
        client_name = order_row.client_name or f"Клиент #{order_row.user_id}"
        user_id = order_row.user_id or 0
        
        # Получаем данные о товарах в заказе из поля order_items
        order_items = parse_order_items(order_row.order_items)
        
        # Если товары не найдены, создаем заглушку
        if not order_items:
            order_items = [
                {
                    "id": 1,
                    "product_id": 1,
                    "name": f"Товары в заказе #{order_id}",
                    "product_name": f"Товары в заказе #{order_id}",
                    "quantity": 1,
                    "price": float(order_row.total_price or 0)
                }
            ]
        
        # Создаем словарь с данными заказа
        order_dict = {
            "id": order_row.id,
            "user_id": user_id,
            "customer_name": client_name,
            "client_name": client_name,
            "status": order_row.status.strip() if order_row.status else "pending",
            "total_amount": float(order_row.total_price or 0),
            "total_price": float(order_row.total_price or 0),
            "created_at": order_row.created_at or datetime.now(),
            "tracking_number": order_row.tracking_number,
            "delivery_address": order_row.delivery_address or "",
            "estimated_delivery": order_row.estimated_delivery,
            "payment_method": order_row.payment_method,
            "delivery_notes": order_row.delivery_notes,
            "courier_name": order_row.courier_name,
            "items": order_items,
            "order_items": order_items,
            "delivery_status": order_row.delivery_status,
            "actual_delivery": order_row.actual_delivery
        }
        
        logger.info(f"Заказ с ID {order_id} успешно получен")
        return Order(**order_dict)
    except HTTPException:
        raise
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказа: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказа: {str(e)}")

# Получить детали заказа (для совместимости)
@router.get("/detail/{order_id}", response_model=Order)
def get_order_detail_compat(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    return get_order_detail(order_id, db, current_user)

# Создать новый заказ
@router.post("/", response_model=OrderResponse)
def create_order(order_data: ExtendedOrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Запрос на создание нового заказа для пользователя {order_data.user_id}")
        
        # Проверяем существование пользователя
        user_query = text("SELECT id FROM users WHERE id = :user_id")
        user_exists = db.execute(user_query, {"user_id": order_data.user_id}).fetchone()
        
        if not user_exists:
            logger.warning(f"Пользователь с ID {order_data.user_id} не найден")
            raise HTTPException(status_code=404, detail=f"Пользователь с ID {order_data.user_id} не найден")
        
        # Создаем заказ
        order_items_json = json.dumps([{
            "product_id": item.product_id,
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price
        } for item in order_data.items])
        
        insert_query = text("""
        INSERT INTO orders (user_id, total_price, created_at, status, order_items)
        VALUES (:user_id, :total_price, CURRENT_TIMESTAMP, 'pending', :order_items)
        RETURNING id, created_at
        """)
        
        result = db.execute(insert_query, {
            "user_id": order_data.user_id,
            "total_price": order_data.total_amount,
            "order_items": order_items_json
        }).fetchone()
        
        if not result:
            raise HTTPException(status_code=500, detail="Не удалось создать заказ")
        
        db.commit()
        
        # Возвращаем созданный заказ
        return OrderResponse(
            id=result.id,
            user_id=order_data.user_id,
            status="pending",
            created_at=result.created_at,
            total_amount=order_data.total_amount,
            items=order_data.items
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании заказа: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при создании заказа: {str(e)}")

# Обновление статуса заказа
@router.patch("/{order_id}/status", response_model=Order)
def update_order_status(order_update: OrderUpdate, order_id: int = Path(...), db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Запрос на изменение статуса заказа {order_id} на {order_update.status}")
        
        # Проверка наличия заказа
        check_query = text("SELECT id, status FROM orders WHERE id = :order_id")
        check_result = db.execute(check_query, {"order_id": order_id}).fetchone()
        
        if not check_result:
            logger.warning(f"Заказ с ID {order_id} не найден при попытке изменения статуса")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Если статус уже такой же, ничего не делаем
        current_status = check_result.status.strip() if check_result.status else ""
        if current_status == order_update.status:
            logger.info(f"Статус заказа {order_id} уже установлен в {order_update.status}")
            return get_order_detail(order_id, db, current_user)
        
        # Обновление статуса
        try:
            # Обновление статуса заказа
            update_query = text("""
            UPDATE orders
            SET status = :status
            WHERE id = :order_id
            """)
            
            db.execute(update_query, {
                "status": order_update.status,
                "order_id": order_id
            })
            
            # Определяем соответствующий статус доставки
            delivery_status = None
            if order_update.status == "processing":
                delivery_status = "preparing"
            elif order_update.status == "shipped":
                delivery_status = "in_transit"
            elif order_update.status == "delivered":
                delivery_status = "delivered"
            
            # Обновляем статус доставки
            if delivery_status:
                update_delivery_status_query = text("""
                UPDATE orders
                SET delivery_status = :delivery_status
                WHERE id = :order_id
                """)
                
                db.execute(update_delivery_status_query, {
                    "delivery_status": delivery_status,
                    "order_id": order_id
                })
                
                logger.info(f"Статус доставки для заказа {order_id} обновлен: {delivery_status}")
            
            # Обновление трекинг-номера для заказов в статусе shipped или delivered
            if order_update.status in ["shipped", "delivered"]:
                # Проверяем, есть ли уже номер для этого заказа
                check_tracking_query = text("""
                SELECT tracking_number
                FROM orders
                WHERE id = :order_id
                """)
                
                tracking_row = db.execute(check_tracking_query, {"order_id": order_id}).fetchone()
                
                if not tracking_row or not tracking_row.tracking_number:
                    # Генерируем новый трекинг-номер
                    new_tracking = generate_tracking_number()
                    
                    # Обновляем трекинг-номер в таблице orders
                    update_tracking_query = text("""
                    UPDATE orders
                    SET tracking_number = :tracking_number
                    WHERE id = :order_id
                    """)
                    
                    db.execute(update_tracking_query, {
                        "tracking_number": new_tracking,
                        "order_id": order_id
                    })
                    
                    logger.info(f"Трекинг-номер для заказа {order_id} обновлен: {new_tracking}")
            
            # Если заказ доставлен, фиксируем дату доставки
            if order_update.status == "delivered":
                update_delivery_date_query = text("""
                UPDATE orders
                SET actual_delivery = CURRENT_TIMESTAMP
                WHERE id = :order_id AND (actual_delivery IS NULL)
                """)
                
                db.execute(update_delivery_date_query, {"order_id": order_id})
                logger.info(f"Дата доставки для заказа {order_id} зафиксирована")
            
            # Принудительно завершаем транзакцию
            db.commit()
            logger.info(f"Статус заказа {order_id} успешно изменен на {order_update.status}")
        
        except Exception as e:
            # В случае ошибки откатываем транзакцию и пишем лог
            db.rollback()
            logger.error(f"Ошибка при обновлении статуса заказа {order_id}: {str(e)}")
            raise Exception(f"Ошибка при обновлении статуса: {str(e)}")
        
        # Возвращаем обновленный заказ
        return get_order_detail(order_id, db, current_user)
    
    except HTTPException:
        raise
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Необработанная ошибка при обновлении статуса заказа: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")

# Обновление данных заказа
# Добавьте в ваш файл orders.py логирование входящих данных

@router.patch("/{order_id}", response_model=Order)
def update_order(
    order_id: int,
    data: dict,  # Используем dict для приема любых данных
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    try:
        logger.info(f"Запрос на обновление заказа {order_id} с данными: {data}")
        
        # Проверка наличия заказа
        check_query = text("SELECT id FROM orders WHERE id = :order_id")
        order_exists = db.execute(check_query, {"order_id": order_id}).fetchone()
        
        if not order_exists:
            logger.warning(f"Заказ с ID {order_id} не найден")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Строим запрос динамически на основе предоставленных полей
        update_fields = []
        params = {"order_id": order_id}
        
        # Перебираем все ключи в полученных данных
        for key, value in data.items():
            if value is not None:
                update_fields.append(f"{key} = :{key}")
                params[key] = value
        
        # Если нет полей для обновления, возвращаем заказ без изменений
        if not update_fields:
            logger.info(f"Нет данных для обновления заказа {order_id}")
            return get_order_detail(order_id, db, current_user)
        
        # Формируем и выполняем запрос на обновление
        update_query = text(f"""
        UPDATE orders
        SET {', '.join(update_fields)}
        WHERE id = :order_id
        """)
        
        logger.info(f"Выполнение запроса: {update_query.text} с параметрами: {params}")
        
        db.execute(update_query, params)
        db.commit()
        logger.info(f"Данные заказа {order_id} успешно обновлены")
        
        return get_order_detail(order_id, db, current_user)
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        stack_trace = traceback.format_exc()
        logger.error(f"Необработанная ошибка при обновлении данных заказа: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении данных заказа: {str(e)}")

@router.patch("/{order_id}/status", response_model=Order)
def update_order_status(
    order_id: int,
    data: dict,  # Принимаем данные как dict для большей гибкости
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    try:
        status = data.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Статус не указан")
            
        logger.info(f"Запрос на изменение статуса заказа {order_id} на {status}")
        
        # Проверка наличия заказа
        check_query = text("SELECT id, status FROM orders WHERE id = :order_id")
        check_result = db.execute(check_query, {"order_id": order_id}).fetchone()
        
        if not check_result:
            logger.warning(f"Заказ с ID {order_id} не найден при попытке изменения статуса")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Если статус уже такой же, ничего не делаем
        current_status = check_result.status.strip() if check_result.status else ""
        if current_status == status:
            logger.info(f"Статус заказа {order_id} уже установлен в {status}")
            return get_order_detail(order_id, db, current_user)
        
        # Обновление статуса
        try:
            # Обновление статуса заказа
            update_query = text("""
            UPDATE orders
            SET status = :status
            WHERE id = :order_id
            """)
            
            db.execute(update_query, {
                "status": status,
                "order_id": order_id
            })
            
            # Определяем соответствующий статус доставки
            delivery_status = None
            if status == "processing":
                delivery_status = "preparing"
            elif status == "shipped":
                delivery_status = "in_transit"
            elif status == "delivered":
                delivery_status = "delivered"
            
            # Обновляем статус доставки
            if delivery_status:
                update_delivery_status_query = text("""
                UPDATE orders
                SET delivery_status = :delivery_status
                WHERE id = :order_id
                """)
                
                db.execute(update_delivery_status_query, {
                    "delivery_status": delivery_status,
                    "order_id": order_id
                })
                
                logger.info(f"Статус доставки для заказа {order_id} обновлен: {delivery_status}")
            
            # Обновление трекинг-номера для заказов в статусе shipped или delivered
            if status in ["shipped", "delivered"]:
                # Проверяем, есть ли уже номер для этого заказа
                check_tracking_query = text("""
                SELECT tracking_number
                FROM orders
                WHERE id = :order_id
                """)
                
                tracking_row = db.execute(check_tracking_query, {"order_id": order_id}).fetchone()
                
                if not tracking_row or not tracking_row.tracking_number:
                    # Генерируем новый трекинг-номер
                    new_tracking = generate_tracking_number()
                    
                    # Обновляем трекинг-номер в таблице orders
                    update_tracking_query = text("""
                    UPDATE orders
                    SET tracking_number = :tracking_number
                    WHERE id = :order_id
                    """)
                    
                    db.execute(update_tracking_query, {
                        "tracking_number": new_tracking,
                        "order_id": order_id
                    })
                    
                    logger.info(f"Трекинг-номер для заказа {order_id} обновлен: {new_tracking}")
            
            # Если заказ доставлен, фиксируем дату доставки
            if status == "delivered":
                update_delivery_date_query = text("""
                UPDATE orders
                SET actual_delivery = CURRENT_TIMESTAMP
                WHERE id = :order_id AND (actual_delivery IS NULL)
                """)
                
                db.execute(update_delivery_date_query, {"order_id": order_id})
                logger.info(f"Дата доставки для заказа {order_id} зафиксирована")
            
            # Принудительно завершаем транзакцию
            db.commit()
            logger.info(f"Статус заказа {order_id} успешно изменен на {status}")
        
        except Exception as e:
            # В случае ошибки откатываем транзакцию и пишем лог
            db.rollback()
            logger.error(f"Ошибка при обновлении статуса заказа {order_id}: {str(e)}")
            raise Exception(f"Ошибка при обновлении статуса: {str(e)}")
        
        # Возвращаем обновленный заказ
        return get_order_detail(order_id, db, current_user)
    
    except HTTPException:
        raise
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Необработанная ошибка при обновлении статуса заказа: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2

# Получение заказов по статусу
@router.get("/status/{status}", response_model=List[Order])
def get_orders_by_status(status: str = Path(...), db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Запрос на получение заказов со статусом '{status}'")
        
        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status
        FROM orders 
        WHERE status = :status
        ORDER BY created_at DESC
        """)
        
        orders_result = db.execute(query, {"status": status}).fetchall()
        
        if not orders_result:
            logger.info(f"Заказов со статусом '{status}' не найдено")
            return []
        
        orders = []
        for row in orders_result:
            # Получаем имя клиента
            client_name = row.client_name or f"Клиент #{row.user_id}"
            
            # Получаем товары из JSON или списка
            order_items = parse_order_items(row.order_items)
            
            # Если товары не найдены, создаем заглушку
            if not order_items:
                order_items = [
                    {
                        "id": 1,
                        "product_id": 1,
                        "name": f"Товары в заказе #{row.id}",
                        "product_name": f"Товары в заказе #{row.id}",
                        "quantity": 1,
                        "price": float(row.total_price or 0)
                    }
                ]
            
            # Создаем словарь с данными заказа
            order_dict = {
                "id": row.id,
                "user_id": row.user_id or 0,
                "customer_name": client_name,
                "client_name": client_name,
                "status": row.status.strip() if row.status else "pending",
                "total_amount": float(row.total_price or 0),
                "total_price": float(row.total_price or 0),
                "created_at": row.created_at or datetime.now(),
                "tracking_number": row.tracking_number,
                "delivery_address": row.delivery_address or "",
                "estimated_delivery": row.estimated_delivery,
                "payment_method": row.payment_method,
                "delivery_notes": row.delivery_notes,
                "courier_name": row.courier_name,
                "items": order_items,
                "order_items": order_items,
                "delivery_status": row.delivery_status,
                "actual_delivery": row.actual_delivery
            }
            orders.append(Order(**order_dict))
        
        logger.info(f"Найдено {len(orders)} заказов со статусом '{status}'")
        return orders
    
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказов по статусу: {str(e)}\n{stack_trace}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов по статусу: {str(e)}")

<<<<<<< HEAD
# Получение заказов по статусу
@router.get("/status/{status}", response_model=List[OrderWithPayment])
def get_orders_by_status(
        status: str = Path(...),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Получить все заказы с указанным статусом"""
    try:
        return OrderService.get_orders_with_status(status, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказов со статусом {status}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов по статусу: {str(e)}")


# Получить статистику по заказам
@router.get("/stats", response_model=Dict[str, Dict[str, Any]])
def get_orders_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получение статистики по заказам в разрезе статусов"""
    try:
        return OrderService.get_orders_statistics(db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении статистики заказов: {str(e)}")
=======
# Получить статистику по заказам
@router.get("/stats", response_model=dict)
def get_orders_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    """Получение статистики по заказам"""
    try:
        logger.info("Запрос на получение статистики по заказам (/orders/stats)")
        
        query = text("""
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total_price) as total_amount
        FROM orders
        GROUP BY status
        """)
        
        stats_result = db.execute(query).fetchall()
        
        if not stats_result:
            logger.warning("Статистика по заказам не найдена")
            return {}
        
        stats = {}
        for row in stats_result:
            status = row.status.strip() if row.status else "pending"
            stats[status] = {
                "count": row.count,
                "total_amount": float(row.total_amount or 0)
            }
        
        logger.info(f"Статистика по заказам успешно получена: {json.dumps(stats)}")
        return stats
    
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении статистики: {str(e)}\n{stack_trace}")
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")