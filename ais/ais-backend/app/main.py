from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, products, categories, orders, payments, shipments
from app.routers import integration
from app.routers import administrators

app = FastAPI(
    title="AIS Backend API",
    description="Автоматизированная информационная система предприятия",
    version="1.0.0"
)

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
)
print("✅ CORS middleware подключен!")

# роутеры
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(auth.router, prefix="/administrators", tags=["Administrators"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(shipments.router, prefix="/shipments", tags=["Shipments"])
app.include_router(integration.router, prefix="/api/integration", tags=["Integration"])

@app.get("/")
def read_root():
    return {"message": "AIS Backend API is running."}