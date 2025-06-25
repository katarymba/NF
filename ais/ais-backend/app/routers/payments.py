from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.schemas.payment import PaymentCreate, PaymentUpdate
from app.crud import payment as payment_crud

router = APIRouter()

# Получение всех платежей
@router.get("/payments", response_model=List[Dict[str, Any]])
def get_all_payments(db: Session = Depends(get_db)):
    """Получение списка всех платежей с информацией о связанных заказах."""
    payments = payment_crud.get_payments(db)
    if payments is None:  # Если произошла ошибка
        raise HTTPException(status_code=500, detail="Ошибка при получении платежей")
    return payments

# Получение платежа по ID
@router.get("/payments/{payment_id}", response_model=Dict[str, Any])
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Получение информации о конкретном платеже по его ID."""
    payment = payment_crud.get_payment(payment_id, db)
    if payment is None:
        raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден")
    return payment

# Получение платежей по заказу
@router.get("/orders/{order_id}/payments", response_model=List[Dict[str, Any]])
def get_order_payments(order_id: int, db: Session = Depends(get_db)):
    """Получение списка платежей, связанных с конкретным заказом."""
    payments = payment_crud.get_order_payments(order_id, db)
    if payments is None:  # Если произошла ошибка
        raise HTTPException(status_code=500, detail=f"Ошибка при получении платежей для заказа {order_id}")
    return payments

# Создание нового платежа
@router.post("/payments", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Создание нового платежа для заказа."""
    result = payment_crud.create_payment(payment, db)
    if result is None:
        raise HTTPException(status_code=400, detail="Не удалось создать платеж. Проверьте правильность данных или существование указанного заказа.")
    return result

# Обновление платежа
@router.patch("/payments/{payment_id}", response_model=Dict[str, Any])
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(get_db)):
    """Обновление данных платежа."""
    result = payment_crud.update_payment(payment_id, payment, db)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден или не может быть обновлен")
    return result

# Обновление статуса платежа (специальный маршрут)
@router.patch("/payments/{payment_id}/status", response_model=Dict[str, Any])
def update_payment_status(payment_id: int, status_data: dict, db: Session = Depends(get_db)):
    """Обновление статуса платежа."""
    if "payment_status" not in status_data:
        raise HTTPException(status_code=400, detail="Поле payment_status обязательно")
        
    update_data = PaymentUpdate(payment_status=status_data["payment_status"])
    result = payment_crud.update_payment(payment_id, update_data, db)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден")
    return result

# Удаление платежа
@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Удаление платежа."""
    result = payment_crud.delete_payment(payment_id, db)
    if not result:
        raise HTTPException(status_code=404, detail=f"Платеж с ID {payment_id} не найден")
    return Response(status_code=status.HTTP_204_NO_CONTENT)