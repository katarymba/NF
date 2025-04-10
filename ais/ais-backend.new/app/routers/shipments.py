from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.ShipmentResponse])
def get_shipments(db: Session = Depends(get_db)):
    return db.query(models.Shipment).all()
