from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app import models, schemas
from app.database import get_db
from app.services import warehouse_service
from datetime import datetime

router = APIRouter()


# API endpoints
@router.get("/products", response_model=List[Dict[str, Any]])
def get_products(request: Request, db: Session = Depends(get_db)):
    """Get all products with their details"""
    products = db.query(models.Product).all()

    # Convert to the format expected by the frontend
    result = []
    for product in products:
        # Get category name
        category_name = product.category.name if product.category else "Unknown"

        # Calculate total stock across all warehouses
        total_stock = sum(stock.quantity for stock in product.stocks)

        # Create formatted product object
        product_data = {
            "id": str(product.id),
            "sku": f"SKU-{product.id:04d}",
            "name": product.name,
            "category_id": str(product.category_id),
            "category_name": category_name,
            "unit": "кг",  # Default unit, you might want to add this to your Product model
            "price": product.price,
            "is_active": True,
            "created_at": product.created_at.isoformat() if product.created_at else datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "supplier": "Default Supplier",  # You might want to add this to your Product model
            "image_url": f"/images/products/SKU-{product.id:04d}.jpg",
            "sr_sync": False,
            "sr_stock_quantity": 0,
            "stock_quantity": total_stock
        }
        result.append(product_data)

    return result


@router.get("/stocks", response_model=List[Dict[str, Any]])
def get_stocks(request: Request, db: Session = Depends(get_db)):
    """Get all stock items with their details"""
    stocks = db.query(models.Stock).all()

    # Попытка получения имени пользователя из запроса
    current_user = None
    try:
        current_user = request.state.user
    except:
        current_user = None

    # Имя пользователя по умолчанию, если не удалось получить из request
    username = getattr(current_user, 'username', 'katarymba')

    # Convert to the format expected by the frontend
    result = []
    for stock in stocks:
        # Determine status based on quantity
        status = "in-stock"
        if stock.quantity <= 0:
            status = "out-of-stock"
        elif stock.quantity < 30:  # Assuming minimum quantity is 30
            status = "low-stock"

        stock_data = {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": stock.product.name,
            "warehouse_id": str(stock.warehouse_id),
            "warehouse_name": stock.warehouse.name,
            "quantity": stock.quantity,
            "minimum_quantity": 30,  # Default value, you might want to add this to your Stock model
            "reorder_level": 50,  # Default value, you might want to add this to your Stock model
            "quantity_reserved": 0,
            "last_count_date": stock.updated_at.isoformat() if stock.updated_at else datetime.now().isoformat(),
            "last_counted_by": username,
            "status": status
        }
        result.append(stock_data)

    return result


@router.get("/warehouses", response_model=List[Dict[str, Any]])
def get_warehouses(request: Request, db: Session = Depends(get_db)):
    """Get all warehouses with their details"""
    warehouses = db.query(models.Warehouse).all()

    # Convert to the format expected by the frontend
    result = []
    for warehouse in warehouses:
        warehouse_data = {
            "id": str(warehouse.id),
            "name": warehouse.name,
            "address": warehouse.address or "",
            "type": warehouse.type or "general",
            "is_active": True
        }
        result.append(warehouse_data)

    return result


@router.get("/categories", response_model=List[Dict[str, Any]])
def get_categories(request: Request, db: Session = Depends(get_db)):
    """Get all categories with their details"""
    categories = db.query(models.Category).all()

    # Convert to the format expected by the frontend
    result = []
    for category in categories:
        category_data = {
            "id": str(category.id),
            "name": category.name,
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "parent_id": str(category.parent_category_id) if category.parent_category_id else None
        }
        result.append(category_data)

    return result


