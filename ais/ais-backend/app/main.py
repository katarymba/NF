from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, products, categories, orders, payments, shipments
from app.routers import integration

app = FastAPI(
    title="AIS Backend API",
    description="Автоматизированная информационная система предприятия",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
]

# ais/ais-backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Добавьте API Gateway
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✅ CORS middleware подключен!")

# роутеры
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(shipments.router, prefix="/shipments", tags=["Shipments"])
app.include_router(integration.router, prefix="/api/integration", tags=["Integration"])

@app.get("/")
def read_root():
    return {"message": "AIS Backend API is running."}