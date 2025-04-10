# ais/ais-backend/app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas import ProductCreate, ProductResponse, ProductBase
from app.models import Product, Category

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = None, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список всех товаров с опциональной фильтрацией по категории и поиску
    """
    query = db.query(Product)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.all()
    
    # Обогащаем продукты информацией о категории
    for product in products:
        if product.category_id:
            product.category = db.query(Category).filter(Category.id == product.category_id).first()
    
    return products

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Создать новый товар
    """
    # Проверяем существование категории
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    db_product = Product(
        name=product.name,
        category_id=product.category_id,
        price=product.price,
        stock_quantity=product.stock_quantity,
        description=product.description,
        created_at=datetime.utcnow()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Добавляем категорию к ответу
    db_product.category = category
    
    return db_product

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Получить товар по ID
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Добавляем категорию к ответу
    if product.category_id:
        product.category = db.query(Category).filter(Category.id == product.category_id).first()
    
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_data: ProductBase, db: Session = Depends(get_db)):
    """
    Обновить существующий товар
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Проверяем существование категории, если она изменена
    if product_data.category_id and product_data.category_id != db_product.category_id:
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Обновляем поля
    for key, value in product_data.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Добавляем категорию к ответу
    if db_product.category_id:
        db_product.category = db.query(Category).filter(Category.id == db_product.category_id).first()
    
    return db_product

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Удалить товар
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    db.delete(db_product)
    db.commit()
    
    return {"detail": "Товар успешно удален"}