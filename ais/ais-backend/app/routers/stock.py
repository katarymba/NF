# app/routers/stock.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user, get_current_admin
from app.schemas.stock import StockItemCreate, StockItemPatch, StockItemResponse
from app.crud import stock as stock_crud

router = APIRouter(
    prefix="/stocks",
    tags=["stocks"],
    responses={404: {"description": "Не найдено"}},
)


@router.get("/", response_model=List[Dict[str, Any]])
def get_stocks(
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[str] = None,
        warehouse_id: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение списка запасов с возможностью фильтрации.
    """
    # Конвертируем строковые ID в целые числа, если они предоставлены
    product_id_int = int(product_id) if product_id else None
    warehouse_id_int = int(warehouse_id) if warehouse_id else None

    return stock_crud.get_all_stocks(
        db, skip=skip, limit=limit,
        product_id=product_id_int, warehouse_id=warehouse_id_int
    )


@router.get("/metrics", response_model=Dict[str, Any])
def get_stock_metrics(
        product_id: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение метрик по запасам.
    """
    product_id_int = int(product_id) if product_id else None
    return stock_crud.calculate_stock_metrics(db, product_id=product_id_int)


@router.get("/{stock_id}", response_model=Dict[str, Any])
def get_stock(
        stock_id: str,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение информации о запасе по ID.
    """
    stock = stock_crud.get_stock_by_id(db, int(stock_id))
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Запас с ID {stock_id} не найден"
        )
    return stock


@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_stock(
        stock_data: StockItemCreate,
        request: Request,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Создание или обновление записи о запасе.
    """
    try:
        # Получаем имя пользователя из запроса или из текущего админа
        username = getattr(current_admin, 'username', 'admin')

        return stock_crud.create_or_update_stock(db, stock_data, username=username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось создать запись о запасе: {str(e)}"
        )


@router.patch("/{stock_id}", response_model=Dict[str, Any])
def update_stock(
        stock_id: str,
        stock_update: StockItemPatch,
        request: Request,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Частичное обновление записи о запасе.
    """
    try:
        username = getattr(current_admin, 'username', 'admin')

        updated_stock = stock_crud.update_stock(
            db, int(stock_id), stock_update, username=username
        )

        if not updated_stock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Запас с ID {stock_id} не найден"
            )

        return updated_stock
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось обновить запись о запасе: {str(e)}"
        )


@router.post("/adjust", response_model=Dict[str, Any])
def adjust_stock_quantity(
        product_id: str = Query(..., description="ID продукта"),
        warehouse_id: str = Query(..., description="ID склада"),
        quantity_change: int = Query(..., description="Изменение количества (положительное или отрицательное)"),
        request: Request = None,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Изменение количества запаса продукта на складе.
    Положительное quantity_change увеличивает запас, отрицательное - уменьшает.
    """
    try:
        username = getattr(current_admin, 'username', 'admin')

        adjusted_stock = stock_crud.adjust_stock_quantity(
            db,
            int(product_id),
            int(warehouse_id),
            quantity_change,
            username=username
        )

        if not adjusted_stock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Не удалось изменить запас. Продукт или склад не найдены."
            )

        return adjusted_stock
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось изменить запись о запасе: {str(e)}"
        )


@router.delete("/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock(
        stock_id: str,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Удаление записи о запасе.
    """
    success = stock_crud.delete_stock(db, int(stock_id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Запас с ID {stock_id} не найден"
        )
    return {"success": True}