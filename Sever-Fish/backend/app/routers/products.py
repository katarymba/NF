# app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Path, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import os
import uuid
import shutil
from datetime import datetime

from app.database import get_db
from app.models import Product, Category
from app.schemas import ProductResponse, CategoryResponse, ProductCreate, ProductUpdate, CategoryCreate
from app.utils.auth import require_auth, require_admin
from app.config import PRODUCTS_IMAGES_DIR

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])


# Получить все товары с пагинацией и фильтрацией
@router.get("/", response_model=List[ProductResponse])
async def get_all_products(
        db: Session = Depends(get_db),
        skip: int = Query(0, ge=0, description="Сколько товаров пропустить"),
        limit: int = Query(100, ge=1, le=100, description="Максимальное количество товаров"),
        search: Optional[str] = Query(None, description="Поиск по названию товара"),
        category_id: Optional[int] = Query(None, description="Фильтр по ID категории"),
        min_price: Optional[float] = Query(None, ge=0, description="Минимальная цена"),
        max_price: Optional[float] = Query(None, ge=0, description="Максимальная цена"),
        sort_by: Optional[str] = Query("name", description="Поле для сортировки (name, price, created_at)")
):
    """
    Получить список всех товаров с возможностью пагинации, фильтрации и сортировки
    """
    try:
        # Начинаем с базового запроса
        query = db.query(Product)

        # Применяем фильтры
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Применяем сортировку
        if sort_by == "price":
            query = query.order_by(Product.price)
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "created_at":
            query = query.order_by(Product.created_at.desc())
        else:  # По умолчанию сортируем по имени
            query = query.order_by(Product.name)

        # Применяем пагинацию
        products = query.offset(skip).limit(limit).all()

        return products
    except Exception as e:
        logger.error(f"Ошибка при получении товаров: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при получении товаров: {str(e)}"
        )


