from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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

router = APIRouter(prefix="", tags=["Payments"])


@router.get("", response_model=List[PaymentListResponse])
def get_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    return payment


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    new_payment = models.Payment(**payment_data.dict(), created_at=datetime.utcnow())
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payment_data: PaymentUpdate, db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")

    update_data = payment_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)

    db.commit()
    db.refresh(payment)
    return payment