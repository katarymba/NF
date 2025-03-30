from fastapi import FastAPI, Request, HTTPException
import httpx
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="API Gateway для Север-Рыба и АИС")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Для продакшн нужно указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL ваших бэкендов
SEVER_RYBA_API = os.getenv("SEVER_RYBA_API", "http://localhost:8000")
AIS_API = os.getenv("AIS_API", "http://localhost:8001")

# Простой кэш для токенов, в продакшн версии стоит использовать Redis
token_cache = {}


@app.get("/")
async def root():
    return {"message": "API Gateway для Север-Рыба и АИС"}


# Специальные маршруты для интеграции
@app.get("/api/integration/order-status/{order_id}")
async def get_integrated_order_status(order_id: int):
    """Получение интегрированной информации о заказе и его отслеживании"""
    try:
        # Получаем данные о заказе из Север-Рыба
        async with httpx.AsyncClient() as client:
            order_response = await client.get(f"{SEVER_RYBA_API}/orders/{order_id}")

            if order_response.status_code != 200:
                raise HTTPException(status_code=404, detail="Заказ не найден")

            order_data = order_response.json()

            # Получаем данные о отслеживании из АИС
            tracking_response = await client.get(f"{AIS_API}/shipments/tracking/{order_id}")

            # Если данных отслеживания нет, возвращаем только данные заказа
            if tracking_response.status_code != 200:
                return {
                    "order": order_data,
                    "tracking": None,
                    "message": "Информация об отслеживании недоступна"
                }

            tracking_data = tracking_response.json()

            # Комбинируем данные
            return {
                "order": order_data,
                "tracking": tracking_data
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка интеграции: {str(e)}")


# Маршруты для проксирования запросов к АИС
@app.api_route("/ais/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def ais_proxy(path: str, request: Request):
    return await proxy_request(f"{AIS_API}/{path}", request)


# Маршруты для проксирования запросов к Север-Рыба
@app.api_route("/sever-ryba/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def sever_ryba_proxy(path: str, request: Request):
    return await proxy_request(f"{SEVER_RYBA_API}/{path}", request)


# Общая функция для проксирования запросов
async def proxy_request(target_url: str, request: Request):
    """Проксирует запрос к указанному URL и возвращает ответ"""
    try:
        # Получаем метод запроса
        method = request.method

        # Получаем параметры запроса
        params = dict(request.query_params)

        # Получаем заголовки
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

            # Возвращаем ответ от целевого API
            return response.json()

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout при обращении к сервису")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Ошибка при обращении к сервису: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)