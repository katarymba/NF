from fastapi import FastAPI, Request, HTTPException, Response, Depends
import httpx
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_gateway.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_gateway")

# Загрузка переменных окружения из .env файла
load_dotenv()

app = FastAPI(
    title="API Gateway",
    description="API Gateway для интеграции Север-Рыба и АИС",
    version="1.0.0",
)

# URL бэкендов
SEVER_RYBA_API = os.getenv("SEVER_RYBA_API", "http://localhost:8000")
AIS_API = os.getenv("AIS_API", "http://localhost:8001")

# Настройка CORS
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


# Простой кэш для часто запрашиваемых данных
cache = {}
cache_ttl = {}  # время жизни кэша


# Модель для запросов аутентификации
class TokenRequest(BaseModel):
    username: str
    password: str


# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Генерируем уникальный ID запроса
    request_id = f"{int(time.time() * 1000)}-{os.urandom(4).hex()}"

    # Логируем информацию о запросе
    logger.info(f"Request {request_id}: {request.method} {request.url.path}")

    # Обрабатываем запрос
    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # Логируем информацию о результате запроса
        logger.info(f"Request {request_id} completed: Status {response.status_code}, Time {process_time:.3f}s")

        # Добавляем заголовки с информацией о производительности
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id

        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request {request_id} failed: {str(e)}, Time {process_time:.3f}s")
        return JSONResponse(
            status_code=500,
            content={"detail": "Внутренняя ошибка сервера"}
        )


# Функция очистки просроченного кэша
async def clean_expired_cache():
    current_time = time.time()
    expired_keys = [k for k, v in cache_ttl.items() if v < current_time]
    for key in expired_keys:
        cache.pop(key, None)
        cache_ttl.pop(key, None)
    logger.info(f"Очищено {len(expired_keys)} просроченных записей кэша.")


# Корневой маршрут
@app.get("/")
async def root():
    return {
        "message": "API Gateway для Север-Рыба и АИС",
        "version": "1.0.0",
        "endpoints": {
            "Север-Рыба API": f"/sever-ryba/...",
            "АИС API": f"/ais/...",
            "Интеграционные API": f"/api/integration/..."
        }
    }


# Маршрут для мониторинга состояния сервисов
@app.get("/health")
async def health_check():
    services_status = {}

    # Проверяем доступность Север-Рыба API
    try:
        async with httpx.AsyncClient() as client:
            start_time = time.time()
            response = await client.get(f"{SEVER_RYBA_API}/", timeout=3.0)
            response_time = time.time() - start_time

            services_status["sever_ryba"] = {
                "status": "up" if response.status_code == 200 else "degraded",
                "response_time": f"{response_time:.3f}s",
                "status_code": response.status_code
            }
    except Exception as e:
        services_status["sever_ryba"] = {
            "status": "down",
            "error": str(e)
        }

    # Проверяем доступность АИС API
    try:
        async with httpx.AsyncClient() as client:
            start_time = time.time()
            response = await client.get(f"{AIS_API}/", timeout=3.0)
            response_time = time.time() - start_time

            services_status["ais"] = {
                "status": "up" if response.status_code == 200 else "degraded",
                "response_time": f"{response_time:.3f}s",
                "status_code": response.status_code
            }
    except Exception as e:
        services_status["ais"] = {
            "status": "down",
            "error": str(e)
        }

    # Определяем общий статус API Gateway
    overall_status = "up"
    if all(s["status"] == "down" for s in services_status.values()):
        overall_status = "down"
    elif any(s["status"] == "down" for s in services_status.values()):
        overall_status = "degraded"

    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "services": services_status
    }


# Специальные маршруты для интеграции систем
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
            tracking_response = await client.get(f"{AIS_API}/api/shipments/tracking/{order_id}")

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
        logger.error(f"Ошибка при получении статуса заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка интеграции: {str(e)}")


