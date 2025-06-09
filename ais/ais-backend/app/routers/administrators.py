import os
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Administrator
from app.schemas import AdministratorCreate, AdministratorResponse, AdministratorUpdate, AdministratorLogin
from app.routers.auth import get_password_hash, verify_password, create_access_token, require_admin
from dotenv import load_dotenv

load_dotenv()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

router = APIRouter(prefix="", tags=["Administrators"])


@router.post("/login", response_model=AdministratorResponse)
def login_admin(admin_data: AdministratorLogin, db: Session = Depends(get_db)):
    admin = db.query(Administrator).filter(Administrator.email == admin_data.email).first()
    if not admin or not verify_password(admin_data.password, admin.password_hash):
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


@router.post("/token", response_model=dict)
def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    print(f"Попытка входа пользователя: {form_data.username}")
    admin = db.query(Administrator).filter(Administrator.username == form_data.username).first()

    if not admin:
        print(f"Администратор с именем {form_data.username} не найден")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учётные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"Найден администратор: {admin.username}, проверка пароля...")
    password_valid = verify_password(form_data.password, admin.password_hash)
    print(f"Результат проверки пароля: {password_valid}")

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учётные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "role": "admin"},
        expires_delta=access_token_expires,
    )
    print(f"Вход выполнен успешно, токен создан")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=AdministratorResponse)
def register_admin(admin: AdministratorCreate, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    db_admin = db.query(Administrator).filter(Administrator.email == admin.email).first()
    if db_admin:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Создаем нового админа с правильным полем для хешированного пароля
    hashed_password = get_password_hash(admin.password)
    db_admin = Administrator(
        username=admin.username,
        email=admin.email,
        password_hash=hashed_password,  # Используем правильное имя поля
        full_name=admin.full_name,
        role=admin.role,
        is_active=admin.is_active,
        permissions=admin.permissions,
        position=admin.position,
        phone=admin.phone
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    # Генерируем токен
    token = create_access_token(data={"sub": db_admin.username, "role": "admin"})

    return AdministratorResponse(
        id=db_admin.id,
        username=db_admin.username,
        email=db_admin.email,
        full_name=db_admin.full_name,
        role=db_admin.role,
        token=token,
        is_active=db_admin.is_active,
        created_at=db_admin.created_at,
        permissions=db_admin.permissions,
        position=db_admin.position,
        phone=db_admin.phone
    )


@router.post("/create", response_model=AdministratorResponse)
def create_administrator_public(
    admin_data: AdministratorCreate,
    db: Session = Depends(get_db)
):
    existing_admin = db.query(Administrator).filter(
        (Administrator.username == admin_data.username) |
        (Administrator.email == admin_data.email)
    ).first()

    if existing_admin:
        raise HTTPException(status_code=400, detail="Администратор с таким именем или email уже существует")

    hashed_password = get_password_hash(admin_data.password)
    new_admin = Administrator(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hashed_password,  # Используем правильное имя поля
        full_name=admin_data.full_name,
        role=admin_data.role if admin_data.role else "admin",
        is_active=admin_data.is_active if admin_data.is_active is not None else True,
        permissions=admin_data.permissions,
        position=admin_data.position,
        phone=admin_data.phone
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # Генерируем токен
    token = create_access_token(data={"sub": new_admin.username, "role": "admin"})

    return AdministratorResponse(
        id=new_admin.id,
        username=new_admin.username,
        email=new_admin.email,
        token=token,
        is_active=new_admin.is_active,
        created_at=new_admin.created_at,
        full_name=new_admin.full_name,
        role=new_admin.role,
        permissions=new_admin.permissions,
        position=new_admin.position,
        phone=new_admin.phone
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

    hashed_password = get_password_hash(admin_data.password)
    new_admin = Administrator(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hashed_password,
        full_name=admin_data.full_name,
        role=admin_data.role if admin_data.role else "admin",
        is_active=admin_data.is_active if admin_data.is_active is not None else True,
        permissions=admin_data.permissions,
        position=admin_data.position,
        phone=admin_data.phone
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
