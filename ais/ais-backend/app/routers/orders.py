# app/routers/orders.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="", tags=["Orders"])


@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.user))  # загружаем связанные данные пользователя
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.user))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.post("/", response_model=schemas.OrderResponse)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли пользователь
    user = db.query(models.User).filter(models.User.id == order_data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")

    # Вычисляем итоговую сумму заказа на основе переданных позиций
    total_price = sum(item.price * item.quantity for item in order_data.items)

    # Создаем заказ с базовыми данными (статус приводим к единообразному виду)
    db_order = models.Order(
        user_id=order_data.user_id,
        total_price=total_price,
        status="new",  # используем единый формат статуса
        created_at=datetime.utcnow()
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Создаем элементы заказа
    for item in order_data.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
    db.commit()

    # Выполняем повторный запрос для загрузки заказа с данными пользователя
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.user))
        .filter(models.Order.id == db_order.id)
        .first()
    )
    return order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if order_update.status is not None:
        # Приводим значение enum к строке, если требуется
        order.status = order_update.status.value if hasattr(order_update.status, "value") else order_update.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    db.delete(order)
    db.commit()
    return {"detail": "Заказ удалён"}
