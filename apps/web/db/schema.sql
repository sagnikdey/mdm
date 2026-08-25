-- MVP schema: VARCHAR business keys matching convenience-store-mdm-sample.json

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS store_product_availability CASCADE;
DROP TABLE IF EXISTS store_vendor_relationships CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS operating_hours CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
    category_id VARCHAR(20) PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    parent_category_id VARCHAR(20) REFERENCES categories(category_id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
    vendor_id VARCHAR(20) PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    payment_terms VARCHAR(50),
    minimum_order_quantity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_vendors_active ON vendors(is_active);

CREATE TABLE stores (
    store_id VARCHAR(20) PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    region VARCHAR(100),
    store_type VARCHAR(50) NOT NULL,
    square_footage INT,
    manager VARCHAR(255),
    manager_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_active ON stores(is_active);

CREATE TABLE operating_hours (
    hours_id SERIAL PRIMARY KEY,
    store_id VARCHAR(20) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    day_name VARCHAR(20) NOT NULL,
    hours VARCHAR(50) NOT NULL,
    UNIQUE(store_id, day_name)
);

CREATE TABLE products (
    sku VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(128),
    manufacturer VARCHAR(255),
    category_id VARCHAR(20) NOT NULL REFERENCES categories(category_id),
    vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
    vendor_sku VARCHAR(100) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50),
    units_per_case INT DEFAULT 1,
    wholesale_price DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(8, 3),
    weight_unit VARCHAR(8) NOT NULL DEFAULT 'lb',
    barcode VARCHAR(50),
    pack_type VARCHAR(16) NOT NULL DEFAULT 'case',
    pack_size INT NOT NULL DEFAULT 1,
    base_unit_sku VARCHAR(50) REFERENCES products(sku) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE UNIQUE INDEX products_vendor_sku_unique ON products (vendor_id, vendor_sku);
CREATE UNIQUE INDEX products_vendor_barcode_unique
  ON products (vendor_id, barcode)
  WHERE barcode IS NOT NULL AND barcode <> '';

CREATE TABLE store_vendor_relationships (
    relationship_id VARCHAR(20) PRIMARY KEY,
    store_id VARCHAR(20) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    vendor_representative VARCHAR(255),
    vendor_phone VARCHAR(20),
    delivery_frequency VARCHAR(100),
    delivery_days JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, vendor_id)
);

CREATE INDEX idx_store_vendor_store ON store_vendor_relationships(store_id);
CREATE INDEX idx_store_vendor_vendor ON store_vendor_relationships(vendor_id);

CREATE TABLE store_product_availability (
    availability_id VARCHAR(20) PRIMARY KEY,
    store_id VARCHAR(20) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    retail_price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 100,
    reorder_point INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, sku)
);

CREATE INDEX idx_availability_store ON store_product_availability(store_id);
CREATE INDEX idx_availability_sku ON store_product_availability(sku);

CREATE TABLE inventory (
    inventory_id VARCHAR(20) PRIMARY KEY,
    store_id VARCHAR(20) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku) ON DELETE RESTRICT,
    current_quantity INT DEFAULT 0,
    unit_of_measure VARCHAR(50),
    last_count_date DATE,
    next_count_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, sku)
);

CREATE INDEX idx_inventory_store ON inventory(store_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
