from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Настройки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель данных для регистрации
class UserRegister(BaseModel):
    username: str
    email: str
    password: str = None
    password_confirm: str = None
    phone: str = None
    full_name: str = None

@app.get("/")
def root():
    return {"message": "Test server is working"}

@app.post("/auth/register")
async def register(user_data: UserRegister):
    print("Получены данные:", user_data.dict())
    return {"success": True, "message": "User registered successfully"}