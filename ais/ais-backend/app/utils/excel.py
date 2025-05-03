from fastapi import HTTPException
from fastapi.responses import FileResponse
import pandas as pd
import os
import tempfile
from typing import Optional

def create_excel(data: pd.DataFrame, filename: str, sheet_name: str = "Sheet1"):
    """
    Создает Excel-файл с данными и возвращает его как FileResponse
    """
    # Проверка директории для временных файлов
    temp_dir = os.path.join(tempfile.gettempdir(), 'ais_exports')
    os.makedirs(temp_dir, exist_ok=True)
    
    # Полный путь к файлу
    file_path = os.path.join(temp_dir, filename)
    
    try:
        # Сохранение DataFrame в Excel
        data.to_excel(file_path, index=False, sheet_name=sheet_name)
        
        # Создание FileResponse
        response = FileResponse(
            path=file_path, 
            filename=filename, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
        # Заголовок для скачивания
        response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании Excel-файла: {str(e)}")