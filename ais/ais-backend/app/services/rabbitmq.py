# ais/ais-backend/app/services/rabbitmq.py
import json
import os
import pika
from typing import Any, Dict, Optional, Callable
import logging
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Получение настроек из переменных окружения
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")

# Наименования обменника и очередей
EXCHANGE_NAME = "ais_sever_ryba_exchange"
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"


class RabbitMQService:
    """Сервис для работы с RabbitMQ"""
    
    def __init__(self):
        """Инициализация подключения к RabbitMQ"""
        self.connection = None
        self.channel = None
        self.connected = False
        self.connect()

    def connect(self) -> None:
        """Установка соединения с RabbitMQ"""
        try:
            # Параметры подключения
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                virtual_host=RABBITMQ_VHOST,
                credentials=credentials,
                heartbeat=600
            )
            
            # Установка соединения
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Объявление обменника типа direct
            self.channel.exchange_declare(
                exchange=EXCHANGE_NAME,
                exchange_type='direct',
                durable=True
            )
            
            # Объявление очередей
            self.channel.queue_declare(queue=AIS_TO_SEVER_RYBA_QUEUE, durable=True)
            self.channel.queue_declare(queue=SEVER_RYBA_TO_AIS_QUEUE, durable=True)
            
            # Привязка очередей к обменнику с соответствующими ключами маршрутизации
            self.channel.queue_bind(
                exchange=EXCHANGE_NAME,
                queue=AIS_TO_SEVER_RYBA_QUEUE,
                routing_key='to_sever_ryba'
            )
            self.channel.queue_bind(
                exchange=EXCHANGE_NAME,
                queue=SEVER_RYBA_TO_AIS_QUEUE,
                routing_key='to_ais'
            )
            
            self.connected = True
            logger.info("Успешное подключение к RabbitMQ")
        except Exception as e:
            logger.error(f"Ошибка подключения к RabbitMQ: {e}")
            self.connected = False
            
    def reconnect(self) -> None:
        """Переподключение к RabbitMQ"""
        logger.info("Попытка переподключения к RabbitMQ...")
        if self.connection and not self.connection.is_closed:
            try:
                self.connection.close()
            except Exception:
                pass
        self.connect()
            
    def send_message(self, routing_key: str, message: Dict[str, Any], correlation_id: Optional[str] = None) -> bool:
        """
        Отправка сообщения в RabbitMQ
        
        Args:
            routing_key: Ключ маршрутизации ('to_sever_ryba' или 'to_ais')
            message: Словарь с данными для отправки
            correlation_id: Опциональный ID корреляции для связи запроса и ответа
            
        Returns:
            bool: Успешность отправки сообщения
        """
        if not self.connected:
            self.reconnect()
            if not self.connected:
                logger.error("Невозможно отправить сообщение - нет соединения с RabbitMQ")
                return False
                
        try:
            properties = pika.BasicProperties(
                delivery_mode=2,  # сообщение будет сохранено на диске
                content_type='application/json',
                correlation_id=correlation_id
            )
            
            self.channel.basic_publish(
                exchange=EXCHANGE_NAME,
                routing_key=routing_key,
                body=json.dumps(message, ensure_ascii=False).encode('utf-8'),
                properties=properties
            )
            logger.info(f"Сообщение успешно отправлено с ключом маршрутизации {routing_key}")
            return True
        except Exception as e:
            logger.error(f"Ошибка при отправке сообщения: {e}")
            self.connected = False
            return False
    
    def consume_messages(self, queue_name: str, callback: Callable) -> None:
        """
        Установка обработчика для получения сообщений из очереди
        
        Args:
            queue_name: Имя очереди для прослушивания
            callback: Функция обработчик, принимающая сообщение
        """
        if not self.connected:
            self.reconnect()
            if not self.connected:
                logger.error("Невозможно установить обработчик - нет соединения с RabbitMQ")
                return
                
        try:
            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=False  # ручное подтверждение обработки
            )
            logger.info(f"Начинаем прослушивание очереди {queue_name}")
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f"Ошибка при установке обработчика сообщений: {e}")
            self.connected = False
    
    def stop_consuming(self) -> None:
        """Остановка прослушивания очереди"""
        if self.channel and self.channel.is_open:
            try:
                self.channel.stop_consuming()
                logger.info("Прослушивание очереди остановлено")
            except Exception as e:
                logger.error(f"Ошибка при остановке прослушивания: {e}")
    
    def close(self) -> None:
        """Закрытие соединения с RabbitMQ"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("Соединение с RabbitMQ закрыто")
        except Exception as e:
            logger.error(f"Ошибка при закрытии соединения: {e}")


# Одиночный экземпляр сервиса RabbitMQ
rabbitmq_service = RabbitMQService()


def send_to_sever_ryba(message: Dict[str, Any], correlation_id: Optional[str] = None) -> bool:
    """
    Отправка сообщения из АИС в систему Север-Рыба
    
    Args:
        message: Словарь с данными для отправки
        correlation_id: Опциональный ID корреляции
        
    Returns:
        bool: Успешность отправки сообщения
    """
    return rabbitmq_service.send_message('to_sever_ryba', message, correlation_id)


def send_to_ais(message: Dict[str, Any], correlation_id: Optional[str] = None) -> bool:
    """
    Отправка сообщения из системы Север-Рыба в АИС
    
    Args:
        message: Словарь с данными для отправки
        correlation_id: Опциональный ID корреляции
        
    Returns:
        bool: Успешность отправки сообщения
    """
    return rabbitmq_service.send_message('to_ais', message, correlation_id)