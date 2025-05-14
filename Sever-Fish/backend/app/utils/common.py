# app/utils/common.py
import os
import re
import unicodedata
import logging
from datetime import datetime
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Очистка текста от посторонних символов и лишних пробелов"""
    if not text:
        return ""
    # Удаляем символы, не относящиеся к кириллице, латинице, цифрам и базовой пунктуации
    text = re.sub(r'[^\w\s\.,!?()-]', '', text)
    # Заменяем несколько пробелов на один
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def slugify(text: str) -> str:
    """
    Преобразование текста в URL-slug
    (из кириллицы в транслит, замена пробелов на дефисы)
    """
    # Транслитерация для русских символов
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    }
    
    # Приводим к нижнему регистру
    text = text.lower()
    
    # Транслитерация
    result = ''
    for char in text:
        if char in translit_map:
            result += translit_map[char]
        elif char.isalnum():
            result += char
        else:
            result += '-'
    
    # Заменяем все не буквенно-цифровые символы на дефисы
    result = re.sub(r'[^a-z0-9]+', '-', result)
    
    # Удаляем начальные и конечные дефисы
    result = result.strip('-')
    
    # Сокращаем множественные дефисы до одного
    result = re.sub(r'-+', '-', result)
    
    return result

def format_price(price: float) -> str:
    """Форматирует цену с двумя знаками после запятой и символом валюты"""
    return f"{price:.2f} ₽"

def safe_filename(filename: str) -> str:
    """Преобразует строку в безопасное имя файла"""
    # Удаляем небезопасные символы и заменяем пробелы на подчеркивания
    filename = re.sub(r'[^\w\s.-]', '', filename)
    return re.sub(r'\s+', '_', filename).strip('.-_')

def get_file_extension(filename: str) -> str:
    """Получает расширение файла"""
    return os.path.splitext(filename)[1].lower() if filename else ""

def generate_unique_filename(original_filename: str) -> str:
    """Генерирует уникальное имя файла на основе текущего времени"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename, extension = os.path.splitext(original_filename)
    safe_name = safe_filename(filename)
    return f"{safe_name}_{timestamp}{extension}"

def parse_pagination_params(skip: int = 0, limit: int = 100) -> Dict[str, int]:
    """Проверяет и возвращает параметры пагинации"""
    if skip < 0:
        skip = 0
    if limit <= 0:
        limit = 100
    elif limit > 1000:  # Устанавливаем максимальный лимит
        limit = 1000
    return {"skip": skip, "limit": limit}

def format_response(data: Any, message: str = None, success: bool = True) -> Dict[str, Any]:
    """Форматирует ответ API в стандартной структуре"""
    response = {
        "success": success,
        "data": data
    }
    if message:
        response["message"] = message
    return response