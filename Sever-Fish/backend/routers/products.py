from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Category
from schemas import ProductResponse, CategoryResponse
from typing import List

router = APIRouter(prefix="/products", tags=["Products"])

# Получить все товары
@router.get("/", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

# Получить список категорий (статический маршрут выше)
@router.get("/categories/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

# Получить товары по категории
@router.get("/category/{category_slug}", response_model=List[ProductResponse])
def get_products_by_category(category_slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    products = db.query(Product).filter(Product.category_id == category.id).all()
    return products

# Получить товар по ID (динамический маршрут должен быть ниже)
@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product
