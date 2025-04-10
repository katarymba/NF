# ais/ais-backend/app/routers/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas import (
    PaymentResponse,
    PaymentCreate,
    PaymentUpdate,
    PaymentListResponse
)
from app import models

router = APIRouter()


@router.get("", response_model=List[PaymentListResponse])
def get_payments(
    skip: int = 0, 
    limit: int = 100,
    order_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список всех платежей с возможностью фильтрации
    """
    query = db.query(models.Payment)
    
    if order_id:
        query = query.filter(models.Payment.order_id == order_id)
        
    if payment_status:
        query = query.filter(models.Payment.payment_status == payment_status)
        
    payments = query.order_by(models.Payment.created_at.desc()).offset(skip).limit(limit).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Получить детальную информацию о платеже по ID
    """
    payment = db.query(models.Payment).options(
        joinedload(models.Payment.order)
    ).filter(models.Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    return payment


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    """
    Создать новый платеж
    """
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


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int, 
    payment_data: PaymentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Обновить статус платежа или ID транзакции
    """
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


@router.delete("/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Удалить платеж
    """
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    db.delete(payment)
    db.commit()
    
    return {"detail": "Платеж успешно удален"}