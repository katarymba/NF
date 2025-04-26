from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import products, users, cart, orders

# Создаем таблицы в базе данных (если их нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Север Рыба API",
    description="API для интернет-магазина рыбы и морепродуктов",
    version="1.0.0"
)

# Настраиваем CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(products.router)
app.include_router(users.router)
app.include_router(cart.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API магазина Север Рыба!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)