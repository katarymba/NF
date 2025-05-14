# app/routers/category.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.auth import get_current_user, get_current_admin
from app.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.crud import category as category_crud

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={404: {"description": "Категория не найдена"}}
)

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = None,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Получить список всех категорий с возможностью фильтрации
    """
    return category_crud.get_all_categories(db, skip, limit, name, parent_id)


@router.get("/tree", response_model=List[Dict[str, Any]])
def get_categories_tree(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Получить категории в виде дерева (с вложенными подкатегориями)
    """
    return category_crud.get_categories_tree(db)


@router.get("/statistics", response_model=List[Dict[str, Any]])
def get_category_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Получить статистику по категориям (количество товаров в каждой)
    """
    return category_crud.get_category_count_by_products(db)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Создать новую категорию
    """
    db_category = category_crud.create_category(db, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Родительская категория не найдена")
    return db_category


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Получить категорию по ID
    """
    category = category_crud.get_category_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category


@router.get("/{category_id}/details", response_model=Dict[str, Any])
def get_category_details(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Получить подробную информацию о категории, включая товары и подкатегории
    """
    category = category_crud.get_category_with_products(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Обновить существующую категорию
    """
    updated_category = category_crud.update_category(db, category_id, category_data)
    if not updated_category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return updated_category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Удалить категорию
    """
    success = category_crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Невозможно удалить категорию. Возможно, она содержит товары или подкатегории."
        )
    return {"detail": "Категория успешно удалена"}