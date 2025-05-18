# ais/ais-backend/app/services/log_setup.py
import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging(log_dir='logs', log_level=logging.INFO):
    """
    Настройка логирования с поддержкой файлов логов
    
    Args:
        log_dir: Директория для логов
        log_level: Уровень логирования
    """
    # Создание директории для логов, если она не существует
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
        
    # Настройка корневого логгера
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Форматтер для сообщений
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Обработчик для консоли
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Обработчик для файла логов
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'ais.log'),
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    
    # Отдельный логгер для интеграции
    integration_logger = logging.getLogger('integration')
    integration_file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'integration.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )
    integration_file_handler.setFormatter(formatter)
    integration_logger.addHandler(integration_file_handler)
    
    logging.info("Логирование настроено")
