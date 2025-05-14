from datetime import datetime, date
from typing import Optional
from app.models import User

class DiscountService:
    """
    Сервис для работы со скидками, в том числе со скидками в день рождения.
    """
    
    BIRTHDAY_DISCOUNT_PERCENTAGE = 20  # Скидка 20% на день рождения
    BIRTHDAY_DISCOUNT_DAYS = 7         # Скидка действует 7 дней
    
    @staticmethod
    def check_birthday_discount(user: Optional[User]) -> bool:
        """
        Проверяет, имеет ли пользователь право на скидку в день рождения.
        Скидка действует в течение недели с дня рождения.
        
        Args:
            user: Объект пользователя
            
        Returns:
            bool: True, если пользователь имеет право на скидку
        """
        if not user or not user.birthday:
            return False
        
        today = datetime.now().date()
        birthday = user.birthday
        
        # Устанавливаем день рождения в текущем году
        try:
            birthday_this_year = date(
                year=today.year,
                month=birthday.month,
                day=birthday.day
            )
        except ValueError:
            # Обработка 29 февраля в невисокосный год
            if birthday.month == 2 and birthday.day == 29 and not DiscountService.is_leap_year(today.year):
                birthday_this_year = date(today.year, 2, 28)
            else:
                return False
        
        # Если день рождения в текущем году уже прошел, проверяем прошлую неделю
        days_diff = (today - birthday_this_year).days
        
        return 0 <= days_diff <= DiscountService.BIRTHDAY_DISCOUNT_DAYS
    
    @staticmethod
    def apply_birthday_discount(price: float, user: Optional[User] = None) -> float:
        """
        Применяет скидку в день рождения, если пользователь имеет на нее право.
        
        Args:
            price: Исходная цена
            user: Объект пользователя
            
        Returns:
            float: Цена со скидкой (если применимо)
        """
        if user and DiscountService.check_birthday_discount(user):
            discount_factor = 1 - (DiscountService.BIRTHDAY_DISCOUNT_PERCENTAGE / 100)
            return round(price * discount_factor, 2)
        
        return price
    
    @staticmethod
    def get_days_until_birthday(user: Optional[User]) -> Optional[int]:
        """
        Рассчитывает количество дней до дня рождения пользователя.
        
        Args:
            user: Объект пользователя
            
        Returns:
            Optional[int]: Количество дней до дня рождения или None, если дата не указана
        """
        if not user or not user.birthday:
            return None
        
        today = datetime.now().date()
        birthday = user.birthday
        
        # Устанавливаем день рождения в текущем году
        try:
            birthday_this_year = date(
                year=today.year,
                month=birthday.month,
                day=birthday.day
            )
        except ValueError:
            # Обработка 29 февраля в невисокосный год
            if birthday.month == 2 and birthday.day == 29 and not DiscountService.is_leap_year(today.year):
                birthday_this_year = date(today.year, 2, 28)
            else:
                return None
        
        # Если день рождения уже прошел в этом году, рассчитываем для следующего года
        if birthday_this_year < today:
            try:
                birthday_next_year = date(
                    year=today.year + 1,
                    month=birthday.month,
                    day=birthday.day
                )
            except ValueError:
                # Обработка 29 февраля в невисокосный год
                if birthday.month == 2 and birthday.day == 29 and not DiscountService.is_leap_year(today.year + 1):
                    birthday_next_year = date(today.year + 1, 2, 28)
                else:
                    return None
                
            return (birthday_next_year - today).days
        
        # Если день рождения в текущем году еще не наступил
        return (birthday_this_year - today).days
    
    @staticmethod
    def is_leap_year(year: int) -> bool:
        """
        Проверяет, является ли год високосным.
        
        Args:
            year: Год для проверки
            
        Returns:
            bool: True, если год високосный
        """
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)