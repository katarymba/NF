# ais/ais-backend/app/routers/orders.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import List, Optional
from app import models, schemas
from app.database import get_db

router = APIRouter()


@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список всех заказов с возможностью фильтрации по статусу
    """
    query = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    )
    
    if status:
        query = query.filter(models.Order.status == status)
        
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """
    Получить детальную информацию о заказе по ID
    """
    order = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    return order


@router.post("", response_model=schemas.OrderResponse)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Создать новый заказ
    """
    # Проверяем, существует ли пользователь
    user = db.query(models.User).filter(models.User.id == order_data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")

    # Вычисляем итоговую сумму заказа на основе переданных позиций
    total_price = sum(item.price * item.quantity for item in order_data.items)

    # Создаем заказ
    db_order = models.Order(
        user_id=order_data.user_id,
        total_price=total_price,
        status="new",  # По умолчанию статус "new"
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
    db.refresh(db_order)

    # Загружаем связанные данные для ответа
    order = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == db_order.id).first()
    
    return order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(
    order_id: int, 
    order_update: schemas.OrderUpdate, 
    db: Session = Depends(get_db)
):
    """
    Обновить статус заказа
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Обновляем статус заказа
    if order_update.status is not None:
        order.status = order_update.status
    
    db.commit()
    db.refresh(order)
    
    # Загружаем связанные данные для ответа
    updated_order = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == order_id).first()
    
    return updated_order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Удалить заказ
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    db.delete(order)
    db.commit()
    
    return {"detail": "Заказ успешно удален"}