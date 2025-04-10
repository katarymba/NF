import os
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, products, categories, orders, payments, shipments
from app.routers import integration
from app.routers import administrators
import httpx
from dotenv import load_dotenv

load_dotenv()

AIS_API = os.getenv("AIS_API", "http://localhost:8001")

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
app.include_router(administrators.router, prefix="/administrators", tags=["Administrators"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(shipments.router, prefix="/shipments", tags=["Shipments"])
app.include_router(integration.router, prefix="/api/integration", tags=["Integration"])

@app.get("/")
def read_root():
    return {"message": "AIS Backend API is running."}

@app.api_route("/ais/administrators/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_admin_proxy(path: str, request: Request):
    """Проксирование запросов к AIS Administrators API"""
    return await proxy_request(f"{AIS_API}/administrators/{path}", request)


async def proxy_request(target_url: str, request: Request):
    """Проксирует запрос к указанному URL и возвращает ответ"""
    try:
        # Получаем метод запроса
        method = request.method

        # Получаем параметры запроса
        params = dict(request.query_params)

        # Получаем заголовки (исключая специальные заголовки хоста)
        headers = {k: v for k, v in request.headers.items()
                   if k.lower() not in ["host", "content-length"]}

        # Получаем тело запроса для методов POST, PUT, PATCH
        content = None
        if method in ["POST", "PUT", "PATCH"]:
            content = await request.body()

        # Выполняем запрос к целевому API
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method,
                target_url,
                params=params,
                headers=headers,
                content=content,
                timeout=30.0  # Увеличенный таймаут для запросов
            )

            # Создаем ответ с тем же статус-кодом и содержимым
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Ошибка при обращении к сервису: {str(e)}")