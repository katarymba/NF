from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from routers import auth, products, cart, orders
import secrets
from dotenv import load_dotenv

app = FastAPI()

SECRET_KEY = os.getenv("SECRET_KEY")

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Настройки CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Добавьте другие нужные вам домены
]

# Упростим middleware для начала
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты API
try:
    app.include_router(auth.router)
    app.include_router(products.router)
    app.include_router(cart.router)
    app.include_router(orders.router)
except Exception as e:
    # Добавим обработку исключений для отладки
    @app.get("/error")
    def error_info():
        return {"error": str(e)}

@app.get("/")
def root():
    return {"message": "Welcome to the API"}

# Добавьте тестовый маршрут для проверки работы сервера
@app.get("/test")
def test():
    return {"status": "ok", "message": "API is working"}