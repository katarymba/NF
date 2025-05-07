from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any, Union
from datetime import datetime, date


class OrderDeliveryUpdate(BaseModel):
    """Схема для обновления информации о доставке заказа"""
    status: Optional[str] = Field(None, description="Статус заказа")
    tracking_number: Optional[str] = Field(None, description="Трек-номер")
    courier_name: Optional[str] = Field(None, description="Имя курьера")
    delivery_address: Optional[str] = Field(None, description="Адрес доставки")
    contact_phone: Optional[str] = Field(None, description="Контактный телефон")
    delivery_notes: Optional[str] = Field(None, description="Примечания к доставке")
    estimated_delivery: Optional[date] = Field(None, description="Предполагаемая дата доставки")


class DeliveryUpdate(BaseModel):
    """Схема для обновления информации о доставке"""
    tracking_number: Optional[str] = Field(None, description="Трек-номер отправления")
    courier_name: Optional[str] = Field(None, description="Имя курьера")
    status: Optional[str] = Field(None, description="Статус доставки")
    estimated_delivery: Optional[Union[datetime, date]] = Field(None, description="Предполагаемая дата доставки")
    actual_delivery: Optional[Union[datetime, date]] = Field(None, description="Фактическая дата доставки")
    delivery_notes: Optional[str] = Field(None, description="Примечания к доставке")
    delivery_cost: Optional[float] = Field(None, description="Стоимость доставки")


class DeliveryResponse(BaseModel):
    """Схема для ответа с информацией о доставке"""
    id: int
    order_id: int
    status: str
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None
    delivery_cost: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourierInfo(BaseModel):
    """Информация о курьере"""
    name: str
    orders_count: int
    last_active: Optional[datetime] = None


class DeliveryStats(BaseModel):
    """Статистика по доставкам"""
    period: Dict[str, str]
    status_counts: Dict[str, int]
    total_orders: int
    total_revenue: float
    avg_order_value: float
    courier_stats: List[Dict[str, Any]]