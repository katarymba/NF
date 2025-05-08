from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from typing import List, Optional
from datetime import datetime
import logging
from app.database import get_db
from app.schemas import (
    PaymentResponse,
    PaymentCreate,
    PaymentUpdate,
    PaymentListResponse
)
from app import models

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[PaymentListResponse])
async def get_payments(
    request: Request,
    skip: int = 0, 
    limit: int = 100,
    order_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список всех платежей с возможностью фильтрации
    """
    try:
        query = db.query(models.Payment)
        
        if order_id:
            query = query.filter(models.Payment.order_id == order_id)
            
        if payment_status:
            query = query.filter(models.Payment.payment_status == payment_status)
        
        # Получаем общее количество записей для заголовка пагинации
        total_count = query.count()
        
        # Применяем пагинацию и сортировку
        payments = query.order_by(models.Payment.created_at.desc()).offset(skip).limit(limit).all()
        
        # Устанавливаем заголовок с общим количеством записей
        headers = {"X-Total-Count": str(total_count)}
        
        # Добавляем информацию о текущем пользователе в логи
        username = request.headers.get("X-User", "unknown")
        logger.info(f"User {username} requested payments list. Returned {len(payments)} records.")
        
        return payments
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка базы данных: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Произошла непредвиденная ошибка на сервере."
        )


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Получить детальную информацию о платеже по ID
    """
    try:
        payment = db.query(models.Payment).options(
            joinedload(models.Payment.order)
        ).filter(models.Payment.id == payment_id).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Платеж не найден")
        
        return payment
    except OperationalError:
        raise HTTPException(
            status_code=500,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    """
    Создать новый платеж
    """
    try:
        # Проверяем, существует ли заказ
        order = db.query(models.Order).filter(models.Order.id == payment_data.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Создаем платеж
        new_payment = models.Payment(
            order_id=payment_data.order_id,
            payment_method=payment_data.payment_method,
            payment_status=payment_data.payment_status,
            transaction_id=payment_data.transaction_id,
            created_at=datetime.utcnow()
        )
        
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
        
        # Загружаем связанные данные для ответа
        payment = db.query(models.Payment).options(
            joinedload(models.Payment.order)
        ).filter(models.Payment.id == new_payment.id).first()
        
        return payment
    except OperationalError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int, 
    payment_data: PaymentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Обновить статус платежа или ID транзакции
    """
    try:
        payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Платеж не найден")
        
        # Обновляем поля платежа
        if payment_data.payment_status is not None:
            payment.payment_status = payment_data.payment_status
            
        if payment_data.transaction_id is not None:
            payment.transaction_id = payment_data.transaction_id
        
        db.commit()
        db.refresh(payment)
        
        # Загружаем связанные данные для ответа
        updated_payment = db.query(models.Payment).options(
            joinedload(models.Payment.order)
        ).filter(models.Payment.id == payment_id).first()
        
        return updated_payment
    except OperationalError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Удалить платеж
    """
    try:
        payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Платеж не найден")
        
        db.delete(payment)
        db.commit()
        
        return {"detail": "Платеж успешно удален"}
    except OperationalError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))