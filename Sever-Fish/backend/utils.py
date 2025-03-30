import logging

async def send_email(recipient_email, subject, content):
    """
    Отправка электронной почты указанному получателю.
    
    В производственной среде эта функция должна использовать 
    реальный почтовый сервис. Для разработки мы просто логируем содержимое.
    
    Args:
        recipient_email (str): Адрес электронной почты получателя
        subject (str): Тема письма
        content (str): Содержимое письма
    """
    # В реальной реализации следует использовать smtplib или API сервиса отправки писем
    logging.info(f"Отправка письма: {recipient_email}")
    logging.info(f"Тема: {subject}")
    logging.info(f"Содержимое: {content}")
    
    # Выводим информацию в консоль для отладки
    print(f"\n--- ЭЛЕКТРОННОЕ ПИСЬМО ---")
    print(f"Кому: {recipient_email}")
    print(f"Тема: {subject}")
    print(f"Содержимое: {content}")
    print(f"--- КОНЕЦ ПИСЬМА ---\n")
    
    # Возвращаем True для имитации успешной отправки
    return True