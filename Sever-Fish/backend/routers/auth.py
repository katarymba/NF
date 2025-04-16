from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from database import get_db
from models import User
from typing import Optional
from schemas import UserBirthdayUpdate, UserProfileUpdate
from dotenv import load_dotenv
import os

SECRET_KEY = os.getenv("SECRET_KEY")

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Настройка JWT
SECRET_KEY = SECRET_KEY  # В реальном приложении используйте безопасный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Функция создания JWT-токена
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Функция получения текущего пользователя
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Учетные данные недействительны",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Класс для данных входа
class LoginData:
    def __init__(self, phone: str, password: str):
        self.phone = phone
        self.password = password

# Класс для данных регистрации
class UserRegister:
    def __init__(self, username: str, password: str, password_confirm: str, 
                 email: str, phone: str, full_name: str, birthday: Optional[date] = None):
        self.username = username
        self.password = password
        self.password_confirm = password_confirm
        self.email = email
        self.phone = phone
        self.full_name = full_name
        self.birthday = birthday

# Регистрация пользователя
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: dict, db: Session = Depends(get_db)):
    # Преобразуем дату рождения из строки в объект date, если она есть
    birthday = None
    if user_data.get("birthday"):
        try:
            birthday = datetime.strptime(user_data.get("birthday"), "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты рождения. Используйте формат YYYY-MM-DD")
    
    # Создаем объект из данных
    user = UserRegister(
        username=user_data.get("username"),
        password=user_data.get("password"),
        password_confirm=user_data.get("password_confirm"),
        email=user_data.get("email"),
        phone=user_data.get("phone"),
        full_name=user_data.get("full_name"),
        birthday=birthday
    )
    
    # Проверка совпадения паролей
    if user.password != user.password_confirm:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")
    
    # Проверка, существует ли пользователь с таким именем
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
    
    # Проверка, существует ли пользователь с таким email
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    # Проверка, существует ли пользователь с таким телефоном
    existing_phone = db.query(User).filter(User.phone == user.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Пользователь с таким номером телефона уже существует")
    
    # Хеширование пароля
    hashed_password = pwd_context.hash(user.password)
    
    # Создание нового пользователя
    new_user = User(
        username=user.username,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        password_hash=hashed_password,
        birthday=user.birthday
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Пользователь успешно зарегистрирован"}

# Вход пользователя
@router.post("/login")
async def login(login_data: dict, db: Session = Depends(get_db)):
    # Создаем объект из данных
    user_login = LoginData(
        phone=login_data.get("phone"),
        password=login_data.get("password")
    )
    
    # Поиск пользователя по номеру телефона
    user = db.query(User).filter(User.phone == user_login.phone).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный номер телефона или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Проверка пароля
    is_password_correct = pwd_context.verify(user_login.password, user.password_hash)
    if not is_password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный номер телефона или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создание токена доступа
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Получение профиля пользователя
@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "phone": current_user.phone,
        "full_name": current_user.full_name
    }
    
    # Добавляем дату рождения, если она есть
    if current_user.birthday:
        user_data["birthday"] = current_user.birthday.isoformat()
        
        # Проверяем, есть ли у пользователя скидка в день рождения
        today = datetime.now().date()
        birthday_this_year = date(today.year, current_user.birthday.month, current_user.birthday.day)
        
        # Если день рождения в текущем году уже прошел, проверяем прошлую неделю
        days_diff = (today - birthday_this_year).days
        
        if 0 <= days_diff <= 7:  # День рождения сегодня или был в течение последних 7 дней
            user_data["has_birthday_discount"] = True
        else:
            user_data["has_birthday_discount"] = False
            
        # Добавляем количество дней до следующего дня рождения
        if days_diff < 0:  # День рождения еще не наступил в этом году
            user_data["days_until_birthday"] = abs(days_diff)
        else:  # День рождения уже прошел, считаем до следующего года
            next_birthday = date(today.year + 1, current_user.birthday.month, current_user.birthday.day)
            user_data["days_until_birthday"] = (next_birthday - today).days
    
    return user_data

# Обновление профиля пользователя
@router.put("/profile")
async def update_user_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Получаем пользователя из базы данных
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Обновляем данные пользователя
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name
    
    if profile_data.email is not None:
        # Проверяем, не занят ли email другим пользователем
        existing_email = db.query(User).filter(User.email == profile_data.email, User.id != user.id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
        user.email = profile_data.email
    
    if profile_data.phone is not None:
        # Проверяем, не занят ли телефон другим пользователем
        existing_phone = db.query(User).filter(User.phone == profile_data.phone, User.id != user.id).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Пользователь с таким номером телефона уже существует")
        user.phone = profile_data.phone
    
    # Сохраняем изменения
    db.commit()
    db.refresh(user)
    
    # Возвращаем обновленные данные
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "birthday": user.birthday.isoformat() if user.birthday else None
    }

# Отдельный эндпоинт для обновления даты рождения
@router.put("/profile/birthday")
async def update_birthday(birthday_data: UserBirthdayUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Получаем пользователя из базы данных
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Обновляем дату рождения
    user.birthday = birthday_data.birthday
    
    # Сохраняем изменения
    db.commit()
    db.refresh(user)
    
    # Возвращаем обновленные данные
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "birthday": user.birthday.isoformat() if user.birthday else None
    }
    
    if user.birthday:
        # Проверяем, есть ли у пользователя скидка в день рождения
        today = datetime.now().date()
        birthday_this_year = date(today.year, user.birthday.month, user.birthday.day)
        
        # Если день рождения в текущем году уже прошел, проверяем прошлую неделю
        days_diff = (today - birthday_this_year).days
        
        if 0 <= days_diff <= 7:  # День рождения сегодня или был в течение последних 7 дней
            user_data["has_birthday_discount"] = True
        else:
            user_data["has_birthday_discount"] = False
            
        # Добавляем количество дней до следующего дня рождения
        if days_diff < 0:  # День рождения еще не наступил в этом году
            user_data["days_until_birthday"] = abs(days_diff)
        else:  # День рождения уже прошел, считаем до следующего года
            next_birthday = date(today.year + 1, user.birthday.month, user.birthday.day)
            user_data["days_until_birthday"] = (next_birthday - today).days
    
    return user_data