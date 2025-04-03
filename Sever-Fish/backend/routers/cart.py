from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import CartItemCreate, CartItemResponse
from typing import List

router = APIRouter(prefix="/cart", tags=["Cart"])

MAX_QUANTITY = 99

@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate, 
    request: Request,
    db: Session = Depends(get_db)
):
    # Проверка существования продукта
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    # Получаем корзину из сессии
    cart = request.session.get('cart', [])
    
    # Проверяем, есть ли уже такой товар в корзине
    for item in cart:
        if item['product_id'] == cart_item.product_id:
            # Обновляем количество
            new_quantity = item['quantity'] + cart_item.quantity
            if new_quantity > MAX_QUANTITY:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Максимальное количество товара - {MAX_QUANTITY}"
                )
            item['quantity'] = new_quantity
            break
    else:
        # Если товара нет, добавляем новый
        cart.append({
            'product_id': cart_item.product_id,
            'quantity': cart_item.quantity
        })
    
    # Сохраняем корзину в сессии
    request.session['cart'] = cart
    
    # Возвращаем добавленный товар с информацией о продукте
    return {
        'id': len(cart),  # Временный суррогатный ID
        'product_id': cart_item.product_id,
        'quantity': cart_item.quantity,
        'user_id': None,
        'product': product
    }

@router.get("/", response_model=List[CartItemResponse])
async def get_cart(
    request: Request,
    db: Session = Depends(get_db)
):
    cart = request.session.get('cart', [])
    
    # Загружаем полную информацию о продуктах
    cart_with_products = []
    for item in cart:
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        cart_with_products.append({
            'id': cart.index(item),  # Временный суррогатный ID
            'product_id': item['product_id'],
            'quantity': item['quantity'],
            'user_id': None,
            'product': product
        })
    
    return cart_with_products

@router.put("/{cart_id}", response_model=CartItemResponse)
async def update_cart_quantity(
    cart_id: int, 
    quantity: int, 
    request: Request,
    db: Session = Depends(get_db)
):
    # Проверка количества
    if quantity < 1 or quantity > MAX_QUANTITY:
        raise HTTPException(
            status_code=400, 
            detail=f"Количество должно быть от 1 до {MAX_QUANTITY}"
        )
    
    cart = request.session.get('cart', [])
    
    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")
    
    # Обновляем количество
    cart[cart_id]['quantity'] = quantity
    request.session['cart'] = cart
    
    # Загружаем информацию о продукте
    product = db.query(Product).filter(Product.id == cart[cart_id]['product_id']).first()
    
    return {
        'id': cart_id,
        'product_id': cart[cart_id]['product_id'],
        'quantity': quantity,
        'user_id': None,
        'product': product
    }

@router.delete("/{cart_id}")
async def remove_from_cart(
    cart_id: int, 
    request: Request
):
    cart = request.session.get('cart', [])
    
    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")
    
    # Удаляем товар
    del cart[cart_id]
    request.session['cart'] = cart
    
    return {"message": "Товар удален из корзины"}

@router.delete("/clear")
async def clear_cart(request: Request):
    request.session['cart'] = []
    return {"message": "Корзина очищена"}