@router.get("/shipments", response_model=List[Dict[str, Any]])
def get_shipments(request: Request, db: Session = Depends(get_db)):
    """Get all shipments with their details"""
    shipments = db.query(models.Shipment).all()

    # Попытка получения имени пользователя из запроса
    current_user = None
    try:
        current_user = request.state.user
    except:
        current_user = None

    # Имя пользователя по умолчанию, если не удалось получить из request
    username = getattr(current_user, 'username', 'katarymba')

    # Convert to the format expected by the frontend
    result = []
    for shipment in shipments:
        # Create shipment items from order items
        items = []
        if shipment.order and shipment.order.items:
            for order_item in shipment.order.items:
                item = {
                    "id": f"SI-{order_item.id}",
                    "shipment_id": str(shipment.id),
                    "product_id": str(order_item.product_id),
                    "product_name": order_item.product.name,
                    "quantity_ordered": order_item.quantity,
                    "quantity_received": order_item.quantity if shipment.status == "delivered" else None,
                    "unit_price": order_item.price,
                    "warehouse_id": "1",  # Default warehouse ID
                    "is_received": shipment.status == "delivered",
                    "received_date": shipment.estimated_delivery.isoformat() if shipment.status == "delivered" and shipment.estimated_delivery else None
                }
                items.append(item)

        shipment_data = {
            "id": f"SH-{shipment.id}",
            "supplier": "Default Supplier",
            "shipment_date": shipment.created_at.isoformat() if shipment.created_at else datetime.now().isoformat(),
            "expected_arrival_date": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
            "actual_arrival_date": shipment.estimated_delivery.isoformat() if shipment.status == "delivered" and shipment.estimated_delivery else None,
            "status": convert_shipment_status(shipment.status),
            "reference_number": f"PO-2025-{shipment.id:03d}",
            "created_by": username,
            "created_at": shipment.created_at.isoformat() if shipment.created_at else datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "notes": "",
            "items": items
        }
        result.append(shipment_data)

    return result


@router.get("/stock-movements", response_model=List[Dict[str, Any]])
def get_stock_movements(request: Request, db: Session = Depends(get_db)):
    """Get all stock movements with their details"""
    movements = db.query(models.StockMovement).all()

    # Попытка получения имени пользователя из запроса
    current_user = None
    try:
        current_user = request.state.user
    except:
        current_user = None

    # Имя пользователя по умолчанию, если не удалось получить из request
    username = getattr(current_user, 'username', 'katarymba')

    # Convert to the format expected by the frontend
    result = []
    for movement in movements:
        # Get product and warehouse names
        product_name = movement.product.name if movement.product else "Unknown Product"
        warehouse_name = movement.warehouse.name if movement.warehouse else "Unknown Warehouse"

        movement_data = {
            "id": f"SM-{movement.id}",
            "product_id": str(movement.product_id),
            "product_name": product_name,
            "warehouse_id": str(movement.warehouse_id),
            "warehouse_name": warehouse_name,
            "quantity": movement.quantity,
            "previous_quantity": 0,  # You might want to add this to your StockMovement model
            "movement_type": movement.movement_type,
            "reference_id": str(movement.source_warehouse_id) if movement.source_warehouse_id else None,
            "reference_type": "transfer" if movement.source_warehouse_id else None,
            "performed_by": username,
            "movement_date": movement.created_at.isoformat() if movement.created_at else datetime.now().isoformat(),
            "notes": movement.note or ""
        }
        result.append(movement_data)

    return result


