from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from app.database import get_db
from app.models import Product, Stock, StockMovement, MovementType, Warehouse
from app.services.notifications import send_email_notification
from app.schemas.inventory import InventoryReport, StockThreshold, ReorderRecommendation

router = APIRouter()
logger = logging.getLogger("inventory-automation")

@router.get("/low-stock-alerts", response_model=List[ReorderRecommendation])
def get_low_stock_alerts(db: Session = Depends(get_db)):

    # Находим товары с низким запасом
    threshold_query = db.query(
        Stock.product_id,
        Product.name.label("product_name"),
        Stock.warehouse_id,
        Warehouse.name.label("warehouse_name"),
        Stock.quantity
    ).join(
        Product, Stock.product_id == Product.id
    ).join(
        Warehouse, Stock.warehouse_id == Warehouse.id
    ).filter(
        Stock.quantity < Product.min_stock_level
    )
    
    low_stock_items = threshold_query.all()
    
    # Формируем рекомендации
    recommendations = []
    for item in low_stock_items:
        # Получаем историю продаж для расчета оптимального количества
        history = db.query(StockMovement).filter(
            StockMovement.product_id == item.product_id,
            StockMovement.movement_type == MovementType.SALE,
            StockMovement.created_at >= (datetime.now() - timedelta(days=30))
        ).all()
        
        # Рассчитываем среднее потребление за день
        total_sold = sum(movement.quantity for movement in history)
        daily_consumption = total_sold / 30 if history else 1
        
        # Рассчитываем рекомендуемое количество для заказа (на 30 дней вперед)
        recommended_quantity = max(
            int((daily_consumption * 30) - item.quantity), 
            0
        )
        
        recommendations.append({
            "product_id": item.product_id,
            "product_name": item.product_name,
            "warehouse_id": item.warehouse_id,
            "warehouse_name": item.warehouse_name,
            "current_quantity": item.quantity,
            "recommended_reorder_quantity": recommended_quantity,
            "urgency": "High" if item.quantity <= 0 else "Medium" if item.quantity < 10 else "Low"
        })
    
    # Логируем и отправляем уведомление, если есть товары с критически низким запасом
    critical_items = [r for r in recommendations if r["urgency"] == "High"]
    if critical_items:
        logger.warning(f"Обнаружено {len(critical_items)} товаров с критически низким запасом")
        try:
            send_email_notification(
                subject="СРОЧНО: Товары с нулевым запасом",
                body=f"Следующие товары требуют немедленного пополнения: {', '.join([i['product_name'] for i in critical_items])}",
                recipients=["procurement@sever-ryba.ru"]
            )
        except Exception as e:
            logger.error(f"Ошибка при отправке уведомления: {str(e)}")
    
    return recommendations

