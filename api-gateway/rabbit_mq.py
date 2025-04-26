import os
import json
import logging
import asyncio
import aio_pika
from datetime import datetime
from typing import Dict, Any, Optional, Callable

logger = logging.getLogger("api_gateway")

class RabbitMQClient:
    def __init__(self, url: str = "amqp://guest:guest@localhost/"):
        self.url = url
        self.connection = None
        self.channel = None
        self.callback_queue = None
        self.futures: Dict[str, asyncio.Future] = {}
        self.response_consumer_tag = None
        self.queues = {
            "sever_ryba": "sever_ryba_queue",
            "ais": "ais_queue",
            "notifications": "notifications_queue"
        }
        
    async def connect(self) -> None:
        """Установка соединения с RabbitMQ сервером"""
        try:
            self.connection = await aio_pika.connect_robust(self.url)
            self.channel = await self.connection.channel()
            
            # Объявление очередей для каждого сервиса
            for queue_name in self.queues.values():
                await self.channel.declare_queue(queue_name, durable=True)
            
            # Создание временной очереди для ответов
            self.callback_queue = await self.channel.declare_queue(
                "", exclusive=True
            )
            
            self.response_consumer_tag = await self.callback_queue.consume(
                self._on_response, no_ack=True
            )
            
            logger.info("✅ Успешное подключение к RabbitMQ")
        except Exception as e:
            logger.error(f"❌ Ошибка подключения к RabbitMQ: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Закрытие соединения с RabbitMQ"""
        if self.connection:
            await self.connection.close()
            logger.info("Соединение с RabbitMQ закрыто")
    
    async def _on_response(self, message: aio_pika.IncomingMessage) -> None:
        """Обработка ответов"""
        if message.correlation_id is None:
            logger.warning("Получено сообщение без correlation_id")
            return
            
        future = self.futures.get(message.correlation_id)
        if future:
            try:
                response_data = json.loads(message.body.decode())
                future.set_result(response_data)
            except Exception as e:
                logger.error(f"Ошибка при обработке ответа: {e}")
                future.set_exception(e)
            finally:
                self.futures.pop(message.correlation_id, None)
    
    async def send_message(self, service: str, method: str, data: Dict[str, Any], 
                          wait_for_response: bool = True) -> Optional[Dict[str, Any]]:
        """Отправка сообщения в указанную очередь сервиса"""
        if not self.connection or self.connection.is_closed:
            await self.connect()
        
        queue_name = self.queues.get(service)
        if not queue_name:
            raise ValueError(f"Неизвестный сервис: {service}")
        
        correlation_id = f"{datetime.now().timestamp()}-{os.urandom(4).hex()}"
        
        # Подготовка сообщения
        message_body = {
            "method": method,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        # Создание future для ожидания ответа
        if wait_for_response:
            future = asyncio.Future()
            self.futures[correlation_id] = future
        
        # Отправка сообщения
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(message_body).encode(),
                correlation_id=correlation_id,
                reply_to=self.callback_queue.name if wait_for_response else None,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                content_type="application/json"
            ),
            routing_key=queue_name
        )
        
        logger.info(f"📤 Отправлено сообщение в {queue_name}: метод={method}")
        
        # Ожидание ответа, если требуется
        if wait_for_response:
            try:
                # Таймаут 10 секунд на ожидание ответа
                response = await asyncio.wait_for(future, 10.0)
                logger.info(f"📥 Получен ответ для {correlation_id}")
                return response
            except asyncio.TimeoutError:
                self.futures.pop(correlation_id, None)
                logger.error(f"⏱️ Истекло время ожидания ответа для {correlation_id}")
                raise TimeoutError(f"Время ожидания ответа от {service} истекло")
        
        return None
    
    async def subscribe_to_events(self, queue_name: str, callback: Callable) -> str:
        """Подписка на события из указанной очереди"""
        if not self.connection or self.connection.is_closed:
            await self.connect()
            
        queue = await self.channel.declare_queue(queue_name, durable=True)
        consumer_tag = await queue.consume(callback)
        logger.info(f"✅ Подписка на события из очереди {queue_name} установлена")
        return consumer_tag

# Создаем экземпляр клиента
rabbit_client = RabbitMQClient()

# Функция для инициализации соединения
async def init_rabbitmq():
    await rabbit_client.connect()
    logger.info("RabbitMQ клиент инициализирован")

# Функция для закрытия соединения
async def close_rabbitmq():
    await rabbit_client.disconnect()
    logger.info("RabbitMQ клиент остановлен")