# POST Endpoints
@router.post("/products", response_model=Dict[str, Any])
def create_product(request: Request, product_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new product"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')

        # Extract required data from the request
        now = datetime.now()
        new_product = models.Product(
            name=product_data.get("name"),
            category_id=int(product_data.get("category_id", 1)),
            price=float(product_data.get("price", 0)),
            stock_quantity=0,
            description=product_data.get("description", ""),
            created_at=now
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        # Return formatted product data
        category = db.query(models.Category).filter(models.Category.id == new_product.category_id).first()
        category_name = category.name if category else "Unknown"

        result = {
            "id": str(new_product.id),
            "sku": f"SKU-{new_product.id:04d}",
            "name": new_product.name,
            "category_id": str(new_product.category_id),
            "category_name": category_name,
            "unit": "кг",
            "price": new_product.price,
            "is_active": True,
            "created_at": new_product.created_at.isoformat(),
            "updated_at": now.isoformat(),
            "supplier": product_data.get("supplier", "Default Supplier"),
            "image_url": f"/images/products/SKU-{new_product.id:04d}.jpg",
            "sr_sync": False,
            "sr_stock_quantity": 0
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create product: {str(e)}")


@router.post("/stocks", response_model=Dict[str, Any])
def create_stock(request: Request, stock_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new stock entry"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')

        # Extract required data from the request
        product_id = int(stock_data.get("product_id"))
        warehouse_id = int(stock_data.get("warehouse_id"))
        quantity = int(stock_data.get("quantity", 0))

        # Check if product and warehouse exist
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()

        if not product or not warehouse:
            raise HTTPException(status_code=404, detail="Product or warehouse not found")

        # Check if stock entry already exists
        existing_stock = db.query(models.Stock).filter(
            models.Stock.product_id == product_id,
            models.Stock.warehouse_id == warehouse_id
        ).first()

        current_time = datetime.now()

        if existing_stock:
            # Update existing stock
            existing_stock.quantity = quantity
            existing_stock.updated_at = current_time
            db.commit()
            db.refresh(existing_stock)
            stock_id = existing_stock.id
        else:
            # Create new stock entry
            new_stock = models.Stock(
                product_id=product_id,
                warehouse_id=warehouse_id,
                quantity=quantity,
                updated_at=current_time
            )
            db.add(new_stock)
            db.commit()
            db.refresh(new_stock)
            stock_id = new_stock.id

        # Determine status based on quantity
        status = "in-stock"
        if quantity <= 0:
            status = "out-of-stock"
        elif quantity < int(stock_data.get("minimum_quantity", 30)):
            status = "low-stock"

        # Create and return formatted stock data
        result = {
            "id": str(stock_id),
            "product_id": str(product_id),
            "product_name": product.name,
            "warehouse_id": str(warehouse_id),
            "warehouse_name": warehouse.name,
            "quantity": quantity,
            "minimum_quantity": int(stock_data.get("minimum_quantity", 30)),
            "reorder_level": int(stock_data.get("reorder_level", 50)),
            "quantity_reserved": 0,
            "last_count_date": current_time.isoformat(),
            "last_counted_by": username,
            "status": status
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create stock: {str(e)}")


@router.post("/stock-movements", response_model=Dict[str, Any])
def create_stock_movement(request: Request, movement_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new stock movement"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')
        user_id = getattr(current_user, 'id', 1)

        # Extract required data from the request
        product_id = int(movement_data.get("product_id"))
        warehouse_id = int(movement_data.get("warehouse_id"))
        quantity = int(movement_data.get("quantity", 0))
        movement_type = movement_data.get("movement_type", "adjustment")
        previous_quantity = int(movement_data.get("previous_quantity", 0))
        notes = movement_data.get("notes", "")

        # Check if product and warehouse exist
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()

        if not product or not warehouse:
            raise HTTPException(status_code=404, detail="Product or warehouse not found")

        current_time = datetime.now()

        # Create new stock movement
        new_movement = models.StockMovement(
            product_id=product_id,
            warehouse_id=warehouse_id,
            quantity=quantity,
            movement_type=movement_type,
            created_at=current_time,
            created_by_id=user_id,
            note=notes
        )

        # Set source and target warehouses if it's a transfer
        if movement_data.get("reference_type") == "transfer":
            new_movement.source_warehouse_id = int(movement_data.get("reference_id", 0))
            new_movement.target_warehouse_id = warehouse_id

        db.add(new_movement)

        # Update product stock
        stock = db.query(models.Stock).filter(
            models.Stock.product_id == product_id,
            models.Stock.warehouse_id == warehouse_id
        ).first()

        if stock:
            # Update existing stock
            stock.quantity += quantity
            if stock.quantity < 0:
                stock.quantity = 0
        else:
            # Create new stock entry
            stock = models.Stock(
                product_id=product_id,
                warehouse_id=warehouse_id,
                quantity=max(0, quantity),
                updated_at=current_time
            )
            db.add(stock)

        # If it's a transfer, update source warehouse stock
        if movement_data.get("reference_type") == "transfer" and new_movement.source_warehouse_id:
            source_stock = db.query(models.Stock).filter(
                models.Stock.product_id == product_id,
                models.Stock.warehouse_id == new_movement.source_warehouse_id
            ).first()

            if source_stock:
                source_stock.quantity -= quantity
                if source_stock.quantity < 0:
                    source_stock.quantity = 0

        db.commit()
        db.refresh(new_movement)

        # Return formatted movement data
        result = {
            "id": f"SM-{new_movement.id}",
            "product_id": str(product_id),
            "product_name": product.name,
            "warehouse_id": str(warehouse_id),
            "warehouse_name": warehouse.name,
            "quantity": quantity,
            "previous_quantity": previous_quantity,
            "movement_type": movement_type,
            "reference_id": movement_data.get("reference_id"),
            "reference_type": movement_data.get("reference_type"),
            "performed_by": username,
            "movement_date": new_movement.created_at.isoformat(),
            "notes": notes
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create stock movement: {str(e)}")


@router.post("/shipments", response_model=Dict[str, Any])
def create_shipment(request: Request, shipment_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new shipment"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')

        # Extract base shipment data
        supplier = shipment_data.get("supplier", "Default Supplier")
        status = reverse_convert_shipment_status(shipment_data.get("status", "planned"))
        shipping_address = shipment_data.get("shipping_address", "")
        reference_number = shipment_data.get("reference_number", "")
        current_time = datetime.now()

        # Create a mock order for the shipment
        new_order = models.Order(
            client_name=supplier,
            total_price=0,
            status="pending",
            created_at=current_time,
            delivery_address=shipping_address
        )
        db.add(new_order)
        db.flush()

        # Create the shipment
        new_shipment = models.Shipment(
            order_id=new_order.id,
            shipping_address=shipping_address,
            status=status,
            estimated_delivery=datetime.fromisoformat(shipment_data.get("expected_arrival_date")) if shipment_data.get(
                "expected_arrival_date") else None
        )
        db.add(new_shipment)
        db.flush()

        # Process shipment items
        items = shipment_data.get("items", [])
        total_price = 0
        formatted_items = []

        for item_data in items:
            product_id = int(item_data.get("product_id"))
            quantity = int(item_data.get("quantity_ordered", 0))
            unit_price = float(item_data.get("unit_price", 0))

            # Check if product exists
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            if not product:
                continue

            # Create order item
            new_order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=product_id,
                quantity=quantity,
                price=unit_price
            )
            db.add(new_order_item)
            db.flush()

            # Update total price
            total_price += quantity * unit_price

            # Format item for response
            formatted_item = {
                "id": f"SI-{new_order_item.id}",
                "shipment_id": f"SH-{new_shipment.id}",
                "product_id": str(product_id),
                "product_name": product.name,
                "quantity_ordered": quantity,
                "quantity_received": None,
                "unit_price": unit_price,
                "warehouse_id": item_data.get("warehouse_id", "1"),
                "is_received": False
            }
            formatted_items.append(formatted_item)

        # Update order total price
        new_order.total_price = total_price
        db.commit()

        # Return formatted shipment data
        result = {
            "id": f"SH-{new_shipment.id}",
            "supplier": supplier,
            "shipment_date": current_time.isoformat(),
            "expected_arrival_date": new_shipment.estimated_delivery.isoformat() if new_shipment.estimated_delivery else None,
            "actual_arrival_date": None,
            "status": shipment_data.get("status", "planned"),
            "reference_number": reference_number,
            "created_by": username,
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
            "notes": shipment_data.get("notes", ""),
            "items": formatted_items
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create shipment: {str(e)}")


# PUT and PATCH endpoints
@router.put("/products/{product_id}", response_model=Dict[str, Any])
def update_product(product_id: str, product_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a product"""
    try:
        # Convert string ID to integer
        product_id_int = int(product_id)

        # Find the product
        product = db.query(models.Product).filter(models.Product.id == product_id_int).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Update product fields
        if "name" in product_data:
            product.name = product_data["name"]

        if "category_id" in product_data:
            product.category_id = int(product_data["category_id"])

        if "price" in product_data:
            product.price = float(product_data["price"])

        if "description" in product_data:
            product.description = product_data["description"]

        db.commit()
        db.refresh(product)

        # Return updated product
        category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
        category_name = category.name if category else "Unknown"

        result = {
            "id": str(product.id),
            "sku": f"SKU-{product.id:04d}",
            "name": product.name,
            "category_id": str(product.category_id),
            "category_name": category_name,
            "unit": "кг",
            "price": product.price,
            "is_active": True,
            "created_at": product.created_at.isoformat() if product.created_at else datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "supplier": product_data.get("supplier", "Default Supplier"),
            "image_url": f"/images/products/SKU-{product.id:04d}.jpg",
            "sr_sync": product_data.get("sr_sync", False),
            "sr_stock_quantity": product_data.get("sr_stock_quantity", 0)
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update product: {str(e)}")


@router.patch("/stocks/{stock_id}", response_model=Dict[str, Any])
def patch_stock(stock_id: str, stock_data: Dict[str, Any], request: Request, db: Session = Depends(get_db)):
    """Partially update a stock entry"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')

        # Convert string ID to integer
        stock_id_int = int(stock_id)

        # Find the stock
        stock = db.query(models.Stock).filter(models.Stock.id == stock_id_int).first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")

        # Update stock fields
        if "quantity" in stock_data:
            stock.quantity = int(stock_data["quantity"])

        current_time = datetime.now()
        stock.updated_at = current_time
        db.commit()
        db.refresh(stock)

        # Determine status
        min_quantity = stock_data.get("minimum_quantity", 30)
        status = "in-stock"
        if stock.quantity <= 0:
            status = "out-of-stock"
        elif stock.quantity < min_quantity:
            status = "low-stock"

        # Get product and warehouse
        product = db.query(models.Product).filter(models.Product.id == stock.product_id).first()
        warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == stock.warehouse_id).first()

        # Return updated stock
        result = {
            "id": str(stock.id),
            "product_id": str(stock.product_id),
            "product_name": product.name if product else "Unknown Product",
            "warehouse_id": str(stock.warehouse_id),
            "warehouse_name": warehouse.name if warehouse else "Unknown Warehouse",
            "quantity": stock.quantity,
            "minimum_quantity": min_quantity,
            "reorder_level": stock_data.get("reorder_level", 50),
            "quantity_reserved": 0,
            "last_count_date": stock.updated_at.isoformat(),
            "last_counted_by": stock_data.get("last_counted_by", username),
            "status": status
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update stock: {str(e)}")


@router.patch("/shipments/{shipment_id}", response_model=Dict[str, Any])
def patch_shipment(shipment_id: str, shipment_data: Dict[str, Any], request: Request, db: Session = Depends(get_db)):
    """Partially update a shipment"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')

        # Extract numeric ID from shipment_id (format: "SH-12345")
        if shipment_id.startswith("SH-"):
            shipment_id = shipment_id[3:]

        shipment_id_int = int(shipment_id)

        # Find the shipment
        shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id_int).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Update shipment fields
        if "status" in shipment_data:
            shipment.status = reverse_convert_shipment_status(shipment_data["status"])

        if "actual_arrival_date" in shipment_data and shipment_data["actual_arrival_date"]:
            shipment.estimated_delivery = datetime.fromisoformat(shipment_data["actual_arrival_date"])

        db.commit()
        db.refresh(shipment)

        current_time = datetime.now()

        # Format response
        # Get shipment items
        items = []
        if shipment.order and shipment.order.items:
            for order_item in shipment.order.items:
                item = {
                    "id": f"SI-{order_item.id}",
                    "shipment_id": f"SH-{shipment.id}",
                    "product_id": str(order_item.product_id),
                    "product_name": order_item.product.name,
                    "quantity_ordered": order_item.quantity,
                    "quantity_received": order_item.quantity if shipment.status == "delivered" else None,
                    "unit_price": order_item.price,
                    "warehouse_id": "1",  # Default warehouse ID
                    "is_received": shipment.status == "delivered",
                    "received_date": shipment.estimated_delivery.isoformat() if shipment.status == "delivered" and shipment.estimated_delivery else None
                }
                items.append(item)

        result = {
            "id": f"SH-{shipment.id}",
            "supplier": shipment.order.client_name if shipment.order else "Default Supplier",
            "shipment_date": shipment.created_at.isoformat() if shipment.created_at else datetime.now().isoformat(),
            "expected_arrival_date": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
            "actual_arrival_date": shipment.estimated_delivery.isoformat() if shipment.status == "delivered" and shipment.estimated_delivery else None,
            "status": convert_shipment_status(shipment.status),
            "reference_number": f"PO-2025-{shipment.id:03d}",
            "created_by": username,
            "created_at": shipment.created_at.isoformat() if shipment.created_at else datetime.now().isoformat(),
            "updated_at": current_time.isoformat(),
            "notes": "",
            "items": items
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update shipment: {str(e)}")


@router.patch("/shipment-items/{item_id}", response_model=Dict[str, Any])
def patch_shipment_item(item_id: str, item_data: Dict[str, Any], request: Request, db: Session = Depends(get_db)):
    """Partially update a shipment item"""
    try:
        # Попытка получения имени пользователя из запроса
        current_user = None
        try:
            current_user = request.state.user
        except:
            current_user = None

        # Имя пользователя по умолчанию, если не удалось получить из request
        username = getattr(current_user, 'username', 'katarymba')
        user_id = getattr(current_user, 'id', 1)

        # Extract numeric ID from item_id (format: "SI-12345")
        if item_id.startswith("SI-"):
            item_id = item_id[3:]

        item_id_int = int(item_id)

        # Find the order item
        order_item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id_int).first()
        if not order_item:
            raise HTTPException(status_code=404, detail="Shipment item not found")

        # Update quantity received if specified
        if "quantity_received" in item_data:
            order_item.quantity = int(item_data["quantity_received"])

        current_time = datetime.now()

        # If item is received, update the product's stock
        if "is_received" in item_data and item_data["is_received"]:
            warehouse_id = int(item_data.get("warehouse_id", 1))

            # Find or create stock entry
            stock = db.query(models.Stock).filter(
                models.Stock.product_id == order_item.product_id,
                models.Stock.warehouse_id == warehouse_id
            ).first()

            if stock:
                # Update existing stock
                stock.quantity += order_item.quantity
            else:
                # Create new stock entry
                stock = models.Stock(
                    product_id=order_item.product_id,
                    warehouse_id=warehouse_id,
                    quantity=order_item.quantity,
                    updated_at=current_time
                )
                db.add(stock)

            # Create stock movement record
            movement = models.StockMovement(
                product_id=order_item.product_id,
                warehouse_id=warehouse_id,
                quantity=order_item.quantity,
                movement_type="receipt",
                created_at=current_time,
                created_by_id=user_id,
                note=f"Receipt from shipment order #{order_item.order_id}"
            )
            db.add(movement)

            # Update shipment status if it has one
            if order_item.order and order_item.order.shipments:
                for shipment in order_item.order.shipments:
                    if shipment.status != "delivered":
                        shipment.status = "delivered"
                        shipment.estimated_delivery = current_time

        db.commit()
        db.refresh(order_item)

        # Format response
        result = {
            "id": f"SI-{order_item.id}",
            "shipment_id": f"SH-{order_item.order.shipments[0].id}" if order_item.order and order_item.order.shipments else "",
            "product_id": str(order_item.product_id),
            "product_name": order_item.product.name if order_item.product else "Unknown Product",
            "quantity_ordered": order_item.quantity,
            "quantity_received": order_item.quantity if item_data.get("is_received", False) else None,
            "unit_price": order_item.price,
            "warehouse_id": item_data.get("warehouse_id", "1"),
            "is_received": item_data.get("is_received", False),
            "received_date": current_time.isoformat() if item_data.get("is_received", False) else None,
            "notes": item_data.get("notes", "")
        }

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update shipment item: {str(e)}")


# Helper functions
def convert_shipment_status(status: str) -> str:
    """Convert internal shipment status to frontend status"""
    status_map = {
        "pending": "planned",
        "processing": "in-transit",
        "shipped": "in-transit",
        "delivered": "received",
        "cancelled": "cancelled"
    }
    return status_map.get(status, "planned")


def reverse_convert_shipment_status(status: str) -> str:
    """Convert frontend status to internal shipment status"""
    status_map = {
        "planned": "pending",
        "in-transit": "shipped",
        "received": "delivered",
        "processed": "delivered",
        "cancelled": "cancelled"
    }
    return status_map.get(status, "pending")