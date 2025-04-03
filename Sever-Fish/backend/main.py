from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from routers import auth, products, cart, orders
import secrets

app = FastAPI()

# Настройки CORS максимально широкие
#CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.157:5173",
    "http://192.168.0.157:8000",
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:8080"
    # Добавьте здесь ваши production домены, когда перейдете в production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Важно для передачи куки
    allow_methods=["*"],     # Разрешаем все методы
    allow_headers=["*"],     # Разрешаем все заголовки
    expose_headers=["Content-Type", "Authorization"],
    max_age=86400,           # Кэширование preflight запросов на 24 часа
)



# Добавляем SessionMiddleware 
app.add_middleware(
    SessionMiddleware, 
    secret_key=secrets.token_hex(32),  # Генерируем криптографически стойкий секретный ключ
    session_cookie_name="sever_ryba_session"
)

# Подключаем маршруты API
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "Welcome to the API"}