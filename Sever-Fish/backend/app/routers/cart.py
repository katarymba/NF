from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from starlette import status

from app.database import get_db
from app.models import Product
from app.schemas import CartItemCreate, CartItemResponse, CartItemUpdate, ApiResponse
from app.utils.auth import extract_token_from_header, decode_token

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["Cart"])

MAX_QUANTITY = 99


@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
        cart_item: CartItemCreate,
        request: Request,
        db: Session = Depends(get_db),
        authorization: Optional[str] = Header(None)
):
    """
    Добавляет товар в корзину пользователя.
    Если пользователь авторизован, корзина сохраняется в сессии с привязкой к user_id.
    Если пользователь не авторизован, корзина сохраняется в анонимной сессии.
    """
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
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
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
            # Добавляем время обновления
            item['updated_at'] = datetime.utcnow().isoformat()
            break
    else:
        # Если товара нет, добавляем новый
        cart.append({
            'product_id': cart_item.product_id,
            'quantity': cart_item.quantity,
            'added_at': datetime.utcnow().isoformat()
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
    """
    Получает содержимое корзины пользователя.
    Если пользователь авторизован, возвращает корзину, связанную с user_id.
    Если пользователь не авторизован, возвращает корзину из анонимной сессии.
    """
    # Инициализируем user_id как None
    user_id = None

    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
            pass

    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])

    # Загружаем полную информацию о продуктах
    cart_with_products = []
    for index, item in enumerate(cart):
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        if product:  # Проверяем, что продукт существует
            # Проверяем наличие на складе и обновляем quantity если необходимо
            if product.stock_quantity < item['quantity']:
                item['quantity'] = product.stock_quantity
                cart[index]['quantity'] = product.stock_quantity
                request.session[cart_key] = cart

            cart_with_products.append({
                'id': index,
                'product_id': item['product_id'],
                'quantity': item['quantity'],
                'user_id': user_id,
                'product': product,
                'added_at': item.get('added_at')
            })

    return cart_with_products


@router.put("/{cart_id}", response_model=CartItemResponse)
async def update_cart_quantity(
        cart_id: int,
        item_update: CartItemUpdate,
        request: Request,
        db: Session = Depends(get_db),
        authorization: Optional[str] = Header(None)
):
    """
    Обновляет количество товара в корзине.
    """
    # Проверка количества
    if item_update.quantity < 1 or item_update.quantity > MAX_QUANTITY:
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
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
            pass

    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])

    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")

    # Обновляем количество
    cart[cart_id]['quantity'] = item_update.quantity
    cart[cart_id]['updated_at'] = datetime.utcnow().isoformat()
    request.session[cart_key] = cart

    # Загружаем информацию о продукте
    product = db.query(Product).filter(Product.id == cart[cart_id]['product_id']).first()

    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден в базе данных")

    # Проверка наличия на складе
    if product.stock_quantity < item_update.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Недостаточно товара на складе. В наличии: {product.stock_quantity}"
        )

    return {
        'id': cart_id,
        'product_id': cart[cart_id]['product_id'],
        'quantity': item_update.quantity,
        'user_id': user_id,
        'product': product,
        'added_at': cart[cart_id].get('added_at'),
        'updated_at': cart[cart_id].get('updated_at')
    }


@router.delete("/{cart_id}", response_model=ApiResponse)
async def remove_from_cart(
        cart_id: int,
        request: Request,
        authorization: Optional[str] = Header(None)
):
    """
    Удаляет товар из корзины.
    """
    # Инициализируем user_id как None
    user_id = None

    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
            pass

    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])

    # Проверяем, что cart_id корректный
    if cart_id < 0 or cart_id >= len(cart):
        raise HTTPException(status_code=404, detail="Товар в корзине не найден")

    # Удаляем товар
    removed_item = cart.pop(cart_id)
    request.session[cart_key] = cart

    return {
        "success": True,
        "message": "Товар удален из корзины",
        "data": {"product_id": removed_item['product_id']}
    }


@router.delete("/", response_model=ApiResponse)
async def clear_cart(
        request: Request,
        authorization: Optional[str] = Header(None)
):
    """
    Очищает корзину пользователя.
    """
    # Инициализируем user_id как None
    user_id = None

    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
            pass

    # Получаем ключ корзины, связанный с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'

    # Получаем текущее количество товаров в корзине перед очисткой
    cart = request.session.get(cart_key, [])
    item_count = len(cart)

    # Очищаем корзину
    request.session[cart_key] = []

    return {
        "success": True,
        "message": "Корзина очищена",
        "data": {"removed_items": item_count}
    }


@router.get("/count", response_model=dict)
async def get_cart_count(
        request: Request,
        authorization: Optional[str] = Header(None)
):
    """
    Возвращает количество товаров в корзине.
    """
    # Инициализируем user_id как None
    user_id = None

    # Если передан токен авторизации, пытаемся извлечь user_id
    if authorization:
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                token = auth_parts[1]
                # Проверяем токен и получаем user_id
                payload = decode_token(token)
                if payload and "user_id" in payload:
                    user_id = payload.get('user_id')
        except Exception as e:
            # В случае ошибки проверки токена - продолжаем без авторизации
            logger.error(f"Ошибка проверки токена: {e}")
            pass

    # Получаем корзину из сессии, связанную с user_id, если он есть
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])

    # Считаем общее количество товаров
    total_items = sum(item['quantity'] for item in cart)

    return {"total_items": total_items, "cart_size": len(cart)}


@router.post("/merge", response_model=ApiResponse)
async def merge_carts(
        request: Request,
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db)
):
    """
    Объединяет анонимную корзину с корзиной авторизованного пользователя.
    Используется при входе пользователя, если у него была анонимная корзина.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация для объединения корзин"
        )

    # Получаем user_id из токена
    user_id = None
    try:
        auth_parts = authorization.split()
        if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
            token = auth_parts[1]
            payload = decode_token(token)
            if payload and "user_id" in payload:
                user_id = payload.get('user_id')
    except Exception as e:
        logger.error(f"Ошибка проверки токена: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен авторизации"
        )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен авторизации"
        )

    # Получаем анонимную корзину
    anonymous_cart = request.session.get('cart', [])

    if not anonymous_cart:
        return {"success": True, "message": "Нет анонимной корзины для объединения"}

    # Получаем корзину пользователя
    user_cart_key = f'cart_{user_id}'
    user_cart = request.session.get(user_cart_key, [])

    # Объединяем корзины
    for anon_item in anonymous_cart:
        # Проверяем, есть ли такой товар в корзине пользователя
        for user_item in user_cart:
            if user_item['product_id'] == anon_item['product_id']:
                # Обновляем количество
                new_quantity = user_item['quantity'] + anon_item['quantity']
                if new_quantity > MAX_QUANTITY:
                    new_quantity = MAX_QUANTITY
                user_item['quantity'] = new_quantity
                user_item['updated_at'] = datetime.utcnow().isoformat()
                break
        else:
            # Если товара нет в корзине пользователя, добавляем его
            user_cart.append({
                'product_id': anon_item['product_id'],
                'quantity': anon_item['quantity'],
                'added_at': datetime.utcnow().isoformat()
            })

    # Сохраняем объединенную корзину и очищаем анонимную
    request.session[user_cart_key] = user_cart
    request.session['cart'] = []

    return {
        "success": True,
        "message": "Корзины успешно объединены",
        "data": {"items_count": len(user_cart)}
    }