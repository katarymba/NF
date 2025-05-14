from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.crud.payments import (
    get_payments,
    get_payment,
    get_order_payments,
    create_payment,
    update_payment,
    delete_payment
)
from app.services.logging_service import logger


class PaymentService:
    @staticmethod
    def get_all_payments(db: Session):
        payments = get_payments(db)
        if payments is None:
            raise HTTPException(status_code=500, detail="Ошибка при получении платежей")
        return payments

    @staticmethod
    def get_payment_by_id(payment_id: int, db: Session):
        payment = get_payment(payment_id, db)
        if payment is None:
            raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден")
        return payment

    @staticmethod
    def get_payments_by_order(order_id: int, db: Session):
        payments = get_order_payments(order_id, db)
        if payments is None:
            raise HTTPException(status_code=500, detail=f"Ошибка при получении платежей для заказа {order_id}")
        return payments

    @staticmethod
    def create_new_payment(payment_data: PaymentCreate, db: Session):
        payment = create_payment(payment_data, db)
        if payment is None:
            raise HTTPException(status_code=500, detail="Не удалось создать платеж")
        return payment

    @staticmethod
    def update_payment_details(payment_id: int, payment_data: PaymentUpdate, db: Session):
        payment = update_payment(payment_id, payment_data, db)
        if payment is None:
            raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден или не удалось обновить")
        return payment

    @staticmethod
    def remove_payment(payment_id: int, db: Session):
        result = delete_payment(payment_id, db)
        if not result:
            raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден или не удалось удалить")
        return {"success": True, "message": f"Платеж с ID {payment_id} успешно удален"}