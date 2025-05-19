import os
import logging
import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from starlette.background import BackgroundTask

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получение URL сервисов из переменных окружения
# Исправление: использование переменных AIS_URL и SEVER_FISH_URL из docker-compose.yml
AIS_API = os.getenv("AIS_URL", "http://ais-backend:8001")
SEVER_RYBA_API = os.getenv("SEVER_FISH_URL", "http://sever-fish-backend:8000")

# Логирование настроек для отладки
logger.info(f"AIS API URL: {AIS_API}")
logger.info(f"SEVER RYBA API URL: {SEVER_RYBA_API}")

app = FastAPI(
    title="NF API Gateway",
    description="API Gateway для системы NF, объединяющий АИС и Север-Рыба",
    version="1.0.0",
)

# Настройка CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://localhost:8080",
    # Добавляем Docker-контейнеры в список разрешенных источников
    "http://ais-frontend:5174",
    "http://sever-fish-frontend:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Функция для проверки работоспособности сервисов
async def check_services():
    services_status = {}
    
    # Проверка АИС
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AIS_API}/health", timeout=5.0)
            services_status["ais"] = {
                "status": "online" if response.status_code == 200 else "error",
                "message": response.json() if response.status_code == 200 else str(response.status_code)
            }
    except Exception as e:
        services_status["ais"] = {"status": "offline", "message": str(e)}
        logger.error(f"Ошибка при проверке AIS: {e}")
    
    # Проверка Север-Рыба
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SEVER_RYBA_API}/health", timeout=5.0)
            services_status["sever_ryba"] = {
                "status": "online" if response.status_code == 200 else "error",
                "message": response.json() if response.status_code == 200 else str(response.status_code)
            }
    except Exception as e:
        services_status["sever_ryba"] = {"status": "offline", "message": str(e)}
        logger.error(f"Ошибка при проверке Север-Рыба: {e}")
    
    return services_status


@app.get("/")
async def read_root():
    return {"message": "NF API Gateway is running"}


@app.get("/health")
async def health_check():
    services_status = await check_services()
    return {
        "gateway": "online",
        "services": services_status
    }


# Проксирование запросов в АИС
@app.api_route("/ais/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_proxy(request: Request, path: str):
    target_url = f"{AIS_API}/{path}"
    logger.info(f"Проксирование запроса в АИС: {request.method} {target_url}")
    return await proxy_request(target_url, request)


# Проксирование запросов в Север-Рыба
@app.api_route("/sever-ryba/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def sever_ryba_proxy(request: Request, path: str):
    target_url = f"{SEVER_RYBA_API}/{path}"
    logger.info(f"Проксирование запроса в Север-Рыба: {request.method} {target_url}")
    return await proxy_request(target_url, request)


# Универсальная функция проксирования запросов
async def proxy_request(target_url: str, request: Request):
    client = httpx.AsyncClient(timeout=30.0)  # Увеличиваем таймаут
    
    # Получение метода, заголовков и тела запроса
    method = request.method
    headers = dict(request.headers)
    headers.pop("host", None)  # Убираем заголовок host, чтобы не было конфликта
    
    # Получение тела запроса при необходимости
    content = await request.body()
    
    try:
        logger.info(f"Отправка запроса: {method} {target_url}")
        # Отправка запроса к целевому сервису
        response = await client.request(
            method=method,
            url=target_url,
            headers=headers,
            content=content,
            params=request.query_params,
            cookies=request.cookies,
            follow_redirects=True
        )
        
        logger.info(f"Ответ получен: {response.status_code}")
        # Закрываем клиент после завершения запроса
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            background=BackgroundTask(client.aclose)
        )
    except httpx.RequestError as exc:
        logger.error(f"Ошибка при запросе к {target_url}: {exc}")
        return Response(
            content=f"Ошибка при запросе к сервису: {exc}".encode(),
            status_code=503,
            background=BackgroundTask(client.aclose)
        )