# Маршрут для получения аналитики по продажам (интеграция данных из обеих систем)
@app.get("/api/integration/sales-analytics")
async def get_sales_analytics(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        use_cache: bool = True
):
    """Получение интегрированной аналитики продаж"""

    # Формируем ключ для кэша
    cache_key = f"sales_analytics_{start_date}_{end_date}"

    # Проверяем кэш, если использование кэша разрешено
    if use_cache and cache_key in cache and cache_key in cache_ttl and cache_ttl[cache_key] > time.time():
        logger.info(f"Использование кэшированных данных для {cache_key}")
        return cache[cache_key]

    try:
        # Очищаем просроченный кэш
        await clean_expired_cache()

        # Получаем данные о заказах из Север-Рыба
        async with httpx.AsyncClient() as client:
            params = {}
            if start_date:
                params["start_date"] = start_date
            if end_date:
                params["end_date"] = end_date

            # Получаем заказы
            orders_response = await client.get(
                f"{SEVER_RYBA_API}/orders/",
                params=params
            )

            if orders_response.status_code != 200:
                raise HTTPException(status_code=orders_response.status_code,
                                    detail="Ошибка получения данных о заказах")

            orders_data = orders_response.json()

            # Получаем аналитику из АИС
            analytics_response = await client.get(
                f"{AIS_API}/api/analytics/sales",
                params=params
            )

            if analytics_response.status_code != 200:
                # Если АИС недоступен, формируем аналитику только на основе данных Север-Рыба
                analytics_data = {"detail": "Аналитика из АИС недоступна"}
            else:
                analytics_data = analytics_response.json()

            # Объединяем данные
            result = {
                "total_orders": len(orders_data),
                "total_revenue": sum(order["total_price"] for order in orders_data),
                "orders_by_status": {},
                "ais_analytics": analytics_data,
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                }
            }

            # Подсчитываем количество заказов по статусам
            for order in orders_data:
                status = order.get("status", "unknown")
                if status not in result["orders_by_status"]:
                    result["orders_by_status"][status] = 0
                result["orders_by_status"][status] += 1

            # Кэшируем результат на 15 минут
            if use_cache:
                cache[cache_key] = result
                cache_ttl[cache_key] = time.time() + 15 * 60  # 15 минут

            return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении аналитики продаж: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка интеграции: {str(e)}")


