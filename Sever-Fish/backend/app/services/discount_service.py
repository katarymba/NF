# app/services/discount_service.py
import logging
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

# Хранилище скидок в памяти (в реальном приложении должно быть в БД)
discounts = {}
active_promotions = []


def initialize():
    """Инициализация сервиса скидок"""
    logger.info("Инициализация сервиса скидок")
    # В реальном приложении здесь должна быть загрузка скидок из БД
    # Для примера создадим несколько тестовых скидок
    create_sample_discounts()


def create_sample_discounts():
    """Создание тестовых скидок для демонстрации"""
    global discounts, active_promotions

    # Очистка существующих скидок
    discounts = {}
    active_promotions = []

    # Создание скидок на категории продуктов
    discounts["category:1"] = {"type": "percentage", "value": 10, "expires": datetime.now() + timedelta(days=30)}
    discounts["category:2"] = {"type": "percentage", "value": 15, "expires": datetime.now() + timedelta(days=15)}

    # Создание скидок на конкретные продукты
    discounts["product:101"] = {"type": "fixed", "value": 100, "expires": datetime.now() + timedelta(days=7)}
    discounts["product:102"] = {"type": "percentage", "value": 20, "expires": datetime.now() + timedelta(days=5)}

    # Создание промо-кодов
    discounts["promo:WELCOME"] = {"type": "percentage", "value": 10, "expires": datetime.now() + timedelta(days=90)}
    discounts["promo:SUMMER"] = {"type": "fixed", "value": 500, "expires": datetime.now() + timedelta(days=60)}

    # Активные промо-акции
    active_promotions = [
        {"id": 1, "name": "Летняя распродажа", "discount": 15, "expires": datetime.now() + timedelta(days=30)},
        {"id": 2, "name": "Черная пятница", "discount": 30, "expires": datetime.now() + timedelta(days=3)},
    ]

    logger.info(f"Создано {len(discounts)} тестовых скидок и {len(active_promotions)} промо-акций")


def get_product_discount(product_id: int, category_id: Optional[int] = None) -> Dict:
    """
    Получение скидки для конкретного продукта

    Args:
        product_id: ID продукта
        category_id: ID категории продукта

    Returns:
        Dict: Информация о скидке
    """
    result = {"has_discount": False, "discount_value": 0, "discount_type": None}

    # Проверка скидки на продукт
    product_key = f"product:{product_id}"
    if product_key in discounts and datetime.now() < discounts[product_key]["expires"]:
        result["has_discount"] = True
        result["discount_value"] = discounts[product_key]["value"]
        result["discount_type"] = discounts[product_key]["type"]
        return result

    # Проверка скидки на категорию
    if category_id:
        category_key = f"category:{category_id}"
        if category_key in discounts and datetime.now() < discounts[category_key]["expires"]:
            result["has_discount"] = True
            result["discount_value"] = discounts[category_key]["value"]
            result["discount_type"] = discounts[category_key]["type"]

    return result


def apply_promo_code(promo_code: str) -> Dict:
    """
    Применение промо-кода

    Args:
        promo_code: Промо-код

    Returns:
        Dict: Результат применения промо-кода
    """
    promo_key = f"promo:{promo_code.upper()}"

    if promo_key in discounts and datetime.now() < discounts[promo_key]["expires"]:
        return {
            "valid": True,
            "discount_value": discounts[promo_key]["value"],
            "discount_type": discounts[promo_key]["type"],
            "message": f"Промо-код успешно применен! Скидка: {discounts[promo_key]['value']}%"
            if discounts[promo_key]["type"] == "percentage"
            else f"Промо-код успешно применен! Скидка: {discounts[promo_key]['value']} руб."
        }
    else:
        return {
            "valid": False,
            "message": "Промо-код недействителен или истек срок его действия"
        }


def get_active_promotions() -> List[Dict]:
    """
    Получение списка активных акций

    Returns:
        List[Dict]: Список активных акций
    """
    return [promo for promo in active_promotions if datetime.now() < promo["expires"]]


def calculate_cart_discount(cart_items: List[Dict]) -> Dict:
    """
    Расчет общей скидки для корзины

    Args:
        cart_items: Список товаров в корзине

    Returns:
        Dict: Информация о скидке
    """
    total_price = sum(item.get("price", 0) * item.get("quantity", 1) for item in cart_items)
    discount_amount = 0

    # Расчет скидок для каждого товара
    for item in cart_items:
        product_id = item.get("product_id")
        category_id = item.get("category_id")
        quantity = item.get("quantity", 1)
        price = item.get("price", 0)

        if product_id:
            discount = get_product_discount(product_id, category_id)
            if discount["has_discount"]:
                if discount["discount_type"] == "percentage":
                    # Процентная скидка
                    item_discount = (price * discount["discount_value"] / 100) * quantity
                else:
                    # Фиксированная скидка
                    item_discount = min(discount["discount_value"], price) * quantity

                discount_amount += item_discount

    # Общие данные о скидке
    return {
        "total_price": total_price,
        "discount_amount": discount_amount,
        "final_price": total_price - discount_amount,
        "has_discount": discount_amount > 0,
        "discount_percentage": round((discount_amount / total_price) * 100, 2) if total_price > 0 else 0
    }