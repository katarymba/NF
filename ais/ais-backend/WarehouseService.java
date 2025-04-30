package com.nf.ais.service;

import com.nf.ais.model.*;
import com.nf.ais.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class WarehouseService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockItemRepository stockItemRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ShipmentRepository shipmentRepository;
    
    @Autowired
    private ShipmentItemRepository shipmentItemRepository;
    
    @Autowired
    private StockMovementRepository stockMovementRepository;

    // Методы для получения данных
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<StockItem> getAllStocks() {
        return stockItemRepository.findAll();
    }
    
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }
    
    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAll();
    }

    // Методы для создания новых данных
    public Product createProduct(Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            product.setId(UUID.randomUUID().toString());
        }
        if (product.getCreated_at() == null) {
            product.setCreated_at(LocalDateTime.now().toString());
        }
        if (product.getUpdated_at() == null) {
            product.setUpdated_at(LocalDateTime.now().toString());
        }
        
        // Установка имени категории
        if (product.getCategory_id() != null) {
            categoryRepository.findById(product.getCategory_id())
                    .ifPresent(category -> product.setCategory_name(category.getName()));
        }
        
        return productRepository.save(product);
    }
    
    public StockItem createStock(StockItem stockItem) {
        if (stockItem.getId() == null || stockItem.getId().isEmpty()) {
            stockItem.setId(UUID.randomUUID().toString());
        }
        
        // Установка имени продукта и склада
        if (stockItem.getProduct_id() != null) {
            productRepository.findById(stockItem.getProduct_id())
                    .ifPresent(product -> stockItem.setProduct_name(product.getName()));
        }
        
        if (stockItem.getWarehouse_id() != null) {
            warehouseRepository.findById(stockItem.getWarehouse_id())
                    .ifPresent(warehouse -> stockItem.setWarehouse_name(warehouse.getName()));
        }
        
        // Установка статуса на основе количества
        if (stockItem.getQuantity() <= 0) {
            stockItem.setStatus("out-of-stock");
        } else if (stockItem.getQuantity() < stockItem.getMinimum_quantity()) {
            stockItem.setStatus("low-stock");
        } else {
            stockItem.setStatus("in-stock");
        }
        
        return stockItemRepository.save(stockItem);
    }
    
    public Shipment createShipment(Shipment shipment) {
        if (shipment.getId() == null || shipment.getId().isEmpty()) {
            shipment.setId("SH-" + LocalDateTime.now().toString().replaceAll("[^0-9]", "").substring(0, 8));
        }
        
        if (shipment.getCreated_at() == null) {
            shipment.setCreated_at(LocalDateTime.now().toString());
        }
        
        if (shipment.getUpdated_at() == null) {
            shipment.setUpdated_at(LocalDateTime.now().toString());
        }
        
        // Сохранение поставки
        Shipment savedShipment = shipmentRepository.save(shipment);
        
        // Сохранение элементов поставки
        if (shipment.getItems() != null) {
            for (ShipmentItem item : shipment.getItems()) {
                // Установка связи с поставкой
                item.setShipment_id(savedShipment.getId());
                
                // Установка имени продукта
                if (item.getProduct_id() != null) {
                    productRepository.findById(item.getProduct_id())
                            .ifPresent(product -> item.setProduct_name(product.getName()));
                }
                
                shipmentItemRepository.save(item);
            }
        }
        
        return savedShipment;
    }
    
    public StockMovement createStockMovement(StockMovement stockMovement) {
        if (stockMovement.getId() == null || stockMovement.getId().isEmpty()) {
            stockMovement.setId("SM-" + UUID.randomUUID().toString().substring(0, 8));
        }
        
        if (stockMovement.getMovement_date() == null) {
            stockMovement.setMovement_date(LocalDateTime.now().toString());
        }
        
        // Установка имени продукта и склада
        if (stockMovement.getProduct_id() != null) {
            productRepository.findById(stockMovement.getProduct_id())
                    .ifPresent(product -> stockMovement.setProduct_name(product.getName()));
        }
        
        if (stockMovement.getWarehouse_id() != null) {
            warehouseRepository.findById(stockMovement.getWarehouse_id())
                    .ifPresent(warehouse -> stockMovement.setWarehouse_name(warehouse.getName()));
        }
        
        return stockMovementRepository.save(stockMovement);
    }

    // Методы для обновления данных
    public Product updateProduct(Product product) {
        product.setUpdated_at(LocalDateTime.now().toString());
        
        // Обновление категории, если изменилась
        if (product.getCategory_id() != null) {
            categoryRepository.findById(product.getCategory_id())
                    .ifPresent(category -> product.setCategory_name(category.getName()));
        }
        
        return productRepository.save(product);
    }
    
    public StockItem updateStock(StockItem stockItem) {
        // Обновление имени продукта и склада
        if (stockItem.getProduct_id() != null) {
            productRepository.findById(stockItem.getProduct_id())
                    .ifPresent(product -> stockItem.setProduct_name(product.getName()));
        }
        
        if (stockItem.getWarehouse_id() != null) {
            warehouseRepository.findById(stockItem.getWarehouse_id())
                    .ifPresent(warehouse -> stockItem.setWarehouse_name(warehouse.getName()));
        }
        
        // Обновление статуса на основе количества
        if (stockItem.getQuantity() <= 0) {
            stockItem.setStatus("out-of-stock");
        } else if (stockItem.getQuantity() < stockItem.getMinimum_quantity()) {
            stockItem.setStatus("low-stock");
        } else {
            stockItem.setStatus("in-stock");
        }
        
        return stockItemRepository.save(stockItem);
    }
    
    public StockItem patchStock(String id, Map<String, Object> changes) {
        StockItem stockItem = stockItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StockItem not found with id: " + id));
        
        // Применение изменений
        if (changes.containsKey("quantity")) {
            stockItem.setQuantity(((Number) changes.get("quantity")).intValue());
        }
        
        if (changes.containsKey("minimum_quantity")) {
            stockItem.setMinimum_quantity(((Number) changes.get("minimum_quantity")).intValue());
        }
        
        if (changes.containsKey("reorder_level")) {
            stockItem.setReorder_level(((Number) changes.get("reorder_level")).intValue());
        }
        
        if (changes.containsKey("last_count_date")) {
            stockItem.setLast_count_date((String) changes.get("last_count_date"));
        }
        
        if (changes.containsKey("last_counted_by")) {
            stockItem.setLast_counted_by((String) changes.get("last_counted_by"));
        }
        
        if (changes.containsKey("status")) {
            stockItem.setStatus((String) changes.get("status"));
        } else {
            // Обновление статуса на основе количества
            if (stockItem.getQuantity() <= 0) {
                stockItem.setStatus("out-of-stock");
            } else if (stockItem.getQuantity() < stockItem.getMinimum_quantity()) {
                stockItem.setStatus("low-stock");
            } else {
                stockItem.setStatus("in-stock");
            }
        }
        
        return stockItemRepository.save(stockItem);
    }
    
    public Shipment patchShipment(String id, Map<String, Object> changes) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
        
        // Применение изменений
        if (changes.containsKey("status")) {
            shipment.setStatus((String) changes.get("status"));
        }
        
        if (changes.containsKey("actual_arrival_date")) {
            shipment.setActual_arrival_date((String) changes.get("actual_arrival_date"));
        }
        
        if (changes.containsKey("updated_at")) {
            shipment.setUpdated_at((String) changes.get("updated_at"));
        } else {
            shipment.setUpdated_at(LocalDateTime.now().toString());
        }
        
        return shipmentRepository.save(shipment);
    }
    
    public ShipmentItem patchShipmentItem(String id, Map<String, Object> changes) {
        // Поиск элемента поставки
        Optional<ShipmentItem> optionalItem = shipmentItemRepository.findById(id);
        
        if (!optionalItem.isPresent()) {
            // Поиск через все поставки
            List<Shipment> shipments = shipmentRepository.findAll();
            for (Shipment shipment : shipments) {
                if (shipment.getItems() != null) {
                    for (ShipmentItem item : shipment.getItems()) {
                        if (item.getId().equals(id)) {
                            optionalItem = Optional.of(item);
                            break;
                        }
                    }
                }
                if (optionalItem.isPresent()) {
                    break;
                }
            }
        }
        
        ShipmentItem shipmentItem = optionalItem
                .orElseThrow(() -> new RuntimeException("ShipmentItem not found with id: " + id));
        
        // Применение изменений
        if (changes.containsKey("is_received")) {
            shipmentItem.setIs_received((Boolean) changes.get("is_received"));
        }
        
        if (changes.containsKey("quantity_received")) {
            shipmentItem.setQuantity_received(((Number) changes.get("quantity_received")).intValue());
        }
        
        if (changes.containsKey("received_date")) {
            shipmentItem.setReceived_date((String) changes.get("received_date"));
        }
        
        if (changes.containsKey("notes")) {
            shipmentItem.setNotes((String) changes.get("notes"));
        }
        
        return shipmentItemRepository.save(shipmentItem);
    }
}