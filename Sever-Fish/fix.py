import os
import re

def fix_imports(file_path):
    """
    Исправляет все импорты Pydantic в файле
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        print(f"Ошибка чтения файла {file_path}: {e}")
        return False
    
    # Проверка использования без импорта
    types_to_check = {
        'BaseModel': 'class UserBase(BaseModel)',
        'EmailStr': 'email: EmailStr',
        'Field': 'Field(',
        'validator': 'validator(',
        'field_validator': '@field_validator',
        'model_validator': '@model_validator',
        'ConfigDict': 'ConfigDict'
    }
    
    need_imports = []
    for import_type, pattern in types_to_check.items():
        if pattern in content and f'from pydantic import {import_type}' not in content:
            need_imports.append(import_type)
    
    if not need_imports:
        print(f"В файле {file_path} не требуется добавление импортов")
        return False
    
    print(f"Требуется добавить импорты в {file_path}: {', '.join(need_imports)}")
    
    # Проверяем, есть ли уже импорт из pydantic
    if 'from pydantic import ' in content:
        # Обновляем существующий импорт
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('from pydantic import '):
                # Извлекаем текущие импорты
                current_imports = line.replace('from pydantic import ', '').split(', ')
                # Добавляем отсутствующие импорты
                for import_item in need_imports:
                    if import_item not in current_imports:
                        current_imports.append(import_item)
                # Обновляем строку импорта
                lines[i] = 'from pydantic import ' + ', '.join(current_imports)
                break
        content = '\n'.join(lines)
    else:
        # Создаем новый импорт в начале файла
        import_line = 'from pydantic import ' + ', '.join(need_imports)
        content = import_line + '\n\n' + content
    
    # Записываем обновленное содержимое в файл
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Импорты успешно добавлены в {file_path}")
        return True
    except Exception as e:
        print(f"Ошибка записи в файл {file_path}: {e}")
        return False

def check_requirements():
    """
    Проверяет и устанавливает необходимые зависимости
    """
    import subprocess
    
    # Проверяем, установлен ли email-validator для поддержки EmailStr
    try:
        subprocess.run(['pip', 'install', 'pydantic[email]'], check=True)
        print("Установлены необходимые зависимости для pydantic")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при установке зависимостей: {e}")
        return False

def fix_docker_container(container_id):
    """
    Исправляет файлы внутри Docker-контейнера
    """
    import subprocess
    
    # Копируем скрипт в контейнер
    with open('fix_container.py', 'w') as file:
        file.write('''
import os

def fix_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Проверка использования без импорта
    types_to_check = {
        'BaseModel': 'class UserBase(BaseModel)',
        'EmailStr': 'email: EmailStr',
        'Field': 'Field(',
        'validator': 'validator(',
        'field_validator': '@field_validator',
        'model_validator': '@model_validator',
        'ConfigDict': 'ConfigDict'
    }
    
    need_imports = []
    for import_type, pattern in types_to_check.items():
        if pattern in content and f'from pydantic import {import_type}' not in content:
            need_imports.append(import_type)
    
    if not need_imports:
        print(f"В файле {file_path} не требуется добавление импортов")
        return False
    
    print(f"Требуется добавить импорты в {file_path}: {', '.join(need_imports)}")
    
    # Проверяем, есть ли уже импорт из pydantic
    if 'from pydantic import ' in content:
        # Обновляем существующий импорт
        lines = content.split('\\n')
        for i, line in enumerate(lines):
            if line.startswith('from pydantic import '):
                # Извлекаем текущие импорты
                current_imports = line.replace('from pydantic import ', '').split(', ')
                # Добавляем отсутствующие импорты
                for import_item in need_imports:
                    if import_item not in current_imports:
                        current_imports.append(import_item)
                # Обновляем строку импорта
                lines[i] = 'from pydantic import ' + ', '.join(current_imports)
                break
        content = '\\n'.join(lines)
    else:
        # Создаем новый импорт в начале файла
        import_line = 'from pydantic import ' + ', '.join(need_imports)
        content = import_line + '\\n\\n' + content
    
    # Записываем обновленное содержимое в файл
    try:
        with open(file_path, 'w') as file:
            file.write(content)
        print(f"Импорты успешно добавлены в {file_path}")
        return True
    except Exception as e:
        print(f"Ошибка записи в файл {file_path}: {e}")
        return False

# Основные файлы для проверки
files_to_check = [
    '/app/app/schemas.py',
    '/app/app/models.py'
]

for file_path in files_to_check:
    if os.path.exists(file_path):
        print(f"Проверка файла: {file_path}")
        fix_file(file_path)
    else:
        print(f"Файл {file_path} не найден")

# Устанавливаем зависимости
import subprocess
try:
    subprocess.run(['pip', 'install', 'pydantic[email]'], check=True)
    print("Установлены необходимые зависимости для pydantic")
except subprocess.CalledProcessError as e:
    print(f"Ошибка при установке зависимостей: {e}")
''')
    
    # Копируем скрипт в контейнер
    subprocess.run(['docker', 'cp', 'fix_container.py', f'{container_id}:/app/'])
    
    # Запускаем скрипт в контейнере
    subprocess.run(['docker', 'exec', container_id, 'python', '/app/fix_container.py'])
    
    # Удаляем временный файл
    os.remove('fix_container.py')
    
    # Перезапускаем контейнер
    subprocess.run(['docker', 'restart', container_id])
    
    print(f"Контейнер {container_id} перезапущен")

if __name__ == "__main__":
    import sys
    
    # Если указан ID контейнера, исправляем файлы в контейнере
    if len(sys.argv) > 1:
        container_id = sys.argv[1]
        print(f"Исправление файлов в контейнере {container_id}")
        fix_docker_container(container_id)
    else:
        # Иначе исправляем локальные файлы
        files_to_check = [
            "backend/app/schemas.py",
            "app/schemas.py"
        ]
        
        # Проверяем наличие необходимых зависимостей
        check_requirements()
        
        # Исправляем файлы
        fixed_files = []
        for file_path in files_to_check:
            if os.path.exists(file_path):
                print(f"Проверка файла: {file_path}")
                if fix_imports(file_path):
                    fixed_files.append(file_path)
        
        print("\nИтог:")
        print(f"Всего исправлено файлов: {len(fixed_files)}")
        for file_path in fixed_files:
            print(f"- {file_path}")