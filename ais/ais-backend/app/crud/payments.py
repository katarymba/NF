from sqlalchemy.orm import Session
from sqlalchemy import text
import traceback
from datetime import datetime

from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate
from app.services.logging_service import logger


def get_payments(db: Session):
    try:
        logger.info("Запрос на получение всех платежей")

        query = text("""
        SELECT p.id, p.order_id, p.payment_method, p.payment_status, 
               p.transaction_id, p.created_at,
               o.client_name, o.user_id, o.status as order_status
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        ORDER BY p.created_at DESC
        """)

        payments_result = db.execute(query).fetchall()

        if not payments_result:
            logger.warning("Платежи не найдены")
            return []

        payments = []
        for row in payments_result:
            # Создаем словарь с данными платежа
            payment_dict = {
                "id": row.id,
                "order_id": row.order_id,
                "payment_method": row.payment_method,
                "payment_status": row.payment_status.strip() if row.payment_status else "pending",
                "transaction_id": row.transaction_id,
                "created_at": row.created_at or datetime.now(),
                # Добавляем информацию о заказе для удобства
                "client_name": row.client_name,
                "user_id": row.user_id,
                "order_status": row.order_status
            }
            payments.append(payment_dict)

        logger.info(f"Найдено {len(payments)} платежей")
        return payments

    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении платежей: {str(e)}\n{stack_trace}")
        return None


def get_payment(payment_id: int, db: Session):
    try:
        logger.info(f"Запрос на получение платежа с ID {payment_id}")

        query = text("""
        SELECT p.id, p.order_id, p.payment_method, p.payment_status, 
               p.transaction_id, p.created_at,
               o.client_name, o.user_id, o.status as order_status
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        WHERE p.id = :payment_id
        """)

        payment_row = db.execute(query, {"payment_id": payment_id}).fetchone()

        if not payment_row:
            logger.warning(f"Платеж с ID {payment_id} не найден")
            return None

        # Создаем словарь с данными платежа
        payment_dict = {
            "id": payment_row.id,
            "order_id": payment_row.order_id,
            "payment_method": payment_row.payment_method,
            "payment_status": payment_row.payment_status.strip() if payment_row.payment_status else "pending",
            "transaction_id": payment_row.transaction_id,
            "created_at": payment_row.created_at or datetime.now(),
            # Добавляем информацию о заказе для удобства
            "client_name": payment_row.client_name,
            "user_id": payment_row.user_id,
            "order_status": payment_row.order_status
        }

        logger.info(f"Платеж с ID {payment_id} успешно получен")
        return payment_dict

    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении платежа: {str(e)}\n{stack_trace}")
        return None


def get_order_payments(order_id: int, db: Session):
    try:
        logger.info(f"Запрос на получение платежей для заказа с ID {order_id}")

        query = text("""
        SELECT p.id, p.order_id, p.payment_method, p.payment_status, 
               p.transaction_id, p.created_at
        FROM payments p
        WHERE p.order_id = :order_id
        ORDER BY p.created_at DESC
        """)

        payments_result = db.execute(query, {"order_id": order_id}).fetchall()

        if not payments_result:
            logger.info(f"Платежи для заказа с ID {order_id} не найдены")
            return []

        payments = []
        for row in payments_result:
            payment_dict = {
                "id": row.id,
                "order_id": row.order_id,
                "payment_method": row.payment_method,
                "payment_status": row.payment_status.strip() if row.payment_status else "pending",
                "transaction_id": row.transaction_id,
                "created_at": row.created_at or datetime.now()
            }
            payments.append(payment_dict)

        logger.info(f"Найдено {len(payments)} платежей для заказа с ID {order_id}")
        return payments

    except Exception as e:
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при получении платежей для заказа: {str(e)}\n{stack_trace}")
        return None


def create_payment(payment_data: PaymentCreate, db: Session):
    try:
        logger.info(f"Запрос на создание нового платежа для заказа {payment_data.order_id}")

        # Проверяем существование заказа
        order_query = text("SELECT id FROM orders WHERE id = :order_id")
        order_exists = db.execute(order_query, {"order_id": payment_data.order_id}).fetchone()

        if not order_exists:
            logger.warning(f"Заказ с ID {payment_data.order_id} не найден")
            return None

        # Создаем платеж
        insert_query = text("""
        INSERT INTO payments (
            order_id, payment_method, payment_status, transaction_id, created_at
        ) VALUES (
            :order_id, :payment_method, :payment_status, :transaction_id, CURRENT_TIMESTAMP
        ) RETURNING id, created_at
        """)

        result = db.execute(insert_query, {
            "order_id": payment_data.order_id,
            "payment_method": payment_data.payment_method,
            "payment_status": payment_data.payment_status,
            "transaction_id": payment_data.transaction_id
        }).fetchone()

        if not result:
            return None

        db.commit()

        # Возвращаем созданный платеж
        return {
            "id": result.id,
            "order_id": payment_data.order_id,
            "payment_method": payment_data.payment_method,
            "payment_status": payment_data.payment_status,
            "transaction_id": payment_data.transaction_id,
            "created_at": result.created_at
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании платежа: {str(e)}")
        return None


def update_payment(payment_id: int, payment_data: PaymentUpdate, db: Session):
    try:
        logger.info(f"Запрос на обновление платежа с ID {payment_id}")

        # Проверка наличия платежа
        check_query = text("SELECT id FROM payments WHERE id = :payment_id")
        payment_exists = db.execute(check_query, {"payment_id": payment_id}).fetchone()

        if not payment_exists:
            logger.warning(f"Платеж с ID {payment_id} не найден")
            return None

        # Создаем динамический запрос на обновление
        update_fields = []
        params = {"payment_id": payment_id}

        # Обрабатываем все поля, которые могут быть обновлены
        if payment_data.payment_status is not None:
            update_fields.append("payment_status = :payment_status")
            params["payment_status"] = payment_data.payment_status

        if payment_data.transaction_id is not None:
            update_fields.append("transaction_id = :transaction_id")
            params["transaction_id"] = payment_data.transaction_id

        # Если нет полей для обновления, просто возвращаем текущий платеж
        if len(update_fields) == 0:
            logger.info(f"Нет данных для обновления платежа {payment_id}")
            return get_payment(payment_id, db)

        # Формируем и выполняем запрос на обновление
        update_query = text(f"""
        UPDATE payments
        SET {', '.join(update_fields)}
        WHERE id = :payment_id
        """)

        db.execute(update_query, params)
        db.commit()

        logger.info(f"Данные платежа {payment_id} успешно обновлены")

        # Возвращаем обновленный платеж
        return get_payment(payment_id, db)

    except Exception as e:
        db.rollback()
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при обновлении платежа: {str(e)}\n{stack_trace}")
        return None


def delete_payment(payment_id: int, db: Session):
    try:
        logger.info(f"Запрос на удаление платежа с ID {payment_id}")

        # Проверка наличия платежа
        check_query = text("SELECT id FROM payments WHERE id = :payment_id")
        payment_exists = db.execute(check_query, {"payment_id": payment_id}).fetchone()

        if not payment_exists:
            logger.warning(f"Платеж с ID {payment_id} не найден")
            return False

        # Удаляем платеж
        delete_query = text("""
        DELETE FROM payments
        WHERE id = :payment_id
        """)

        db.execute(delete_query, {"payment_id": payment_id})
        db.commit()

        logger.info(f"Платеж с ID {payment_id} успешно удален")
        return True

    except Exception as e:
        db.rollback()
        stack_trace = traceback.format_exc()
        logger.error(f"Ошибка при удалении платежа: {str(e)}\n{stack_trace}")
        return False