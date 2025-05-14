from sqlalchemy.orm import Session
from sqlalchemy import text
import json
import traceback
from datetime import datetime

from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
from app.services.logging_service import logger


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


def generate_tracking_number() -> str:
    """Генерирует случайный трекинг-номер для заказов в статусе SHIPPED или DELIVERED"""
    import random
    prefix = "TRK"
    digits = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{digits}"


def get_orders(db: Session):
    try:
        logger.info("Запрос на получение всех заказов")

        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status,
               contact_phone
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
                "actual_delivery": row.actual_delivery,
                "contact_phone": row.contact_phone
            }
            orders.append(order_dict)

        logger.info(f"Найдено {len(orders)} заказов")
        return orders

    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказов: {str(e)}\n{stack_trace}")
        return None


def get_user_orders(user_id: int, db: Session):
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

            order = {
                "id": row.id,
                "user_id": row.user_id,
                "status": row.status.strip() if row.status else "pending",
                "created_at": row.created_at or datetime.now(),
                "total_amount": float(row.total_price or 0),
                "items": order_items
            }
            orders.append(order)

        return orders
    except Exception as e:
        logger.error(f"Ошибка при получении заказов пользователя: {str(e)}")
        return None


def get_order_detail(order_id: int, db: Session):
    try:
        logger.info(f"Запрос на получение заказа с ID {order_id}")

        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status,
               contact_phone
        FROM orders 
        WHERE id = :order_id
        """)

        order_row = db.execute(query, {"order_id": order_id}).fetchone()

        if not order_row:
            logger.warning(f"Заказ с ID {order_id} не найден")
            return None

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
            "actual_delivery": order_row.actual_delivery,
            "contact_phone": order_row.contact_phone
        }

        logger.info(f"Заказ с ID {order_id} успешно получен")
        return order_dict
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказа: {str(e)}\n{stack_trace}")
        return None


def create_order(order_data: OrderCreate, db: Session):
    try:
        logger.info(f"Запрос на создание нового заказа для пользователя {order_data.user_id}")

        # Проверяем существование пользователя
        user_query = text("SELECT id FROM users WHERE id = :user_id")
        user_exists = db.execute(user_query, {"user_id": order_data.user_id}).fetchone()

        if not user_exists:
            logger.warning(f"Пользователь с ID {order_data.user_id} не найден")
            return None

        # Создаем заказ
        order_items_json = json.dumps([{
            "product_id": item.product_id,
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price
        } for item in order_data.items])

        insert_query = text("""
        INSERT INTO orders (
            user_id, total_price, created_at, status, order_items,
            client_name, delivery_address, contact_phone, payment_method
        )
        VALUES (
            :user_id, :total_price, CURRENT_TIMESTAMP, 'pending', :order_items,
            :client_name, :delivery_address, :contact_phone, :payment_method
        )
        RETURNING id, created_at
        """)

        result = db.execute(insert_query, {
            "user_id": order_data.user_id,
            "total_price": order_data.total_price,
            "order_items": order_items_json,
            "client_name": order_data.client_name,
            "delivery_address": order_data.delivery_address,
            "contact_phone": order_data.contact_phone,
            "payment_method": order_data.payment_method
        }).fetchone()

        if not result:
            return None

        db.commit()

        # Возвращаем созданный заказ
        return {
            "id": result.id,
            "user_id": order_data.user_id,
            "status": "pending",
            "created_at": result.created_at,
            "total_amount": order_data.total_price,
            "items": order_data.items
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании заказа: {str(e)}")
        return None


def update_order_status(order_id: int, status: str, db: Session):
    try:
        logger.info(f"Запрос на изменение статуса заказа {order_id} на {status}")

        # Проверка наличия заказа
        check_query = text("SELECT id, status FROM orders WHERE id = :order_id")
        check_result = db.execute(check_query, {"order_id": order_id}).fetchone()

        if not check_result:
            logger.warning(f"Заказ с ID {order_id} не найден при попытке изменения статуса")
            return None

        # Если статус уже такой же, ничего не делаем
        current_status = check_result.status.strip() if check_result.status else ""
        if current_status == status:
            logger.info(f"Статус заказа {order_id} уже установлен в {status}")
            return get_order_detail(order_id, db)

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
        return get_order_detail(order_id, db)
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Необработанная ошибка при обновлении статуса заказа: {str(e)}\n{stack_trace}")
        return None


def update_order(order_id: int, data: dict, db: Session):
    try:
        logger.info(f"Запрос на обновление заказа {order_id} с данными: {data}")

        # Проверка наличия заказа
        check_query = text("SELECT id FROM orders WHERE id = :order_id")
        order_exists = db.execute(check_query, {"order_id": order_id}).fetchone()

        if not order_exists:
            logger.warning(f"Заказ с ID {order_id} не найден")
            return None

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
            return get_order_detail(order_id, db)

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

        return get_order_detail(order_id, db)
    except Exception as e:
        db.rollback()
        stack_trace = traceback.format_exc()
        logger.error(f"Необработанная ошибка при обновлении данных заказа: {str(e)}\n{stack_trace}")
        return None


def get_orders_by_status(status: str, db: Session):
    try:
        logger.info(f"Запрос на получение заказов со статусом '{status}'")

        query = text("""
        SELECT id, user_id, total_price, created_at, status, 
               client_name, delivery_address, tracking_number, 
               delivery_notes, payment_method, order_items,
               courier_name, estimated_delivery, actual_delivery, delivery_status,
               contact_phone
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
                "actual_delivery": row.actual_delivery,
                "contact_phone": row.contact_phone
            }
            orders.append(order_dict)

        logger.info(f"Найдено {len(orders)} заказов со статусом '{status}'")
        return orders
    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении заказов по статусу: {str(e)}\n{stack_trace}")
        return None


def get_orders_stats(db: Session):
    try:
        logger.info("Запрос на получение статистики по заказам")

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
        return None