from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class OrderWithPayment(BaseModel):
    id: int
    user_id: int
    client_name: Optional[str] = None
    total_price: float
    created_at: datetime
    status: str
    delivery_address: Optional[str] = None
    tracking_number: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_created_at: Optional[datetime] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    contact_phone: Optional[str] = None
    delivery_notes: Optional[str] = None
    order_items: Optional[List[Dict[str, Any]]] = None
    items: Optional[List[Dict[str, Any]]] = None
    
    model_config = ConfigDict(from_attributes=True)