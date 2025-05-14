# app/routers/product.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas import ProductCreate, ProductResponse, ProductBase, ProductUpdate
from app.crud import product as product_crud

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
    return product_crud.get_products(db, category_id, search)

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Создать новый товар
    """
    return product_crud.create_product(db, product)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Получить товар по ID
    """
    product = product_crud.get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)):
    """
    Обновить существующий товар
    """
    updated_product = product_crud.update_product(db, product_id, product_data)
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return updated_product

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Удалить товар
    """
    deleted = product_crud.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return {"detail": "Товар успешно удален"}