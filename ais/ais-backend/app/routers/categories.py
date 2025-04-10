# ais/ais-backend/app/routers/categories.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.models import Category

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Получить список всех категорий
    """
    categories = db.query(Category).all()
    return categories

@router.post("", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Создать новую категорию
    """
    # Проверяем, существует ли родительская категория
    if category.parent_category_id:
        parent = db.query(Category).filter(Category.id == category.parent_category_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Родительская категория не найдена")
    
    db_category = Category(
        name=category.name,
        parent_category_id=category.parent_category_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Получить категорию по ID
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category_data: CategoryUpdate, db: Session = Depends(get_db)):
    """
    Обновить существующую категорию
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Проверяем, существует ли родительская категория, если она изменена
    if category_data.parent_category_id and category_data.parent_category_id != db_category.parent_category_id:
        parent = db.query(Category).filter(Category.id == category_data.parent_category_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Родительская категория не найдена")
        
        # Проверка на циклическую зависимость
        if category_id == category_data.parent_category_id:
            raise HTTPException(status_code=400, detail="Категория не может быть своим родителем")
    
    # Обновляем поля
    for key, value in category_data.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Удалить категорию
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Проверяем наличие товаров в этой категории
    products_count = db.query(Category).filter(Category.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(status_code=400, detail="Невозможно удалить категорию, содержащую товары")
    
    # Проверяем наличие подкатегорий
    subcategories_count = db.query(Category).filter(Category.parent_category_id == category_id).count()
    if subcategories_count > 0:
        raise HTTPException(status_code=400, detail="Невозможно удалить категорию, содержащую подкатегории")
    
    db.delete(db_category)
    db.commit()
    
    return {"detail": "Категория успешно удалена"}# ais/ais-backend/app/routers/categories.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.models import Category

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Получить список всех категорий
    """
    categories = db.query(Category).all()
    return categories

@router.post("", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Создать новую категорию
    """
    # Проверяем, существует ли родительская категория
    if category.parent_category_id:
        parent = db.query(Category).filter(Category.id == category.parent_category_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Родительская категория не найдена")
    
    db_category = Category(
        name=category.name,
        parent_category_id=category.parent_category_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Получить категорию по ID
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category_data: CategoryUpdate, db: Session = Depends(get_db)):
    """
    Обновить существующую категорию
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Проверяем, существует ли родительская категория, если она изменена
    if category_data.parent_category_id and category_data.parent_category_id != db_category.parent_category_id:
        parent = db.query(Category).filter(Category.id == category_data.parent_category_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Родительская категория не найдена")
        
        # Проверка на циклическую зависимость
        if category_id == category_data.parent_category_id:
            raise HTTPException(status_code=400, detail="Категория не может быть своим родителем")
    
    # Обновляем поля
    for key, value in category_data.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Удалить категорию
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Проверяем наличие товаров в этой категории
    products_count = db.query(Category).filter(Category.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(status_code=400, detail="Невозможно удалить категорию, содержащую товары")
    
    # Проверяем наличие подкатегорий
    subcategories_count = db.query(Category).filter(Category.parent_category_id == category_id).count()
    if subcategories_count > 0:
        raise HTTPException(status_code=400, detail="Невозможно удалить категорию, содержащую подкатегории")
    
    db.delete(db_category)
    db.commit()
    
    return {"detail": "Категория успешно удалена"}