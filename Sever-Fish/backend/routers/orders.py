from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
from models import Order, Cart, User, OrderItem, Product
from schemas import OrderResponse, ExtendedOrderCreate
from datetime import datetime
from pydantic import BaseModel, validator

# Импортируем функцию для получения текущего пользователя
from routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: Optional[ExtendedOrderCreate] = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Создание заказа с подробной информацией о доставке и клиенте.
    """
    try:
        # Если данные заказа не предоставлены, используем корзину
        if order_data is None:
            # Находим товары в корзине текущего пользователя
            cart_items = db.query(Cart).filter(Cart.user_id == current_user.id).all()
            
            if not cart_items:
                raise HTTPException(status_code=400, detail="Корзина пуста")

            total_price = sum(item.product.price * item.quantity for item in cart_items)

            # Создаем новый заказ
            order = Order(
                user_id=current_user.id,
                total_price=total_price,
                status="pending",
                customer_name=current_user.full_name or current_user.username,
                email=current_user.email,
                phone=current_user.phone
            )
            db.add(order)
            db.flush()  # Получаем ID заказа без коммита

            # Сохраняем элементы заказа
            for cart_item in cart_items:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=cart_item.product_id,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )
                db.add(order_item)
            
            # Очищаем корзину после заказа
            db.query(Cart).filter(Cart.user_id == current_user.id).delete()
            
            # Финальный коммит
            db.commit()
            db.refresh(order)
            
            return order
        
        # Если предоставлены расширенные данные заказа
        order = Order(
            user_id=current_user.id,
            total_price=order_data.total_price,
            status="pending",
            created_at=datetime.now(),
            customer_name=f"{order_data.customer.first_name} {order_data.customer.last_name}",
            email=order_data.customer.email,
            phone=order_data.customer.phone,
            delivery_method=order_data.delivery.method,
            payment_method=order_data.payment_method,
            comment=order_data.comment
        )
        
        # Добавляем информацию о доставке, если выбрана курьерская доставка
        if order_data.delivery.method == "courier" and order_data.delivery.address:
            order.delivery_address = order_data.delivery.address.street_address
            order.delivery_city = order_data.delivery.address.city
            order.delivery_postal_code = order_data.delivery.address.postal_code
        
        db.add(order)
        db.flush()  # Получаем ID заказа без коммита
        
        # Сохраняем элементы заказа
        for item in order_data.items:
            # Проверяем существование продукта
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Товар с id {item.product_id} не найден")
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price
            )
            db.add(order_item)
        
        # Очищаем корзину после заказа
        db.query(Cart).filter(Cart.user_id == current_user.id).delete()
        
        # Финальный коммит
        db.commit()
        db.refresh(order)
        
        return order
        
    except HTTPException:
        # Перевыбрасываем HTTPException без изменений
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        # Логируем ошибку для серверных логов
        print(f"Ошибка при создании заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Не удалось создать заказ. Пожалуйста, попробуйте позже."
        )

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Получение всех заказов текущего пользователя с подгрузкой элементов заказа.
    """
    try:
        orders = (
            db.query(Order)
            .filter(Order.user_id == current_user.id)
            .options(joinedload(Order.order_items))
            .order_by(Order.created_at.desc())
            .all()
        )
        return orders
    except Exception as e:
        # Логируем ошибку
        print(f"Ошибка при получении заказов: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Не удалось получить список заказов"
        )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Получение информации о конкретном заказе текущего пользователя.
    """
    try:
        order = (
            db.query(Order)
            .filter(Order.id == order_id, Order.user_id == current_user.id)
            .options(joinedload(Order.order_items))
            .first()
        )
        
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        return order
    except HTTPException:
        # Перевыбрасываем HTTPException без изменений
        raise
    except Exception as e:
        # Логируем ошибку
        print(f"Ошибка при получении заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Не удалось получить детали заказа"
        )