# Получить список категорий
@router.get("/categories/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """
    Получить список всех категорий товаров
    """
    try:
        categories = db.query(Category).order_by(Category.name).all()
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при получении категорий: {str(e)}"
        )


# Получить товары по слагу категории
@router.get("/category/{category_slug}", response_model=List[ProductResponse])
async def get_products_by_category(
        category_slug: str,
        db: Session = Depends(get_db),
        skip: int = Query(0, ge=0, description="Сколько товаров пропустить"),
        limit: int = Query(100, ge=1, le=100, description="Максимальное количество товаров"),
        sort_by: Optional[str] = Query("name", description="Поле для сортировки (name, price, created_at)")
):
    """
    Получить список товаров из указанной категории по её слагу
    """
    try:
        category = db.query(Category).filter(Category.slug == category_slug).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Категория не найдена"
            )

        # Базовый запрос
        query = db.query(Product).filter(Product.category_id == category.id)

        # Применяем сортировку
        if sort_by == "price":
            query = query.order_by(Product.price)
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "created_at":
            query = query.order_by(Product.created_at.desc())
        else:  # По умолчанию сортируем по имени
            query = query.order_by(Product.name)

        # Применяем пагинацию
        products = query.offset(skip).limit(limit).all()

        return products
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товаров по категории {category_slug}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при получении товаров по категории: {str(e)}"
        )


# Получить товар по ID
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(
        product_id: int = Path(..., ge=1, description="ID товара"),
        db: Session = Depends(get_db)
):
    """
    Получить детальную информацию о товаре по его ID
    """
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Товар не найден"
            )
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товара с ID {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при получении товара: {str(e)}"
        )


# Создать новый товар (только для админов)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
        request: Request,
        product: ProductCreate,
        db: Session = Depends(get_db)
):
    """
    Создать новый товар (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        # Перехватываем исключение из require_admin и пробрасываем дальше
        raise e

    try:
        # Проверяем, существует ли категория, если она указана
        if product.category_id:
            category = db.query(Category).filter(Category.id == product.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Указанная категория не найдена"
                )

        # Создаем новый товар
        db_product = Product(
            name=product.name,
            description=product.description,
            price=product.price,
            image_url=product.image_url,
            weight=product.weight,
            category_id=product.category_id,
            stock_quantity=product.stock_quantity or 0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        logger.info(f"Создан новый товар: {db_product.name} (ID: {db_product.id})")
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при создании товара: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при создании товара: {str(e)}"
        )


# Обновить существующий товар (только для админов)
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
        request: Request,
        product_id: int,
        product_data: ProductUpdate,
        db: Session = Depends(get_db)
):
    """
    Обновить существующий товар (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    try:
        # Получаем товар из БД
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Товар не найден"
            )

        # Проверяем, существует ли категория, если она обновляется
        if product_data.category_id is not None:
            category = db.query(Category).filter(Category.id == product_data.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Указанная категория не найдена"
                )

        # Обновляем только указанные поля
        update_data = product_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)

        # Обновляем поле updated_at
        db_product.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_product)

        logger.info(f"Обновлен товар: {db_product.name} (ID: {db_product.id})")
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при обновлении товара с ID {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при обновлении товара: {str(e)}"
        )


# Удалить товар (только для админов)
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
        request: Request,
        product_id: int,
        db: Session = Depends(get_db)
):
    """
    Удалить товар (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    try:
        # Получаем товар из БД
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Товар не найден"
            )

        # Сохраняем название товара для логирования
        product_name = db_product.name

        # Сохраняем путь к изображению, если есть
        image_path = None
        if db_product.image_url:
            image_filename = os.path.basename(db_product.image_url)
            image_path = os.path.join(PRODUCTS_IMAGES_DIR, image_filename)

        # Удаляем товар из базы
        db.delete(db_product)
        db.commit()

        # Удаляем изображение, если оно существует
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                logger.warning(f"Ошибка при удалении файла изображения товара {product_id}: {e}")

        logger.info(f"Удален товар: {product_name} (ID: {product_id})")
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при удалении товара с ID {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при удалении товара: {str(e)}"
        )


# Загрузить изображение для товара (только для админов)
@router.post("/{product_id}/upload-image", response_model=ProductResponse)
async def upload_product_image(
        request: Request,
        product_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    """
    Загрузить изображение для товара (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    # Проверяем, существует ли товар
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден"
        )

    # Проверяем тип файла
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл должен быть изображением (JPEG, PNG, GIF)"
        )

    try:
        # Создаем директорию для изображений, если её нет
        os.makedirs(PRODUCTS_IMAGES_DIR, exist_ok=True)

        # Удаляем старое изображение, если оно есть
        if product.image_url:
            old_filename = os.path.basename(product.image_url)
            old_path = os.path.join(PRODUCTS_IMAGES_DIR, old_filename)
            if os.path.exists(old_path):
                os.remove(old_path)

        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"product_{product_id}_{uuid.uuid4().hex}{file_extension}"
        new_path = os.path.join(PRODUCTS_IMAGES_DIR, new_filename)

        # Сохраняем файл
        with open(new_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Обновляем URL изображения в базе данных
        product.image_url = f"/images/{new_filename}"
        product.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(product)

        logger.info(f"Загружено изображение для товара: {product.name} (ID: {product.id})")
        return product
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при загрузке изображения для товара с ID {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при загрузке изображения: {str(e)}"
        )


# Создать новую категорию (только для админов)
@router.post("/categories/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
        request: Request,
        category: CategoryCreate,
        db: Session = Depends(get_db)
):
    """
    Создать новую категорию товаров (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    try:
        # Проверяем, не существует ли уже категория с таким слагом
        if category.slug:
            existing_category = db.query(Category).filter(Category.slug == category.slug).first()
            if existing_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Категория со слагом '{category.slug}' уже существует"
                )

        # Если слаг не указан, генерируем его из названия
        if not category.slug:
            from slugify import slugify
            category.slug = slugify(category.name)

            # Проверяем уникальность сгенерированного слага
            existing_category = db.query(Category).filter(Category.slug == category.slug).first()
            if existing_category:
                # Добавляем уникальный суффикс
                import random
                import string
                suffix = ''.join(random.choices(string.digits, k=4))
                category.slug = f"{category.slug}-{suffix}"

        # Создаем новую категорию
        db_category = Category(
            name=category.name,
            slug=category.slug,
            description=category.description
        )

        db.add(db_category)
        db.commit()
        db.refresh(db_category)

        logger.info(f"Создана новая категория: {db_category.name} (ID: {db_category.id})")
        return db_category
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при создании категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при создании категории: {str(e)}"
        )


# Обновить категорию (только для админов)
@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
        request: Request,
        category_id: int,
        category_data: CategoryCreate,
        db: Session = Depends(get_db)
):
    """
    Обновить существующую категорию (требуются права администратора)
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    try:
        # Получаем категорию из БД
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Категория не найдена"
            )

        # Проверяем, не занят ли новый слаг
        if category_data.slug and category_data.slug != db_category.slug:
            existing_category = db.query(Category).filter(Category.slug == category_data.slug).first()
            if existing_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Категория со слагом '{category_data.slug}' уже существует"
                )

        # Обновляем поля категории
        db_category.name = category_data.name
        if category_data.slug:
            db_category.slug = category_data.slug
        db_category.description = category_data.description

        db.commit()
        db.refresh(db_category)

        logger.info(f"Обновлена категория: {db_category.name} (ID: {db_category.id})")
        return db_category
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при обновлении категории с ID {category_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при обновлении категории: {str(e)}"
        )


# Удалить категорию (только для админов)
@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
        request: Request,
        category_id: int,
        force: bool = Query(False, description="Удалить категорию даже если в ней есть товары"),
        db: Session = Depends(get_db)
):
    """
    Удалить категорию (требуются права администратора).
    По умолчанию категорию нельзя удалить, если в ней есть товары.
    """
    # Проверка на админа
    try:
        await require_admin(request, db)
    except HTTPException as e:
        raise e

    try:
        # Получаем категорию из БД
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Категория не найдена"
            )

        # Проверяем, есть ли в категории товары
        products_count = db.query(Product).filter(Product.category_id == category_id).count()
        if products_count > 0 and not force:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Нельзя удалить категорию, содержащую {products_count} товаров. Используйте параметр force=true для принудительного удаления."
            )

        # Сохраняем название категории для логирования
        category_name = db_category.name

        # Если force=true, устанавливаем category_id=null у товаров этой категории
        if products_count > 0 and force:
            products = db.query(Product).filter(Product.category_id == category_id).all()
            for product in products:
                product.category_id = None
            db.commit()

        # Удаляем категорию
        db.delete(db_category)
        db.commit()

        logger.info(f"Удалена категория: {category_name} (ID: {category_id})")
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Откатываем транзакцию в случае ошибки
        logger.error(f"Ошибка при удалении категории с ID {category_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при удалении категории: {str(e)}"
        )