from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.enums import UserRole

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

    @field_validator('password')
    def password_complexity(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        if not any(char.isupper() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        return v


class UserInDB(UserBase):
    id: int
    role: UserRole
    password_hash: str = Field(...)
    created_at: datetime
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True, frozen=True)


class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True, frozen=True)