@router.get("/automated-inventory-report", response_model=InventoryReport)
def get_automated_inventory_report(
    days: Optional[int] = 30,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Автоматизированный отчет по движению запасов с аналитикой
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Базовый запрос для фильтрации по времени и складу
    base_query = db.query(StockMovement).filter(
        StockMovement.created_at >= start_date
    )
    
    if warehouse_id:
        base_query = base_query.filter(StockMovement.warehouse_id == warehouse_id)
    
    # Получаем все движения запасов
    movements = base_query.all()
    
    # Агрегируем данные
    sales = [m for m in movements if m.movement_type == MovementType.SALE]
    purchases = [m for m in movements if m.movement_type == MovementType.PURCHASE]
    returns = [m for m in movements if m.movement_type == MovementType.RETURN]
    
    # Рассчитываем статистику
    total_sales_count = len(sales)
    total_sales_quantity = sum(s.quantity for s in sales)
    total_purchases_count = len(purchases)
    total_purchases_quantity = sum(p.quantity for p in purchases)
    total_returns_count = len(returns)
    total_returns_quantity = sum(r.quantity for r in returns)
    
    # Определяем товары с наибольшими продажами
    product_sales = {}
    for sale in sales:
        if sale.product_id not in product_sales:
            product_sales[sale.product_id] = 0
        product_sales[sale.product_id] += sale.quantity
    
    # Сортируем по количеству продаж
    top_selling_products = sorted(
        product_sales.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]  # Топ 10
    
    # Получаем информацию о топовых товарах
    top_products_details = []
    for product_id, quantity in top_selling_products:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            top_products_details.append({
                "product_id": product_id,
                "name": product.name,
                "quantity_sold": quantity
            })
    
    # Формируем отчет
    report = {
        "period_days": days,
        "warehouse_id": warehouse_id,
        "generated_at": datetime.now(),
        "summary": {
            "total_sales_count": total_sales_count,
            "total_sales_quantity": total_sales_quantity,
            "total_purchases_count": total_purchases_count,
            "total_purchases_quantity": total_purchases_quantity,
            "total_returns_count": total_returns_count,
            "total_returns_quantity": total_returns_quantity,
            "net_inventory_change": total_purchases_quantity - total_sales_quantity + total_returns_quantity
        },
        "top_selling_products": top_products_details,
        "movement_by_day": {}
    }
    
    # Добавляем движение по дням
    current_date = start_date
    end_date = datetime.now()
    while current_date <= end_date:
        day_str = current_date.strftime("%Y-%m-%d")
        day_movements = [
            m for m in movements 
            if m.created_at.date() == current_date.date()
        ]
        
        report["movement_by_day"][day_str] = {
            "sales": sum(m.quantity for m in day_movements if m.movement_type == MovementType.SALE),
            "purchases": sum(m.quantity for m in day_movements if m.movement_type == MovementType.PURCHASE),
            "returns": sum(m.quantity for m in day_movements if m.movement_type == MovementType.RETURN)
        }
        
        current_date += timedelta(days=1)
    
    # Сохраняем отчет для будущего доступа
    # Здесь можно добавить логику сохранения отчета в базу данных
    
    return report

@router.post("/automated-stock-transfer")
def automated_stock_transfer(db: Session = Depends(get_db)):
    """
    Автоматическое перераспределение товаров между складами
    на основе спроса и прогнозов продаж
    """
    # Получаем все склады
    warehouses = db.query(Warehouse).all()
    
    if len(warehouses) < 2:
        return {"message": "Недостаточно складов для перераспределения"}
    
    transfers_created = 0
    
    # Для каждого товара анализируем распределение по складам
    products = db.query(Product).all()
    
    for product in products:
        # Получаем запасы по всем складам
        stock_by_warehouse = {}
        for warehouse in warehouses:
            stock = db.query(Stock).filter(
                Stock.product_id == product.id,
                Stock.warehouse_id == warehouse.id
            ).first()
            
            stock_by_warehouse[warehouse.id] = stock.quantity if stock else 0
        
        # Находим склады с избыточными и недостаточными запасами
        avg_stock = sum(stock_by_warehouse.values()) / len(warehouses)
        min_stock_level = product.min_stock_level or 10
        
        # Склады с малым запасом (менее 50% от среднего или ниже мин. уровня)
        low_stock_warehouses = {
            wid: qty for wid, qty in stock_by_warehouse.items()
            if qty < min(avg_stock * 0.5, min_stock_level)
        }
        
        # Склады с большим запасом (более 150% от среднего)
        high_stock_warehouses = {
            wid: qty for wid, qty in stock_by_warehouse.items()
            if qty > avg_stock * 1.5 and qty > min_stock_level * 2
        }
        
        # Если есть склады с малым и большим запасом, перераспределяем
        if low_stock_warehouses and high_stock_warehouses:
            for low_wid, low_qty in low_stock_warehouses.items():
                for high_wid, high_qty in high_stock_warehouses.items():
                    # Рассчитываем сколько можно перенести
                    needed = min(avg_stock, min_stock_level) - low_qty
                    available = high_qty - avg_stock
                    
                    if needed > 0 and available > 0:
                        transfer_qty = min(needed, available)
                        
                        # Создаем движение запасов
                        movement = StockMovement(
                            product_id=product.id,
                            warehouse_id=high_wid,
                            quantity=transfer_qty,
                            movement_type=MovementType.TRANSFER,
                            source_warehouse_id=high_wid,
                            target_warehouse_id=low_wid,
                            note=f"Автоматическое перераспределение запасов"
                        )
                        db.add(movement)
                        
                        # Обновляем запасы
                        source_stock = db.query(Stock).filter(
                            Stock.product_id == product.id,
                            Stock.warehouse_id == high_wid
                        ).first()
                        source_stock.quantity -= transfer_qty
                        
                        target_stock = db.query(Stock).filter(
                            Stock.product_id == product.id,
                            Stock.warehouse_id == low_wid
                        ).first()
                        
                        if target_stock:
                            target_stock.quantity += transfer_qty
                        else:
                            new_stock = Stock(
                                product_id=product.id,
                                warehouse_id=low_wid,
                                quantity=transfer_qty
                            )
                            db.add(new_stock)
                        
                        transfers_created += 1
                        
                        # Обновляем запасы для следующей итерации
                        high_stock_warehouses[high_wid] -= transfer_qty
                        low_stock_warehouses[low_wid] += transfer_qty
                        
                        # Прерываем, если перенесли достаточно
                        if low_stock_warehouses[low_wid] >= min(avg_stock, min_stock_level):
                            break
                    
                    # Прерываем, если на высоком складе не осталось избытка
                    if high_stock_warehouses[high_wid] <= avg_stock:
                        break
    
    # Фиксируем изменения
    db.commit()
    
    return {
        "message": f"Автоматическое перераспределение завершено",
        "transfers_created": transfers_created
    }