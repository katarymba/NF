from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)


def get_all_products(db: Session):
    return db.query(models.Product).all()


def get_all_stocks(db: Session):
    return db.query(models.StockItem).all()


def get_all_warehouses(db: Session):
    return db.query(models.Warehouse).all()


def get_all_categories(db: Session):
    return db.query(models.Category).all()


def get_all_shipments(db: Session):
    return db.query(models.Shipment).all()


def get_all_stock_movements(db: Session):
    return db.query(models.StockMovement).all()


def create_product(db: Session, product: schemas.ProductCreate):
    # Generate new ID if not provided
    product_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # Find category name
    category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
    category_name = category.name if category else "Unknown"

    # Create product model
    db_product = models.Product(
        id=product_id,
        sku=product.sku,
        name=product.name,
        description=product.description,
        category_id=product.category_id,
        category_name=category_name,
        unit=product.unit,
        price=product.price,
        is_active=product.is_active,
        created_at=now,
        updated_at=now,
        supplier=product.supplier,
        image_url=product.image_url,
        sr_sync=product.sr_sync,
        sr_stock_quantity=product.sr_stock_quantity
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def create_stock(db: Session, stock: schemas.StockItemCreate):
    # Generate new ID if not provided
    stock_id = str(uuid.uuid4())

    # Find product and warehouse names
    product = db.query(models.Product).filter(models.Product.id == stock.product_id).first()
    warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == stock.warehouse_id).first()

    product_name = product.name if product else "Unknown Product"
    warehouse_name = warehouse.name if warehouse else "Unknown Warehouse"

    # Determine status based on quantity
    status = determine_stock_status(stock.quantity, stock.minimum_quantity)

    # Create stock model
    db_stock = models.StockItem(
        id=stock_id,
        product_id=stock.product_id,
        product_name=product_name,
        warehouse_id=stock.warehouse_id,
        warehouse_name=warehouse_name,
        quantity=stock.quantity,
        minimum_quantity=stock.minimum_quantity,
        maximum_quantity=stock.maximum_quantity,
        reorder_level=stock.reorder_level,
        quantity_reserved=stock.quantity_reserved,
        last_count_date=stock.last_count_date,
        last_counted_by=stock.last_counted_by,
        status=status
    )

    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


def create_shipment(db: Session, shipment: schemas.ShipmentCreate):
    # Generate ID in format SH-YYYYMMDD-HHMMSS
    now = datetime.now()
    shipment_id = f"SH-{now.strftime('%Y%m%d-%H%M%S')}"

    # Create shipment model
    db_shipment = models.Shipment(
        id=shipment_id,
        supplier=shipment.supplier,
        shipment_date=shipment.shipment_date,
        expected_arrival_date=shipment.expected_arrival_date,
        status=shipment.status,
        reference_number=shipment.reference_number,
        created_by=shipment.created_by,
        created_at=now.isoformat(),
        updated_at=now.isoformat(),
        notes=shipment.notes
    )

    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)

    # Create shipment items
    item_ids = []
    for item in shipment.items:
        # Find product name
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        product_name = product.name if product else "Unknown Product"

        # Generate item ID
        item_id = f"SI-{uuid.uuid4().hex[:8]}"
        item_ids.append(item_id)

        # Create item
        db_item = models.ShipmentItem(
            id=item_id,
            shipment_id=db_shipment.id,
            product_id=item.product_id,
            product_name=product_name,
            quantity_ordered=item.quantity_ordered,
            quantity_received=item.quantity_received,
            unit_price=item.unit_price,
            warehouse_id=item.warehouse_id,
            is_received=item.is_received,
            received_date=item.received_date,
            notes=item.notes
        )

        db.add(db_item)

    db.commit()
    return db_shipment


def create_stock_movement(db: Session, movement: schemas.StockMovementCreate):
    # Generate ID
    movement_id = f"SM-{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    # Find product and warehouse names
    product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == movement.warehouse_id).first()

    product_name = product.name if product else "Unknown Product"
    warehouse_name = warehouse.name if warehouse else "Unknown Warehouse"

    # Create movement model
    db_movement = models.StockMovement(
        id=movement_id,
        product_id=movement.product_id,
        product_name=product_name,
        warehouse_id=movement.warehouse_id,
        warehouse_name=warehouse_name,
        quantity=movement.quantity,
        previous_quantity=movement.previous_quantity,
        movement_type=movement.movement_type,
        reference_id=movement.reference_id,
        reference_type=movement.reference_type,
        performed_by=movement.performed_by,
        movement_date=now,
        notes=movement.notes
    )

    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement


def update_product(db: Session, product_id: str, product_data: schemas.ProductCreate):
    # Find the product
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not db_product:
        return None

    # Update product fields
    for key, value in product_data.dict().items():
        if value is not None:
            setattr(db_product, key, value)

    # Update category name if category_id was changed
    if hasattr(product_data, 'category_id') and product_data.category_id:
        category = db.query(models.Category).filter(models.Category.id == product_data.category_id).first()
        if category:
            db_product.category_name = category.name

    # Update timestamp
    db_product.updated_at = datetime.now().isoformat()

    db.commit()
    db.refresh(db_product)
    return db_product


def patch_stock(db: Session, stock_id: str, changes: schemas.StockItemPatch):
    # Find the stock item
    db_stock = db.query(models.StockItem).filter(models.StockItem.id == stock_id).first()

    if not db_stock:
        return None

    # Apply changes
    data = changes.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(db_stock, key, value)

    # Update status based on quantity if not explicitly set
    if 'quantity' in data and 'status' not in data:
        db_stock.status = determine_stock_status(db_stock.quantity, db_stock.minimum_quantity)

    db.commit()
    db.refresh(db_stock)
    return db_stock


def patch_shipment(db: Session, shipment_id: str, changes: schemas.ShipmentPatch):
    # Find the shipment
    db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()

    if not db_shipment:
        return None

    # Apply changes
    data = changes.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(db_shipment, key, value)

    # Update timestamp if not explicitly set
    if 'updated_at' not in data:
        db_shipment.updated_at = datetime.now().isoformat()

    db.commit()
    db.refresh(db_shipment)
    return db_shipment


def patch_shipment_item(db: Session, item_id: str, changes: schemas.ShipmentItemPatch):
    # Find the shipment item
    db_item = db.query(models.ShipmentItem).filter(models.ShipmentItem.id == item_id).first()

    if not db_item:
        return None

    # Apply changes
    data = changes.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


def determine_stock_status(quantity: int, min_quantity: int):
    if quantity <= 0:
        return "out-of-stock"
    elif quantity < min_quantity:
        return "low-stock"
    else:
        return "in-stock"