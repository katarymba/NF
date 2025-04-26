from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Order, OrderItem, Product, User
from schemas import OrderResponse, ExtendedOrderCreate
import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

# Получить все заказы пользователя
@router.get("/", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    # Здесь должна быть проверка авторизации
    
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return orders

# Получить детали заказа
@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    # Здесь должна быть проверка авторизации
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    return order

# Создать новый заказ
@router.post("/", response_model=OrderResponse)
def create_order(order_data: ExtendedOrderCreate, db: Session = Depends(get_db)):
    # Здесь должна быть проверка авторизации
    
    # Создаем заказ
    new_order = Order(
        user_id=order_data.user_id,
        status="pending",
        created_at=datetime.datetime.now(),
        total_amount=order_data.total_amount
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Добавляем товары в заказ
    for item in order_data.items:
        # Проверяем наличие товара
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с ID {item.product_id} не найден")
        
        # Создаем позицию заказа
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    
    return new_order