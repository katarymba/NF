from fastapi import APIRouter, Depends, HTTPException, Request, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserProfile, PasswordChangeRequest, UserUpdate, Token, ApiResponse
from app.utils.auth import (
    get_password_hash, verify_password, create_access_token,
    require_auth, require_admin, get_current_user
)
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserProfile)
async def register_user(
        user_data: UserCreate,
        db: Session = Depends(get_db)
):
    """
    Регистрирует нового пользователя.
    """
    # Проверяем, существует ли пользователь с таким email или username
    db_user = db.query(User).filter(
        (User.email == user_data.email) | (User.name == user_data.name)
    ).first()

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email или имя пользователя уже зарегистрированы"
        )

    # Создаем хеш пароля
    hashed_password = get_password_hash(user_data.password)

    # Создаем нового пользователя
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=hashed_password,
        created_at=datetime.utcnow(),
        is_active=True,
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
        email: str = Body(...),
        password: str = Body(...),
        db: Session = Depends(get_db)
):
    """
    Получает токен доступа (логин).
    """
    # Ищем пользователя по email
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверяем, что аккаунт активен
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт неактивен"
        )

    # Создаем токен доступа
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
async def read_users_me(
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Получает профиль текущего пользователя.
    """
    user = await require_auth(request, db)
    return user


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
        user_update: UserUpdate,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Обновляет профиль текущего пользователя.
    """
    user = await require_auth(request, db)

    # Обновляем поля пользователя
    if user_update.full_name is not None:
        user.full_name = user_update.full_name

    if user_update.email is not None:
        # Проверяем, не занят ли email другим пользователем
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != user.id
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Этот email уже занят другим пользователем"
            )

        user.email = user_update.email

    if user_update.phone is not None:
        user.phone = user_update.phone

    if user_update.birthday is not None:
        user.birthday = user_update.birthday

    # Сохраняем изменения
    db.commit()
    db.refresh(user)

    return user


@router.post("/change-password", response_model=ApiResponse)
async def change_password(
        password_data: PasswordChangeRequest,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Изменяет пароль текущего пользователя.
    """
    user = await require_auth(request, db)

    # Проверяем текущий пароль
    if not verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )

    # Хешируем и сохраняем новый пароль
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"success": True, "message": "Пароль успешно изменен"}


@router.get("/", response_model=List[UserProfile])
async def list_users(
        request: Request,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Получает список всех пользователей (только для администратора).
    """
    # Проверяем права администратора
    await require_admin(request, db)

    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserProfile)
async def get_user(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Получает профиль пользователя по ID (только для администратора или самого пользователя).
    """
    # Получаем текущего пользователя
    current_user = await require_auth(request, db)

    # Проверяем права доступа
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому профилю"
        )

    # Получаем пользователя по ID
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return user


@router.put("/{user_id}/activate", response_model=ApiResponse)
async def activate_user(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Активирует аккаунт пользователя (только для администратора).
    """
    # Проверяем права администратора
    await require_admin(request, db)

    # Получаем пользователя по ID
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Активируем аккаунт
    user.is_active = True
    db.commit()

    return {"success": True, "message": "Аккаунт пользователя активирован"}


@router.put("/{user_id}/deactivate", response_model=ApiResponse)
async def deactivate_user(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Деактивирует аккаунт пользователя (только для администратора).
    """
    # Проверяем права администратора
    await require_admin(request, db)

    # Получаем пользователя по ID
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Деактивируем аккаунт
    user.is_active = False
    db.commit()

    return {"success": True, "message": "Аккаунт пользователя деактивирован"}