# app/crud/supplier.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def get_suppliers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
) -> List[Supplier]:
    """Получение списка поставщиков с возможностью фильтрации"""
    query = db.query(Supplier)

    if is_active is not None:
        query = query.filter(Supplier.is_active == is_active)

    return query.order_by(Supplier.name).offset(skip).limit(limit).all()


def get_supplier(db: Session, supplier_id: int) -> Optional[Supplier]:
    """Получение поставщика по ID"""
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()


def get_supplier_by_name(db: Session, name: str) -> Optional[Supplier]:
    """Получение поставщика по названию"""
    return db.query(Supplier).filter(Supplier.name == name).first()


def create_supplier(db: Session, supplier: SupplierCreate) -> Supplier:
    """Создание нового поставщика"""
    db_supplier = Supplier(
        name=supplier.name,
        contact_person=supplier.contact_person,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        is_active=supplier.is_active,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def update_supplier(
        db: Session,
        supplier_id: int,
        supplier_update: SupplierUpdate
) -> Optional[Supplier]:
    """Обновление поставщика"""
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return None

    update_data = supplier_update.model_dump(exclude_unset=True)

    if update_data:
        update_data['updated_at'] = datetime.utcnow()

        for field, value in update_data.items():
            setattr(db_supplier, field, value)

        db.commit()
        db.refresh(db_supplier)

    return db_supplier


def delete_supplier(db: Session, supplier_id: int) -> bool:
    """Удаление поставщика (мягкое удаление - изменение is_active на False)"""
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return False

    db_supplier.is_active = False
    db_supplier.updated_at = datetime.utcnow()
    db.commit()
    return True


def search_suppliers(db: Session, search_term: str, limit: int = 50) -> List[Supplier]:
    """Поиск поставщиков по названию или контактному лицу"""
    return db.query(Supplier).filter(
        (Supplier.name.ilike(f"%{search_term}%")) |
        (Supplier.contact_person.ilike(f"%{search_term}%"))
    ).filter(Supplier.is_active == True).limit(limit).all()