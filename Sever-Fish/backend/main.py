from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настройки CORS
origins = [
    "http://localhost:5173",  # URL фронтенда
    "http://127.0.0.1:5173",  # Альтернативный URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Пример данных корзины
cart_data = [
    {"id": 1, "name": "Fish Item 1", "quantity": 2},
    {"id": 2, "name": "Fish Item 2", "quantity": 1},
]

@app.get("/")
def read_root():
    return {"message": "Sever-Fish Backend is running"}

@app.get("/cart/")
def get_cart():
    return {"cart_items": cart_data}

@app.post("/cart/")
def add_to_cart(item: dict):
    if "id" not in item or "name" not in item or "quantity" not in item:
        raise HTTPException(status_code=400, detail="Invalid item format")
    cart_data.append(item)
    return {"message": "Item added to cart", "cart": cart_data}