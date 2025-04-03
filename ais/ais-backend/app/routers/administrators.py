from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Administrator
from app.schemas import AdministratorCreate, AdministratorResponse, AdministratorUpdate, AdministratorLogin
from app.routers.auth import get_password_hash, verify_password, create_access_token, require_admin

router = APIRouter(prefix="/administrators", tags=["Administrators"])


@router.post("/register", response_model=AdministratorResponse)
def register_admin(admin: AdministratorCreate, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    db_admin = db.query(Administrator).filter(Administrator.email == admin.email).first()
    if db_admin:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Создаем нового админа
    hashed_password = get_password_hash(admin.password)
    db_admin = Administrator(
        username=admin.username,
        email=admin.email,
        hashed_password=hashed_password
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    # Генерируем токен
    token = create_access_token(data={"sub": db_admin.email, "role": "admin"})

    return AdministratorResponse(
        id=db_admin.id,
        username=db_admin.username,
        email=db_admin.email,
        token=token,
        is_active=db_admin.is_active,
        created_at=db_admin.created_at
    )


@router.post("/login", response_model=AdministratorResponse)
def login_admin(admin_data: AdministratorLogin, db: Session = Depends(get_db)):
    admin = db.query(Administrator).filter(Administrator.email == admin_data.email).first()
    if not admin or not verify_password(admin_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": admin.email, "role": "admin"})
    return AdministratorResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        token=token,
        is_active=admin.is_active,
        created_at=admin.created_at
    )


@router.post("/", response_model=AdministratorResponse)
def create_administrator(
        admin_data: AdministratorCreate,
        current_admin: Administrator = Depends(require_admin),
        db: Session = Depends(get_db)
):
    existing_admin = db.query(Administrator).filter(
        (Administrator.username == admin_data.username) |
        (Administrator.email == admin_data.email)
    ).first()

    if existing_admin:
        raise HTTPException(status_code=400, detail="Администратор с таким именем или email уже существует")

    new_admin = Administrator(
        **admin_data.dict(exclude={'password'}),
        hashed_password=get_password_hash(admin_data.password)
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin


@router.get("/", response_model=List[AdministratorResponse])
def get_administrators(
        current_admin: Administrator = Depends(require_admin),
        db: Session = Depends(get_db)
):
    return db.query(Administrator).all()