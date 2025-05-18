# Заглушка для удаленной функциональности RabbitMQ
import logging

logger = logging.getLogger(__name__)

class RabbitMQServiceStub:
    """Заглушка для RabbitMQ сервиса"""
    def __init__(self):
        self.connected = False
        logger.info("RabbitMQ функциональность отключена")
    
    def connect(self):
        logger.info("RabbitMQ connect вызван, но функциональность отключена")
        return False
    
    def reconnect(self):
        logger.info("RabbitMQ reconnect вызван, но функциональность отключена")
        return False
    
    def publish_message(self, *args, **kwargs):
        logger.info("RabbitMQ publish_message вызван, но функциональность отключена")
        return False
    
    def consume_messages(self, *args, **kwargs):
        logger.info("RabbitMQ consume_messages вызван, но функциональность отключена")
        return False
    
    def stop_consuming(self):
        logger.info("RabbitMQ stop_consuming вызван, но функциональность отключена")
        return False

# Создаем экземпляр сервиса-заглушки
rabbitmq_service = RabbitMQServiceStub()

# Константы для совместимости
EXCHANGE_NAME = "northfish_exchange"
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"

def send_to_ais(message):
    """Заглушка для отправки сообщения в АИС"""
    logger.info("send_to_ais вызван, но функциональность отключена")
    return False
