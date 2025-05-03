# ais/ais-backend/app/services/logging_service.py
import logging
import os
import sys
from logging.handlers import RotatingFileHandler

# Настройка директории для логов
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Настройка базового логгера
logger = logging.getLogger('ais')
logger.setLevel(logging.INFO)
logger.propagate = False  # Предотвращаем распространение логов в корневой логгер

# Проверка, чтобы избежать дублирования обработчиков
if not logger.handlers:
    # Создание форматтера для логов
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Обработчик для консоли
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Обработчик для файла
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'ais.log'),
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    logger.info("Система логирования инициализирована")