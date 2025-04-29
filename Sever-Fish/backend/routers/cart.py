from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import CartItemCreate, CartItemResponse
from typing import List, Optional
from auth import verify_token

router = APIRouter(prefix="/cart", tags=["Cart"])

MAX_QUANTITY = 99

@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate, 
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Проверка существования продукта
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Инициализируем user_id как None
    user_id = None
    
    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                user_data = verify_token(token)
                if user_data:
                    user_id = user_data.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            print(f"Ошибка проверки токена: {e}")
            pass

    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])
    
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
    request.session[cart_key] = cart
    
    # Возвращаем добавленный товар с информацией о продукте
    return {
        'id': len(cart) - 1,  # Индекс последнего элемента
        'product_id': cart_item.product_id,
        'quantity': cart_item.quantity,
        'user_id': user_id,
        'product': product
    }

@router.get("/", response_model=List[CartItemResponse])
async def get_cart(
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Инициализируем user_id как None
    user_id = None
    
    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                user_data = verify_token(token)
                if user_data:
                    user_id = user_data.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            print(f"Ошибка проверки токена: {e}")
            pass
    
    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])
    
    # Загружаем полную информацию о продуктах
    cart_with_products = []
    for index, item in enumerate(cart):
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        if product:  # Проверяем, что продукт существует
            cart_with_products.append({
                'id': index,
                'product_id': item['product_id'],
                'quantity': item['quantity'],
                'user_id': user_id,
                'product': product
            })
    
    return cart_with_products

@router.put("/{cart_id}", response_model=CartItemResponse)
async def update_cart_quantity(
    cart_id: int, 
    quantity: int, 
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Проверка количества
    if quantity < 1 or quantity > MAX_QUANTITY:
        raise HTTPException(
            status_code=400, 
            detail=f"Количество должно быть от 1 до {MAX_QUANTITY}"
        )
    
    # Инициализируем user_id как None
    user_id = None
    
    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                user_data = verify_token(token)
                if user_data:
                    user_id = user_data.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            print(f"Ошибка проверки токена: {e}")
            pass
    
    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])
    
    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")
    
    # Обновляем количество
    cart[cart_id]['quantity'] = quantity
    request.session[cart_key] = cart
    
    # Загружаем информацию о продукте
    product = db.query(Product).filter(Product.id == cart[cart_id]['product_id']).first()
    
    return {
        'id': cart_id,
        'product_id': cart[cart_id]['product_id'],
        'quantity': quantity,
        'user_id': user_id,
        'product': product
    }

@router.delete("/{cart_id}")
async def remove_from_cart(
    cart_id: int, 
    request: Request,
    authorization: Optional[str] = Header(None)
):
    # Инициализируем user_id как None
    user_id = None
    
    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                user_data = verify_token(token)
                if user_data:
                    user_id = user_data.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            print(f"Ошибка проверки токена: {e}")
            pass
    
    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])
    
    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")
    
    # Удаляем товар
    del cart[cart_id]
    request.session[cart_key] = cart
    
    return {"message": "Товар удален из корзины"}

@router.delete("/clear")
async def clear_cart(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    # Инициализируем user_id как None
    user_id = None
    
    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                user_data = verify_token(token)
                if user_data:
                    user_id = user_data.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            print(f"Ошибка проверки токена: {e}")
            pass
    
    # Получаем ключ корзины, связанный с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    
    # Очищаем корзину
    request.session[cart_key] = []
    
    return {"message": "Корзина очищена"}