# Маршрут для сквозной аутентификации (для AIS)
@app.post("/api/integration/auth")
async def integrated_auth(token_request: TokenRequest):
    """Единая точка входа для аутентификации"""
    try:
        # Пытаемся аутентифицироваться через АИС
        async with httpx.AsyncClient() as client:
            ais_response = await client.post(
                f"{AIS_API}/auth/token",
                data={"username": token_request.username, "password": token_request.password},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

            # Если аутентификация в АИС успешна, возвращаем токен
            if ais_response.status_code == 200:
                token_data = ais_response.json()
                return {
                    "access_token": token_data["access_token"],
                    "token_type": token_data["token_type"],
                    "system": "ais"
                }

            # Если нет, пробуем аутентифицироваться через Север-Рыба
            sever_ryba_response = await client.post(
                f"{SEVER_RYBA_API}/auth/login",
                json={"phone": token_request.username, "password": token_request.password}
            )

            if sever_ryba_response.status_code == 200:
                token_data = sever_ryba_response.json()
                return {
                    "access_token": token_data["access_token"],
                    "token_type": token_data["token_type"],
                    "system": "sever_ryba"
                }

            # Если ни одна аутентификация не удалась, возвращаем ошибку
            raise HTTPException(status_code=401, detail="Неверные учетные данные")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при аутентификации: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка аутентификации: {str(e)}")


# Маршрут для обновления товаров в Север-Рыба из АИС
@app.post("/api/integration/sync/products")
async def sync_products():
    """Синхронизация товаров между АИС и Север-Рыба"""
    try:
        # Получаем товары из АИС
        async with httpx.AsyncClient() as client:
            ais_products_response = await client.get(f"{AIS_API}/api/products")

            if ais_products_response.status_code != 200:
                raise HTTPException(
                    status_code=ais_products_response.status_code,
                    detail="Ошибка получения товаров из АИС"
                )

            ais_products = ais_products_response.json()

            # Получаем существующие товары из Север-Рыба
            sever_ryba_products_response = await client.get(f"{SEVER_RYBA_API}/products/")

            if sever_ryba_products_response.status_code != 200:
                raise HTTPException(
                    status_code=sever_ryba_products_response.status_code,
                    detail="Ошибка получения товаров из Север-Рыба"
                )

            sever_ryba_products = sever_ryba_products_response.json()

            # Маппинг по ID товара для быстрого поиска
            sever_ryba_products_map = {product["id"]: product for product in sever_ryba_products}

            # Счетчики для статистики
            stats = {
                "updated": 0,
                "created": 0,
                "errors": 0
            }

            # Синхронизируем каждый товар из АИС
            for ais_product in ais_products:
                try:
                    # Проверяем, существует ли товар в Север-Рыба
                    if ais_product["id"] in sever_ryba_products_map:
                        # Обновляем существующий товар
                        update_response = await client.put(
                            f"{SEVER_RYBA_API}/products/{ais_product['id']}",
                            json={
                                "name": ais_product["name"],
                                "price": ais_product["price"],
                                "description": ais_product.get("description", ""),
                                "category_id": ais_product["category_id"],
                                "stock_quantity": ais_product.get("stock_quantity", 0)
                            }
                        )

                        if update_response.status_code == 200:
                            stats["updated"] += 1
                        else:
                            stats["errors"] += 1
                    else:
                        # Создаем новый товар
                        create_response = await client.post(
                            f"{SEVER_RYBA_API}/products/",
                            json={
                                "name": ais_product["name"],
                                "price": ais_product["price"],
                                "description": ais_product.get("description", ""),
                                "category_id": ais_product["category_id"],
                                "stock_quantity": ais_product.get("stock_quantity", 0)
                            }
                        )

                        if create_response.status_code == 200:
                            stats["created"] += 1
                        else:
                            stats["errors"] += 1
                except Exception as e:
                    logger.error(f"Ошибка при синхронизации товара {ais_product.get('id')}: {str(e)}")
                    stats["errors"] += 1

            return {
                "status": "success",
                "message": "Синхронизация товаров выполнена",
                "statistics": stats
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при синхронизации товаров: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка синхронизации: {str(e)}")


# Маршруты для проксирования запросов к АИС
@app.api_route("/ais/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_proxy(path: str, request: Request):
    """Проксирование запросов к AIS API"""
    return await proxy_request(f"{AIS_API}/{path}", request)


# Маршруты для проксирования запросов к Север-Рыба
@app.api_route("/sever-ryba/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def sever_ryba_proxy(path: str, request: Request):
    """Проксирование запросов к Север-Рыба API"""
    return await proxy_request(f"{SEVER_RYBA_API}/{path}", request)


@app.api_route("/ais/administrators/token", methods=["POST"])
async def ais_admin_token_proxy(request: Request):
    try:
        # Получаем данные из тела запроса
        form_data = await request.form()

        # Логируем входящие данные
        logger.info(f"Входящие данные для токена: {dict(form_data)}")

        # Выполняем запрос к AIS Backend
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AIS_API}/administrators/token",
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )

        # Логируем ответ
        response_content = await response.text()
        logger.info(f"Ответ от AIS Backend: {response_content}")
        logger.info(f"Статус ответа: {response.status_code}")

        return Response(
            content=response_content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except Exception as e:
        logger.error(f"Ошибка проксирования токена: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Общая функция для проксирования запросов
# Обновим proxy_request функцию в api-gateway/main.py для лучшей обработки ошибок

async def proxy_request(target_url: str, request: Request):
    """Проксирует запрос к указанному URL и возвращает ответ"""
    start_time = time.time()
    logger.info(f"Проксирование запроса: {request.method} {request.url.path} -> {target_url}")

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
            
            # Логируем содержимое для отладки
            content_log = content
            if len(str(content)) > 1000:
                content_log = str(content)[:1000] + "... [truncated]"
            logger.debug(f"Тело запроса: {content_log}")

        # Выполняем запрос к целевому API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method,
                    target_url,
                    params=params,
                    headers=headers,
                    content=content,
                    timeout=30.0  # Увеличенный таймаут для запросов
                )
            except httpx.ConnectError as e:
                logger.error(f"Ошибка подключения к {target_url}: {str(e)}")
                return JSONResponse(
                    status_code=503,
                    content={"detail": f"Сервис недоступен: {str(e)}"}
                )
            except httpx.ReadTimeout as e:
                logger.error(f"Таймаут при чтении от {target_url}: {str(e)}")
                return JSONResponse(
                    status_code=504,
                    content={"detail": f"Сервис не отвечает: {str(e)}"}
                )

            process_time = time.time() - start_time

            # Логируем успешный ответ
            logger.info(f"Проксирование завершено: {request.method} {request.url.path} -> {target_url} | "
                        f"Статус: {response.status_code}, Время: {process_time:.3f}s")
            
            # Логируем содержимое для отладки
            if response.status_code >= 400:
                try:
                    response_log = response.text
                    if len(response_log) > 1000:
                        response_log = response_log[:1000] + "... [truncated]"
                    logger.debug(f"Тело ответа (ошибка): {response_log}")
                except Exception as e:
                    logger.error(f"Не удалось прочитать тело ответа: {str(e)}")

            # Создаем ответ с тем же статус-кодом и содержимым
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )

    except httpx.TimeoutException:
        process_time = time.time() - start_time
        logger.error(f"Таймаут при проксировании: {request.method} {request.url.path} -> {target_url} | "
                     f"Время: {process_time:.3f}s")
        return JSONResponse(
            status_code=504,
            content={"detail": "Время ожидания ответа от сервиса истекло"}
        )

    except httpx.RequestError as e:
        process_time = time.time() - start_time
        logger.error(f"Ошибка при проксировании: {request.method} {request.url.path} -> {target_url} | "
                     f"Ошибка: {str(e)}, Время: {process_time:.3f}s")
        return JSONResponse(
            status_code=502,
            content={"detail": f"Ошибка при обращении к сервису: {str(e)}"}
        )

    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Внутренняя ошибка при проксировании: {request.method} {request.url.path} -> {target_url} | "
                     f"Ошибка: {str(e)}, Время: {process_time:.3f}s")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Внутренняя ошибка сервера: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn

    # Загружаем порт из переменных окружения или используем порт по умолчанию
    port = int(os.getenv("API_GATEWAY_PORT", 8080))

    uvicorn.run(app, host="0.0.0.0", port=port)