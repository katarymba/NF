// warehouse/interfaces.ts

export const SHIPMENT_STATUSES = {
  PLANNED: 'PLANNED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  PROCESSED: 'PROCESSED',
  CANCELLED: 'CANCELLED'
};

export interface Product {
  id: number;
  sku: string; // Артикул/код товара
  name: string;
  description?: string;
  category_id: number;
  category_name: string; // Название категории для отображения
  unit: string;
  price: number;
  tax_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  supplier?: string;
  image_url?: string;
  sr_stock_quantity?: number; // Количество по данным Север-Рыба
  sr_sync?: boolean; // Флаг синхронизации с Север-Рыбой
}

export interface StockItem {
  id: string;
  product_id: string;
  product_name: string; // Для отображения
  warehouse_id: string;
  warehouse_name: string; // Для отображения
  quantity: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  reorder_level: number;
  quantity_reserved?: number;
  last_count_date?: string;
  last_counted_by?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'over-stock';
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  city?: string;
  is_active: boolean;
  type: string; // Тип склада (основной, холодильник, морозильник и т.д.)
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  previous_quantity: number;
  movement_type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  reference_id?: string;
  reference_type?: string;
  performed_by: string;
  movement_date: string;
  notes?: string;
}

export interface Shipment {
  id?: string;
  reference_number?: string;
  supplier_id: number;
  supplier?: string;
  warehouse_id?: string;
  shipment_date: string;
  expected_arrival_date?: string;
  actual_arrival_date?: string;
  status: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: ShipmentItem[];
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  warehouse_id: string;
  is_received: boolean;
  received_date?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  parent_name?: string;
}

export interface ProductFilter {
  search: string;
  category_id: string;
  status: string;
  supplier: string;
  warehouse_id: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}