import os
from dotenv import load_dotenv

load_dotenv()  # Загружаем переменные окружения из .env

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
