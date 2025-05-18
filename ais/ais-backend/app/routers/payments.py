from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas.payment import (
    PaymentResponse,
    PaymentCreate,
    PaymentUpdate,
    PaymentListResponse
)
from app.crud import payments as payments_crud
from app.services.logging_service import logger

router = APIRouter(
    prefix="/payments",
    tags=["payments"],
    responses={404: {"description": "Платеж не найден"}},
)


@router.get("", response_model=List[PaymentListResponse])
async def get_payments(
        request: Request,
        skip: int = 0,
        limit: int = 100,
        order_id: Optional[int] = None,
        payment_status: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Получить список всех платежей с возможностью фильтрации
    """
    try:
        # Получаем все платежи с использованием CRUD-функции
        result = payments_crud.get_payments(db)

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении платежей"
            )

        # Фильтрация по order_id и payment_status, если указаны
        if order_id:
            result = [payment for payment in result if payment["order_id"] == order_id]

        if payment_status:
            result = [payment for payment in result if payment["payment_status"] == payment_status]

        # Применяем пагинацию
        total_count = len(result)
        paginated_result = result[skip:skip + limit]

        # Логируем информацию о запросе
        username = request.headers.get("X-User", "unknown")
        logger.info(f"User {username} requested payments list. Returned {len(paginated_result)} records.")

        # Устанавливаем заголовок пагинации
        # Примечание: FastAPI автоматически не устанавливает заголовки, нужно использовать Response или JSONResponse
        response = JSONResponse(content=paginated_result)
        response.headers["X-Total-Count"] = str(total_count)

        return response

    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка базы данных: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Произошла непредвиденная ошибка на сервере."
        )


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Получить детальную информацию о платеже по ID
    """
    try:
        payment = payments_crud.get_payment(payment_id, db)

        if payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Платеж не найден"
            )

        return payment
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error getting payment {payment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/order/{order_id}", response_model=List[PaymentListResponse])
def get_order_payments(order_id: int, db: Session = Depends(get_db)):
    """
    Получить все платежи для конкретного заказа
    """
    try:
        payments = payments_crud.get_order_payments(order_id, db)

        if payments is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении платежей для заказа"
            )

        return payments
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error getting payments for order {order_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    """
    Создать новый платеж
    """
    try:
        new_payment = payments_crud.create_payment(payment_data, db)

        if new_payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Не удалось создать платеж. Возможно, указанный заказ не существует."
            )

        return new_payment
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
        payment_id: int,
        payment_data: PaymentUpdate,
        db: Session = Depends(get_db)
):
    """
    Обновить статус платежа или ID транзакции
    """
    try:
        updated_payment = payments_crud.update_payment(payment_id, payment_data, db)

        if updated_payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Платеж не найден"
            )

        return updated_payment
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error updating payment {payment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Удалить платеж
    """
    try:
        success = payments_crud.delete_payment(payment_id, db)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Платеж не найден"
            )

        return {"detail": "Платеж успешно удален"}
    except OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Отсутствует подключение к базе данных PostgreSQL. Проверьте настройки подключения и перезагрузите страницу."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error deleting payment {payment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )