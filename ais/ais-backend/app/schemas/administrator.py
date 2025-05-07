from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class AdministratorBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="admin")
    is_active: bool = Field(default=True)
    permissions: Optional[str] = None
    position: Optional[str] = None
    phone: str = Field(..., min_length=5, max_length=20)


class AdministratorCreate(AdministratorBase):
    password: str = Field(..., min_length=8)


class AdministratorLogin(BaseModel):
    email: str
    password: str


class AdministratorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None


class AdministratorResponse(AdministratorBase):
    id: int
    is_active: bool
    created_at: datetime
    token: str

    model_config = ConfigDict(from_attributes=True)