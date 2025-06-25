# app/routers/supply.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.warehouse import Warehouse
from app.schemas.supply import (
    SupplyCreate, SupplyUpdate, SupplyResponse,
    SupplyItem, SupplyItemUpdate
)
from app.crud import supply as supply_crud
from app.auth import get_current_admin
from app.models.administrator import Administrator

router = APIRouter(
    prefix="/supplies",
    tags=["supplies"],
    responses={404: {"description": "Не найдено"}},
)


@router.get("/", response_model=List[SupplyResponse])
def get_supplies(
        skip: int = 0,
        limit: int = 100,
        supplier_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        status: Optional[str] = None,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Получение списка поставок с возможностью фильтрации.
    """
    supplies = supply_crud.get_supplies(
        db, skip=skip, limit=limit,
        supplier_id=supplier_id, warehouse_id=warehouse_id, status=status
    )
    return supplies


@router.post("/", response_model=SupplyResponse, status_code=status.HTTP_201_CREATED)
def create_supply(
        supply: SupplyCreate,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Создание новой поставки.
    """
    # Проверяем существование склада
    warehouse = db.query(Warehouse).filter(Warehouse.id == supply.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Склад с ID {supply.warehouse_id} не найден"
        )

    # Создаем поставку
    try:
        return supply_crud.create_supply(db, supply, current_admin.username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{supply_id}", response_model=SupplyResponse)
def get_supply(
        supply_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Получение конкретной поставки по ID.
    """
    supply = supply_crud.get_supply(db, supply_id)
    if not supply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставка с ID {supply_id} не найдена"
        )
    return supply


@router.put("/{supply_id}", response_model=SupplyResponse)
def update_supply(
        supply_id: int,
        supply_update: SupplyUpdate,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)  # Используем get_current_admin
):
    """
    Обновление поставки.
    """
    updated_supply = supply_crud.update_supply(db, supply_id, supply_update)
    if not updated_supply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставка с ID {supply_id} не найдена"
        )
    return updated_supply


@router.delete("/{supply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supply(
        supply_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)  # Используем get_current_admin
):
    """
    Удаление поставки.
    """
    success = supply_crud.delete_supply(db, supply_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставка с ID {supply_id} не найдена"
        )
    return {"success": True}


@router.put("/items/{item_id}", response_model=SupplyItem)
def update_supply_item(
        item_id: int,
        item_update: SupplyItemUpdate,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)  # Используем get_current_admin
):
    """
    Обновление элемента поставки.
    """
    updated_item = supply_crud.update_supply_item(db, item_id, item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент поставки с ID {item_id} не найден"
        )
    return updated_item


@router.post("/{supply_id}/process", status_code=status.HTTP_200_OK)
def process_supply(
        supply_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)  # Используем get_current_admin
):
    """
    Обработка полученной поставки и создание соответствующих движений запасов.
    """
    supply = supply_crud.get_supply(db, supply_id)
    if not supply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставка с ID {supply_id} не найдена"
        )

    if supply.status != "received":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Только поставки со статусом 'received' могут быть обработаны"
        )

    success = supply_crud.process_received_supply(db, supply_id, current_admin.username)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось обработать поставку"
        )

    return {"message": f"Поставка {supply_id} успешно обработана", "success": True}