package com.nf.ais.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/warehouse")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WarehouseController {

    // Временные хранилища данных (в реальном приложении будет использоваться база данных)
    private List<Map<String, Object>> products = new ArrayList<>();
    private List<Map<String, Object>> stocks = new ArrayList<>();
    private List<Map<String, Object>> warehouses = new ArrayList<>();
    private List<Map<String, Object>> categories = new ArrayList<>();
    private List<Map<String, Object>> shipments = new ArrayList<>();
    private List<Map<String, Object>> stockMovements = new ArrayList<>();

    // Инициализация данными при запуске
    public WarehouseController() {
        initializeMockData();
    }

    private void initializeMockData() {
        // Инициализация категорий
        initializeCategories();
        
        // Инициализация складов
        initializeWarehouses();
        
        // Инициализация товаров
        initializeProducts();
        
        // Инициализация складских запасов
        initializeStocks();
        
        // Инициализация поставок
        initializeShipments();
        
        // Инициализация движений товаров
        initializeStockMovements();
    }

    private void initializeCategories() {
        categories.add(createCategory("1", "Свежая рыба", true));
        categories.add(createCategory("2", "Замороженная рыба", true));
        categories.add(createCategory("3", "Морепродукты", true));
        categories.add(createCategory("4", "Консервы", true));
        categories.add(createCategory("5", "Икра", true));
        categories.add(createCategory("6", "Копчёности", true));
        categories.add(createCategory("7", "Соленья", true));
    }

    private Map<String, Object> createCategory(String id, String name, boolean isActive) {
        Map<String, Object> category = new HashMap<>();
        category.put("id", id);
        category.put("name", name);
        category.put("is_active", isActive);
        category.put("created_at", "2024-01-01T00:00:00Z");
        category.put("updated_at", "2024-01-01T00:00:00Z");
        return category;
    }

    private void initializeWarehouses() {
        warehouses.add(createWarehouse("1", "Основной склад", "general", true));
        warehouses.add(createWarehouse("2", "Холодильник 1", "fridge", true));
        warehouses.add(createWarehouse("3", "Холодильник 2", "fridge", true));
        warehouses.add(createWarehouse("4", "Морозильная камера", "freezer", true));
        warehouses.add(createWarehouse("5", "Витрина", "display", true));
        warehouses.add(createWarehouse("6", "Внешний склад", "external", false));
    }

    private Map<String, Object> createWarehouse(String id, String name, String type, boolean isActive) {
        Map<String, Object> warehouse = new HashMap<>();
        warehouse.put("id", id);
        warehouse.put("name", name);
        warehouse.put("type", type);
        warehouse.put("is_active", isActive);
        return warehouse;
    }

    private void initializeProducts() {
        products.add(createProduct("1", "FR-001", "Лосось атлантический свежий", "1", "Свежая рыба", "кг", 1200, true, "СеверМорПродукт", true, 170));
        products.add(createProduct("2", "FR-002", "Дорада свежая", "1", "Свежая рыба", "кг", 980, true, "МореПродукт", true, 45));
        products.add(createProduct("3", "FR-003", "Сибас свежий", "1", "Свежая рыба", "кг", 950, true, "МореПродукт", false, 0));
        products.add(createProduct("4", "FZ-001", "Треска филе замороженное", "2", "Замороженная рыба", "кг", 680, true, "АтлантикФиш", true, 230));
        products.add(createProduct("5", "FZ-002", "Минтай филе замороженное", "2", "Замороженная рыба", "кг", 420, true, "ТихоокеанскийУлов", true, 190));
        products.add(createProduct("6", "SF-001", "Креветки тигровые очищенные", "3", "Морепродукты", "кг", 1350, true, "КамчатскийКраб", true, 50));
        products.add(createProduct("7", "SF-002", "Гребешок морской", "3", "Морепродукты", "кг", 1680, true, "ДальневосточныеДеликатесы", false, 0));
        products.add(createProduct("8", "SF-003", "Мидии в раковине", "3", "Морепродукты", "кг", 950, true, "МореПродукт", false, 0));
        products.add(createProduct("9", "CN-001", "Тунец консервированный в собственном соку", "4", "Консервы", "шт", 210, true, "АтлантикФиш", true, 450));
        products.add(createProduct("10", "CV-001", "Икра лососевая зернистая", "5", "Икра", "кг", 5800, true, "ДальневосточныеДеликатесы", true, 10));
    }

    private Map<String, Object> createProduct(String id, String sku, String name, String categoryId, String categoryName, 
                                             String unit, double price, boolean isActive, String supplier, 
                                             boolean srSync, int srStockQuantity) {
        Map<String, Object> product = new HashMap<>();
        product.put("id", id);
        product.put("sku", sku);
        product.put("name", name);
        product.put("category_id", categoryId);
        product.put("category_name", categoryName);
        product.put("unit", unit);
        product.put("price", price);
        product.put("is_active", isActive);
        product.put("created_at", "2024-01-10T00:00:00Z");
        product.put("updated_at", "2025-04-16T09:23:45Z");
        product.put("supplier", supplier);
        product.put("image_url", "/images/products/" + sku.toLowerCase() + ".jpg");
        product.put("sr_sync", srSync);
        product.put("sr_stock_quantity", srStockQuantity);
        return product;
    }

    private void initializeStocks() {
        stocks.add(createStock("1", "1", "Лосось атлантический свежий", "2", "Холодильник 1", 154, 50, 70, "in-stock"));
        stocks.add(createStock("2", "2", "Дорада свежая", "2", "Холодильник 1", 42, 30, 40, "in-stock"));
        stocks.add(createStock("3", "3", "Сибас свежий", "2", "Холодильник 1", 28, 30, 40, "low-stock"));
        stocks.add(createStock("4", "4", "Треска филе замороженное", "4", "Морозильная камера", 220, 100, 120, "in-stock"));
        stocks.add(createStock("5", "5", "Минтай филе замороженное", "4", "Морозильная камера", 185, 80, 100, "in-stock"));
        stocks.add(createStock("6", "6", "Креветки тигровые очищенные", "4", "Морозильная камера", 45, 30, 40, "in-stock"));
        stocks.add(createStock("7", "7", "Гребешок морской", "3", "Холодильник 2", 12, 20, 25, "low-stock"));
        stocks.add(createStock("8", "8", "Мидии в раковине", "3", "Холодильник 2", 0, 25, 35, "out-of-stock"));
        stocks.add(createStock("9", "9", "Тунец консервированный в собственном соку", "1", "Основной склад", 432, 150, 200, "in-stock"));
        stocks.add(createStock("10", "10", "Икра лососевая зернистая", "2", "Холодильник 1", 8, 15, 20, "low-stock"));
    }

    private Map<String, Object> createStock(String id, String productId, String productName, String warehouseId, 
                                           String warehouseName, int quantity, int minQuantity, int reorderLevel, 
                                           String status) {
        Map<String, Object> stock = new HashMap<>();
        stock.put("id", id);
        stock.put("product_id", productId);
        stock.put("product_name", productName);
        stock.put("warehouse_id", warehouseId);
        stock.put("warehouse_name", warehouseName);
        stock.put("quantity", quantity);
        stock.put("minimum_quantity", minQuantity);
        stock.put("reorder_level", reorderLevel);
        stock.put("quantity_reserved", 0);
        stock.put("last_count_date", "2025-04-16T09:23:45Z");
        stock.put("last_counted_by", "Иванов А.П.");
        stock.put("status", status);
        return stock;
    }

    private void initializeShipments() {
        // Создаем поставки
        Map<String, Object> shipment1 = createShipment("SH-2025-0415", "СеверМорПродукт", "2025-04-15T10:00:00Z", 
                                                     "2025-04-15T10:00:00Z", "2025-04-15T10:15:00Z", "received", 
                                                     "PO-2025-042", "Иванов А.П.");
        
        Map<String, Object> shipment2 = createShipment("SH-2025-0416", "КамчатскийКраб", "2025-04-16T08:30:00Z", 
                                                     "2025-04-16T08:30:00Z", "2025-04-16T08:45:00Z", "received", 
                                                     "PO-2025-043", "Сидоров И.В.");
        
        Map<String, Object> shipment3 = createShipment("SH-2025-0417", "МореПродукт", "2025-04-17T09:00:00Z", 
                                                     "2025-04-17T09:00:00Z", null, "planned", 
                                                     "PO-2025-044", "Петрова М.С.");
        
        Map<String, Object> shipment4 = createShipment("SH-2025-0418", "ДальневосточныеДеликатесы", "2025-04-18T11:30:00Z", 
                                                     "2025-04-18T11:30:00Z", null, "in-transit", 
                                                     "PO-2025-045", "Смирнова Т.А.");
        
        // Добавляем элементы в поставки
        List<Map<String, Object>> items1 = new ArrayList<>();
        items1.add(createShipmentItem("SI-001", "SH-2025-0415", "1", "Лосось атлантический свежий", 80, 80, 1150, "2", true));
        items1.add(createShipmentItem("SI-002", "SH-2025-0415", "3", "Сибас свежий", 50, 48, 930, "2", true));
        shipment1.put("items", items1);
        
        List<Map<String, Object>> items2 = new ArrayList<>();
        items2.add(createShipmentItem("SI-003", "SH-2025-0416", "6", "Креветки тигровые очищенные", 30, 30, 1320, "4", true));
        items2.add(createShipmentItem("SI-004", "SH-2025-0416", "7", "Гребешок морской", 15, 15, 1650, "3", true));
        shipment2.put("items", items2);
        
        List<Map<String, Object>> items3 = new ArrayList<>();
        items3.add(createShipmentItem("SI-005", "SH-2025-0417", "2", "Дорада свежая", 40, null, 970, "2", false));
        items3.add(createShipmentItem("SI-006", "SH-2025-0417", "8", "Мидии в раковине", 35, null, 940, "3", false));
        shipment3.put("items", items3);
        
        List<Map<String, Object>> items4 = new ArrayList<>();
        items4.add(createShipmentItem("SI-007", "SH-2025-0418", "10", "Икра лососевая зернистая", 12, null, 5700, "2", false));
        shipment4.put("items", items4);
        
        shipments.add(shipment1);
        shipments.add(shipment2);
        shipments.add(shipment3);
        shipments.add(shipment4);
    }

    private Map<String, Object> createShipment(String id, String supplier, String shipmentDate, 
                                              String expectedArrivalDate, String actualArrivalDate, 
                                              String status, String referenceNumber, String createdBy) {
        Map<String, Object> shipment = new HashMap<>();
        shipment.put("id", id);
        shipment.put("supplier", supplier);
        shipment.put("shipment_date", shipmentDate);
        shipment.put("expected_arrival_date", expectedArrivalDate);
        shipment.put("actual_arrival_date", actualArrivalDate);
        shipment.put("status", status);
        shipment.put("reference_number", referenceNumber);
        shipment.put("created_by", createdBy);
        shipment.put("created_at", "2025-04-15T09:00:00Z");
        shipment.put("updated_at", "2025-04-16T08:45:00Z");
        shipment.put("notes", "");
        return shipment;
    }

    private Map<String, Object> createShipmentItem(String id, String shipmentId, String productId, 
                                                 String productName, int quantityOrdered, Integer quantityReceived, 
                                                 double unitPrice, String warehouseId, boolean isReceived) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("shipment_id", shipmentId);
        item.put("product_id", productId);
        item.put("product_name", productName);
        item.put("quantity_ordered", quantityOrdered);
        item.put("quantity_received", quantityReceived);
        item.put("unit_price", unitPrice);
        item.put("warehouse_id", warehouseId);
        item.put("is_received", isReceived);
        if (isReceived) {
            item.put("received_date", "2025-04-16T08:45:00Z");
        }
        return item;
    }

    private void initializeStockMovements() {
        stockMovements.add(createStockMovement("SM-001", "1", "Лосось атлантический свежий", "2", "Холодильник 1", 
                                              -2, 156, "adjustment", null, null, "Иванов А.П.", 
                                              "Корректировка после проверки фактического наличия"));
        
        stockMovements.add(createStockMovement("SM-002", "3", "Сибас свежий", "2", "Холодильник 1", 
                                              2, 26, "adjustment", null, null, "Петрова М.С.", 
                                              "Обнаружены неучтенные позиции при пересчете"));
        
        stockMovements.add(createStockMovement("SM-003", "7", "Гребешок морской", "3", "Холодильник 2", 
                                              -3, 15, "adjustment", null, null, "Иванов А.П.", 
                                              "Списание некондиционного товара"));
        
        stockMovements.add(createStockMovement("SM-004", "4", "Треска филе замороженное", "4", "Морозильная камера", 
                                              20, 200, "receipt", "SH-2025-0414", "shipment", "Сидоров И.В.", 
                                              "Приемка новой партии"));
        
        stockMovements.add(createStockMovement("SM-005", "5", "Минтай филе замороженное", "4", "Морозильная камера", 
                                              -5, 190, "adjustment", null, null, "Сидоров И.В.", 
                                              "Корректировка после проверки фактического наличия"));
        
        stockMovements.add(createStockMovement("SM-006", "6", "Креветки тигровые очищенные", "4", "Морозильная камера", 
                                              30, 15, "receipt", "SH-2025-0416", "shipment", "Сидоров И.В.", 
                                              "Приемка товара от поставщика \"КамчатскийКраб\""));
    }

    private Map<String, Object> createStockMovement(String id, String productId, String productName, String warehouseId, 
                                                  String warehouseName, int quantity, int previousQuantity, 
                                                  String movementType, String referenceId, String referenceType, 
                                                  String performedBy, String notes) {
        Map<String, Object> movement = new HashMap<>();
        movement.put("id", id);
        movement.put("product_id", productId);
        movement.put("product_name", productName);
        movement.put("warehouse_id", warehouseId);
        movement.put("warehouse_name", warehouseName);
        movement.put("quantity", quantity);
        movement.put("previous_quantity", previousQuantity);
        movement.put("movement_type", movementType);
        movement.put("reference_id", referenceId);
        movement.put("reference_type", referenceType);
        movement.put("performed_by", performedBy);
        movement.put("movement_date", "2025-04-16T09:23:45Z");
        movement.put("notes", notes);
        return movement;
    }

    // API эндпоинты
    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        return ResponseEntity.ok(products);
    }

    @GetMapping("/stocks")
    public ResponseEntity<List<Map<String, Object>>> getStocks() {
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<Map<String, Object>>> getWarehouses() {
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/shipments")
    public ResponseEntity<List<Map<String, Object>>> getShipments() {
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/stock-movements")
    public ResponseEntity<List<Map<String, Object>>> getStockMovements() {
        return ResponseEntity.ok(stockMovements);
    }

    // Эндпоинты для создания новых записей
    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Map<String, Object> productData) {
        String id = UUID.randomUUID().toString();
        productData.put("id", id);
        
        // Находим название категории
        String categoryId = (String) productData.get("category_id");
        for (Map<String, Object> category : categories) {
            if (category.get("id").equals(categoryId)) {
                productData.put("category_name", category.get("name"));
                break;
            }
        }
        
        products.add(productData);
        return ResponseEntity.ok(productData);
    }

    @PostMapping("/stocks")
    public ResponseEntity<Map<String, Object>> createStock(@RequestBody Map<String, Object> stockData) {
        String id = UUID.randomUUID().toString();
        stockData.put("id", id);
        
        // Находим название продукта и склада
        String productId = (String) stockData.get("product_id");
        String warehouseId = (String) stockData.get("warehouse_id");
        
        for (Map<String, Object> product : products) {
            if (product.get("id").equals(productId)) {
                stockData.put("product_name", product.get("name"));
                break;
            }
        }
        
        for (Map<String, Object> warehouse : warehouses) {
            if (warehouse.get("id").equals(warehouseId)) {
                stockData.put("warehouse_name", warehouse.get("name"));
                break;
            }
        }
        
        stocks.add(stockData);
        return ResponseEntity.ok(stockData);
    }

    @PostMapping("/shipments")
    public ResponseEntity<Map<String, Object>> createShipment(@RequestBody Map<String, Object> shipmentData) {
        String id = "SH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MMdd-HHmmss"));
        shipmentData.put("id", id);
        
        // Обработка элементов поставки
        if (shipmentData.containsKey("items")) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) shipmentData.get("items");
            for (Map<String, Object> item : items) {
                String itemId = "SI-" + UUID.randomUUID().toString().substring(0, 8);
                item.put("id", itemId);
                item.put("shipment_id", id);
                
                // Находим название продукта
                String productId = (String) item.get("product_id");
                for (Map<String, Object> product : products) {
                    if (product.get("id").equals(productId)) {
                        item.put("product_name", product.get("name"));
                        break;
                    }
                }
            }
        }
        
        shipments.add(shipmentData);
        return ResponseEntity.ok(shipmentData);
    }

    @PostMapping("/stock-movements")
    public ResponseEntity<Map<String, Object>> createStockMovement(@RequestBody Map<String, Object> movementData) {
        String id = "SM-" + UUID.randomUUID().toString().substring(0, 8);
        movementData.put("id", id);
        
        // Находим название продукта и склада
        String productId = (String) movementData.get("product_id");
        String warehouseId = (String) movementData.get("warehouse_id");
        
        for (Map<String, Object> product : products) {
            if (product.get("id").equals(productId)) {
                movementData.put("product_name", product.get("name"));
                break;
            }
        }
        
        for (Map<String, Object> warehouse : warehouses) {
            if (warehouse.get("id").equals(warehouseId)) {
                movementData.put("warehouse_name", warehouse.get("name"));
                break;
            }
        }
        
        stockMovements.add(movementData);
        return ResponseEntity.ok(movementData);
    }
    
    // Эндпоинты для обновления записей
    @PutMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> productData) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).get("id").equals(id)) {
                Map<String, Object> existingProduct = products.get(i);
                existingProduct.putAll(productData);
                return ResponseEntity.ok(existingProduct);
            }
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/stocks/{id}")
    public ResponseEntity<Map<String, Object>> updateStock(@PathVariable String id, @RequestBody Map<String, Object> stockData) {
        for (int i = 0; i < stocks.size(); i++) {
            if (stocks.get(i).get("id").equals(id)) {
                Map<String, Object> existingStock = stocks.get(i);
                existingStock.putAll(stockData);
                return ResponseEntity.ok(existingStock);
            }
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/stocks/{id}")
    public ResponseEntity<Map<String, Object>> patchStock(@PathVariable String id, @RequestBody Map<String, Object> stockData) {
        for (int i = 0; i < stocks.size(); i++) {
            if (stocks.get(i).get("id").equals(id)) {
                Map<String, Object> existingStock = stocks.get(i);
                stockData.forEach((key, value) -> {
                    if (value != null) {
                        existingStock.put(key, value);
                    }
                });
                return ResponseEntity.ok(existingStock);
            }
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/shipments/{id}")
    public ResponseEntity<Map<String, Object>> patchShipment(@PathVariable String id, @RequestBody Map<String, Object> shipmentData) {
        for (int i = 0; i < shipments.size(); i++) {
            if (shipments.get(i).get("id").equals(id)) {
                Map<String, Object> existingShipment = shipments.get(i);
                shipmentData.forEach((key, value) -> {
                    if (value != null) {
                        existingShipment.put(key, value);
                    }
                });
                return ResponseEntity.ok(existingShipment);
            }
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/shipment-items/{id}")
    public ResponseEntity<Map<String, Object>> patchShipmentItem(@PathVariable String id, @RequestBody Map<String, Object> itemData) {
        for (Map<String, Object> shipment : shipments) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) shipment.get("items");
            if (items != null) {
                for (Map<String, Object> item : items) {
                    if (item.get("id").equals(id)) {
                        itemData.forEach((key, value) -> {
                            if (value != null) {
                                item.put(key, value);
                            }
                        });
                        return ResponseEntity.ok(item);
                    }
                }
            }
        }
        return ResponseEntity.notFound().build();
    }
}