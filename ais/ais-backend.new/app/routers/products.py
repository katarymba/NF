from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas import ProductCreate, ProductResponse
from app.models import Product, Category

router = APIRouter()

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    db_product = Product(
        name=product.name,
        category_id=product.category_id,
        price=product.price,
        stock_quantity=product.stock_quantity,
        description=product.description,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("", response_model=list[ProductResponse])
def get_products(category_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Product)

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    products = query.all()
    return products
