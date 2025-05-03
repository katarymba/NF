from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from .models import Administrator, User
from .database import get_db

# Настройки JWT
SECRET_KEY = "ваш_секретный_ключ_лучше_брать_из_переменных_окружения"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

# Генерация JWT-токена
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Проверка токена и получение текущего пользователя
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        
        if username is None or role is None:
            raise credentials_exception
        
        token_data = TokenData(username=username, role=role, user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    # Проверяем, является ли пользователь администратором или обычным пользователем
    if token_data.role == "admin":
        admin = db.query(Administrator).filter(Administrator.username == token_data.username).first()
        if admin is None:
            raise credentials_exception
        return admin
    else:
        user = db.query(User).filter(User.username == token_data.username).first()
        if user is None:
            raise credentials_exception
        return user

# Проверка прав доступа для администратора
async def get_current_admin(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав доступа",
        )
    return current_user

# Верификация пароля
def verify_password(plain_password, hashed_password):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)

# Хеширование пароля
def get_password_hash(password):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)