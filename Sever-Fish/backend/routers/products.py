from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Product, Category
from schemas import ProductResponse, CategoryResponse, ProductCreate, CategoryCreate
import logging

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])

# Получить все товары с пагинацией
@router.get("/", response_model=List[ProductResponse])
def get_all_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Сколько товаров пропустить"),
    limit: int = Query(100, description="Максимальное количество товаров")
):
    try:
        products = db.query(Product).offset(skip).limit(limit).all()
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении товаров: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товаров: {str(e)}")

# Получить список категорий
@router.get("/categories/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(Category).all()
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении категорий: {str(e)}")

# Получить товары по категории
@router.get("/category/{category_slug}", response_model=List[ProductResponse])
def get_products_by_category(
    category_slug: str,
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Сколько товаров пропустить"),
    limit: int = Query(100, description="Максимальное количество товаров")
):
    try:
        category = db.query(Category).filter(Category.slug == category_slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Категория не найдена")
        
        products = db.query(Product)\
            .filter(Product.category_id == category.id)\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        return products
    except HTTPException:
        # Пробрасываем HTTPException дальше
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товаров по категории {category_slug}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товаров по категории: {str(e)}")

# Получить товар по ID
@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Товар не найден")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товара с ID {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товара: {str(e)}")

# Создать новый товар (для админов)
@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Здесь должна быть проверка на админа
    try:
        # Проверяем, существует ли категория
        category = db.query(Category).filter(Category.id == product.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Категория не найдена")
        
        # Создаем новый товар
        db_product = Product(
            name=product.name,
            description=product.description,
            price=product.price,
            image_url=product.image_url,
            weight=product.weight,
            category_id=product.category_id
        )
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при создании товара: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при создании товара: {str(e)}")

# Создать новую категорию (для админов)
@router.post("/categories/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    # Здесь должна быть проверка на админа
    try:
        # Проверяем, не существует ли уже категория с таким слагом
        existing_category = db.query(Category).filter(Category.slug == category.slug).first()
        if existing_category:
            raise HTTPException(
                status_code=400,
                detail=f"Категория со слагом '{category.slug}' уже существует"
            )
        
        # Создаем новую категорию
        db_category = Category(
            name=category.name,
            slug=category.slug,
            description=category.description
        )
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        return db_category
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при создании категории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при создании категории: {str(e)}")