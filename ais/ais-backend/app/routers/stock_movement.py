# app/routers/stock_movement.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user, get_current_admin
from app.crud import stock_movement as stock_movement_crud

router = APIRouter(
    prefix="/stock-movements",
    tags=["stock_movements"],
    responses={404: {"description": "Движение товаров не найдено"}},
)

@router.get("/", response_model=List[Dict[str, Any]])
def get_stock_movements(
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Получение списка движений товаров с возможностью фильтрации.
    """
    return stock_movement_crud.get_all_stock_movements(
        db, skip=skip, limit=limit,
        product_id=product_id, warehouse_id=warehouse_id
    )

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_stock_movement(
    movement_data: dict,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Создание записи о движении товара.
    """
    try:
        return stock_movement_crud.create_stock_movement(db, movement_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось создать запись о движении товара: {str(e)}"
        )