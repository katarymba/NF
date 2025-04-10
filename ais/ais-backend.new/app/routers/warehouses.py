# ais/ais-backend/app/routers/warehouses.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Warehouse, Stock, StockMovement, MovementType, Product, Category, User
from app.schemas import (
    WarehouseCreate, 
    WarehouseResponse, 
    WarehouseUpdate,
    ProductStockInfo,
    WarehouseStockInfo,
    TransferRequest,
    StockMovementResponse
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])

# Получение списка всех складов
@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    return warehouses

# Получение информации о конкретном складе
@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Склад не найден")
    return warehouse

# Создание нового склада
@router.post("/", response_model=WarehouseResponse)
def create_warehouse(warehouse: WarehouseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_warehouse = Warehouse(**warehouse.dict())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

# Обновление информации о складе
@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(warehouse_id: int, warehouse: WarehouseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Склад не найден")
    
    for key, value in warehouse.dict(exclude_unset=True).items():
        setattr(db_warehouse, key, value)
    
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

# Удаление склада
@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Склад не найден")
    
    # Проверяем, есть ли товары на складе
    stock_count = db.query(Stock).filter(Stock.warehouse_id == warehouse_id, Stock.quantity > 0).count()
    if stock_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Невозможно удалить склад. На складе имеется {stock_count} товаров."
        )
    
    db.delete(db_warehouse)
    db.commit()
    return {"detail": "Склад успешно удален"}

# Получение информации о товарах на складе
@router.get("/{warehouse_id}/stock", response_model=List[dict])
def get_warehouse_stock(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Склад не найден")
    
    # Запрос на получение информации о товарах на складе
    stock_query = (
        db.query(
            Stock.product_id,
            Product.name.label("product_name"),
            Category.name.label("category_name"),
            Stock.quantity
        )
        .join(Product, Stock.product_id == Product.id)
        .join(Category, Product.category_id == Category.id)
        .filter(Stock.warehouse_id == warehouse_id, Stock.quantity > 0)
        .order_by(Product.name)
    )
    
    stock_items = stock_query.all()
    
    # Преобразуем результаты в словари для возврата
    result = []
    for item in stock_items:
        result.append({
            "product_id": item.product_id,
            "product_name": item.product_name,
            "category_name": item.category_name,
            "quantity": item.quantity
        })
    
    return result

# Перемещение товаров между складами
@router.post("/transfer", response_model=dict)
def transfer_stock(
    transfer_data: TransferRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Проверяем существование продукта
    product = db.query(Product).filter(Product.id == transfer_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Проверяем существование исходного склада
    source_warehouse = db.query(Warehouse).filter(Warehouse.id == transfer_data.source_warehouse_id).first()
    if not source_warehouse:
        raise HTTPException(status_code=404, detail="Исходный склад не найден")
    
    # Проверяем существование целевого склада
    target_warehouse = db.query(Warehouse).filter(Warehouse.id == transfer_data.target_warehouse_id).first()
    if not target_warehouse:
        raise HTTPException(status_code=404, detail="Целевой склад не найден")
    
    # Проверяем, что источник и цель не совпадают
    if transfer_data.source_warehouse_id == transfer_data.target_warehouse_id:
        raise HTTPException(
            status_code=400, 
            detail="Исходный и целевой склад не могут быть одинаковыми"
        )
    
    # Проверяем наличие достаточного количества товара на исходном складе
    source_stock = db.query(Stock).filter(
        Stock.product_id == transfer_data.product_id,
        Stock.warehouse_id == transfer_data.source_warehouse_id
    ).first()
    
    if not source_stock or source_stock.quantity < transfer_data.quantity:
        raise HTTPException(
            status_code=400, 
            detail=f"Недостаточно товара на исходном складе. Доступно: {source_stock.quantity if source_stock else 0}"
        )
    
    # Уменьшаем количество товара на исходном складе
    source_stock.quantity -= transfer_data.quantity
    
    # Увеличиваем количество товара на целевом складе
    target_stock = db.query(Stock).filter(
        Stock.product_id == transfer_data.product_id,
        Stock.warehouse_id == transfer_data.target_warehouse_id
    ).first()
    
    if target_stock:
        target_stock.quantity += transfer_data.quantity
    else:
        target_stock = Stock(
            product_id=transfer_data.product_id,
            warehouse_id=transfer_data.target_warehouse_id,
            quantity=transfer_data.quantity
        )
        db.add(target_stock)
    
    # Создаем запись о движении товара
    stock_movement = StockMovement(
        product_id=transfer_data.product_id,
        warehouse_id=transfer_data.source_warehouse_id,  # Основной склад для операции (источник)
        quantity=transfer_data.quantity,
        movement_type=MovementType.TRANSFER,
        source_warehouse_id=transfer_data.source_warehouse_id,
        target_warehouse_id=transfer_data.target_warehouse_id,
        created_by_id=current_user.id if current_user else None,
        note=transfer_data.note
    )
    db.add(stock_movement)
    
    # Сохраняем изменения в базе данных
    db.commit()
    
    return {
        "detail": "Товар успешно перемещен",
        "source_warehouse": source_warehouse.name,
        "target_warehouse": target_warehouse.name,
        "product": product.name,
        "quantity": transfer_data.quantity
    }

# Получение истории движений товаров на складе
@router.get("/{warehouse_id}/movements", response_model=List[StockMovementResponse])
def get_warehouse_movements(
    warehouse_id: int, 
    limit: int = 100, 
    skip: int = 0,
    db: Session = Depends(get_db)
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Склад не найден")
    
    # Запрос на получение истории движений товаров на складе
    movements_query = (
        db.query(StockMovement)
        .filter(
            (StockMovement.warehouse_id == warehouse_id) |
            (StockMovement.source_warehouse_id == warehouse_id) |
            (StockMovement.target_warehouse_id == warehouse_id)
        )
        .order_by(StockMovement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    movements = movements_query.all()
    
    # Преобразуем результаты для возврата
    result = []
    for movement in movements:
        movement_dict = {
            "id": movement.id,
            "product_id": movement.product_id,
            "warehouse_id": movement.warehouse_id,
            "quantity": movement.quantity,
            "movement_type": movement.movement_type,
            "source_warehouse_id": movement.source_warehouse_id,
            "target_warehouse_id": movement.target_warehouse_id,
            "created_at": movement.created_at,
            "created_by_id": movement.created_by_id,
            "note": movement.note
        }
        
        # Добавляем дополнительную информацию
        product = db.query(Product).filter(Product.id == movement.product_id).first()
        if product:
            movement_dict["product_name"] = product.name
        
        warehouse = db.query(Warehouse).filter(Warehouse.id == movement.warehouse_id).first()
        if warehouse:
            movement_dict["warehouse_name"] = warehouse.name
        
        if movement.source_warehouse_id:
            source_warehouse = db.query(Warehouse).filter(Warehouse.id == movement.source_warehouse_id).first()
            if source_warehouse:
                movement_dict["source_warehouse_name"] = source_warehouse.name
        
        if movement.target_warehouse_id:
            target_warehouse = db.query(Warehouse).filter(Warehouse.id == movement.target_warehouse_id).first()
            if target_warehouse:
                movement_dict["target_warehouse_name"] = target_warehouse.name
        
        if movement.created_by_id:
            user = db.query(User).filter(User.id == movement.created_by_id).first()
            if user:
                movement_dict["created_by"] = user.username
        
        result.append(movement_dict)
    
    return result