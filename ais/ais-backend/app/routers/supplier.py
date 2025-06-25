# app/routers/supplier.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.supplier import (
    SupplierCreate, SupplierUpdate, SupplierResponse
)
from app.crud import supplier as supplier_crud
from app.auth import get_current_admin
from app.models.administrator import Administrator

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    responses={404: {"description": "Не найдено"}},
)


@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = Query(None, description="Фильтр по активности поставщика"),
        search: Optional[str] = Query(None, description="Поиск по названию или контактному лицу"),
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Получение списка поставщиков с возможностью фильтрации и поиска.
    """
    if search:
        suppliers = supplier_crud.search_suppliers(db, search_term=search, limit=limit)
    else:
        suppliers = supplier_crud.get_suppliers(
            db, skip=skip, limit=limit, is_active=is_active
        )
    return suppliers


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
        supplier_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Получение конкретного поставщика по ID.
    """
    supplier = supplier_crud.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставщик с ID {supplier_id} не найден"
        )
    return supplier


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
        supplier: SupplierCreate,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Создание нового поставщика.
    """
    # Проверяем, не существует ли уже поставщик с таким названием
    existing_supplier = supplier_crud.get_supplier_by_name(db, supplier.name)
    if existing_supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Поставщик с названием '{supplier.name}' уже существует"
        )

    return supplier_crud.create_supplier(db=db, supplier=supplier)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
        supplier_id: int,
        supplier_update: SupplierUpdate,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Обновление существующего поставщика.
    """
    # Если обновляется название, проверяем на уникальность
    if supplier_update.name:
        existing_supplier = supplier_crud.get_supplier_by_name(db, supplier_update.name)
        if existing_supplier and existing_supplier.id != supplier_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Поставщик с названием '{supplier_update.name}' уже существует"
            )

    supplier = supplier_crud.update_supplier(db, supplier_id, supplier_update)
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставщик с ID {supplier_id} не найден"
        )
    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
        supplier_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Удаление поставщика (мягкое удаление - деактивация).
    """
    success = supplier_crud.delete_supplier(db, supplier_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставщик с ID {supplier_id} не найден"
        )


@router.patch("/{supplier_id}/activate", response_model=SupplierResponse)
def activate_supplier(
        supplier_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Активация поставщика.
    """
    supplier = supplier_crud.update_supplier(
        db, supplier_id, SupplierUpdate(is_active=True)
    )
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставщик с ID {supplier_id} не найден"
        )
    return supplier


@router.patch("/{supplier_id}/deactivate", response_model=SupplierResponse)
def deactivate_supplier(
        supplier_id: int,
        db: Session = Depends(get_db),
        current_admin: Administrator = Depends(get_current_admin)
):
    """
    Деактивация поставщика.
    """
    supplier = supplier_crud.update_supplier(
        db, supplier_id, SupplierUpdate(is_active=False)
    )
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Поставщик с ID {supplier_id} не найден"
        )
    return supplier