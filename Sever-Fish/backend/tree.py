import os

EXCLUDE_DIRS = {".idea", ".venv", ".venv", "node_modules", "__pycache__"}

def print_tree(start_path, prefix=""):
    """
    Рекурсивно выводит структуру директорий в виде дерева.
    Если имя директории входит в EXCLUDE_DIRS, то её содержимое не выводится.
    """
    try:
        entries = os.listdir(start_path)
    except PermissionError:
        # В случае отсутствия доступа
        return

    entries.sort()
    count = len(entries)
    for index, entry in enumerate(entries):
        full_path = os.path.join(start_path, entry)
        connector = "└── " if index == count - 1 else "├── "
        print(prefix + connector + entry)
        if os.path.isdir(full_path):
            # Если директория подлежит исключению, не рекурсируем в неё
            if entry in EXCLUDE_DIRS:
                continue
            new_prefix = prefix + ("    " if index == count - 1 else "│   ")
            print_tree(full_path, new_prefix)

if __name__ == "__main__":
    root_directory = 'C:\\Users\\Administrator\\Desktop\\СА ГРЯЗНЫЙ\\'
    print(root_directory)
    print_tree(root_directory)
