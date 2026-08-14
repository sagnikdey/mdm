# Convenience Store MDM - Database Implementation Guide

## Part 1: Database Design & Architecture

### 1.1 Technology Stack Recommendation

**Database**: PostgreSQL 14+ (open-source, ACID-compliant, excellent for complex queries)
**ORM**: Prisma or TypeORM (optional but recommended for type safety with TypeScript)
**API Layer**: Node.js/Express or Next.js API routes
**Connection Pool**: pg-pool for connection management

### 1.2 Database Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                             │
├─────────────────────────────────────────────────────────────┤
│ stores                  vendors                  categories   │
│ ├─ storeId             ├─ vendorId              ├─ categoryId │
│ ├─ storeName           ├─ vendorName            ├─ name       │
│ ├─ location (geo)      ├─ contact info          ├─ parentId   │
│ └─ operatingHours      └─ paymentTerms          └─ metadata   │
│                                                              │
│ products              storeVendorRel         storeProductRel  │
│ ├─ sku               ├─ storeId              ├─ storeId       │
│ ├─ name              ├─ vendorId             ├─ sku           │
│ ├─ categoryId        ├─ deliveryFreq         ├─ retailPrice   │
│ ├─ vendorId          └─ isActive             ├─ minStock      │
│ └─ pricing                                   └─ maxStock      │
│                                                              │
│ inventory            orders                  orderItems       │
│ ├─ inventoryId       ├─ orderId              ├─ orderItemId   │
│ ├─ storeId           ├─ storeId              ├─ orderId       │
│ ├─ sku               ├─ vendorId             ├─ sku           │
│ └─ quantity          ├─ status               ├─ quantity      │
│                      └─ dates                └─ price         │
│                                                              │
│ audit_log           price_history           stock_movements  │
│ ├─ logId            ├─ priceHistoryId       ├─ movementId     │
│ ├─ entity           ├─ sku                  ├─ inventoryId    │
│ ├─ action           ├─ price                ├─ type           │
│ └─ timestamp        └─ effectiveDate        └─ quantity       │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 2: Database Setup & Installation

### 2.1 Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2.2 Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mdm_db;

# Create user with password
CREATE USER mdm_user WITH PASSWORD 'secure_password_123';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mdm_db TO mdm_user;
ALTER ROLE mdm_user CREATEDB;

# Exit psql
\q
```

### 2.3 Connection String

```
postgresql://mdm_user:secure_password_123@localhost:5432/mdm_db
```

Store in `.env.local`:
```
DATABASE_URL="postgresql://mdm_user:secure_password_123@localhost:5432/mdm_db"
```

---

## Part 3: Complete SQL Schema

### 3.1 Create Tables (`schema.sql`)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing tables (for fresh start)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS store_product_availability CASCADE;
DROP TABLE IF EXISTS store_vendor_relationships CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- ===== CORE TABLES =====

-- 1. CATEGORIES TABLE (Hierarchical)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    parent_category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_hierarchy CHECK (category_id != parent_category_id)
);

-- 2. VENDORS TABLE
CREATE TABLE vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    payment_terms VARCHAR(50), -- e.g., "Net 30", "Net 45"
    minimum_order_quantity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0, -- 0-5 stars
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on email and vendor_name for quick lookups
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_vendors_active ON vendors(is_active);

-- 3. STORES TABLE
CREATE TABLE stores (
    store_id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL UNIQUE,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    region VARCHAR(100), -- e.g., "North", "South", "East", "West"
    store_type VARCHAR(50), -- e.g., "standalone", "kiosk", "express"
    manager_name VARCHAR(255),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    square_footage INT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on location and region
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_active ON stores(is_active);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);

-- 4. OPERATING HOURS TABLE (Normalized)
CREATE TABLE operating_hours (
    hours_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    day_of_week INT, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, day_of_week)
);

-- 5. PRODUCTS TABLE
CREATE TABLE products (
    sku VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(category_id),
    vendor_id INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
    vendor_sku VARCHAR(100) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50), -- "case", "unit", "pallet", etc.
    units_per_case INT DEFAULT 1,
    wholesale_price DECIMAL(10, 2) NOT NULL,
    retail_price_base DECIMAL(10, 2),
    weight DECIMAL(8, 3), -- in lbs
    barcode VARCHAR(50) UNIQUE,
    manufacturer VARCHAR(255),
    supplier_code VARCHAR(100),
    expiration_warning_days INT DEFAULT 30, -- Alert if expires within this period
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for product searches
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(is_active);

-- 6. STORE-VENDOR RELATIONSHIPS
CREATE TABLE store_vendor_relationships (
    relationship_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    vendor_id INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    vendor_representative VARCHAR(255),
    vendor_phone VARCHAR(20),
    delivery_frequency VARCHAR(100), -- e.g., "daily", "3x weekly"
    delivery_days JSON, -- ["Monday", "Wednesday", "Friday"]
    lead_time_days INT DEFAULT 2, -- Days to receive after ordering
    payment_method VARCHAR(100), -- "Check", "ACH", "Credit Card"
    account_number VARCHAR(100),
    contract_start_date DATE,
    contract_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, vendor_id)
);

CREATE INDEX idx_store_vendor_store ON store_vendor_relationships(store_id);
CREATE INDEX idx_store_vendor_vendor ON store_vendor_relationships(vendor_id);
CREATE INDEX idx_store_vendor_active ON store_vendor_relationships(is_active);

-- 7. STORE-PRODUCT AVAILABILITY (Pricing & Stocking Rules)
CREATE TABLE store_product_availability (
    availability_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    retail_price DECIMAL(10, 2) NOT NULL,
    wholesale_cost DECIMAL(10, 2), -- Actual cost for this store
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 100,
    reorder_point INT DEFAULT 30, -- Trigger for reordering
    reorder_quantity INT, -- How much to order at once
    is_available BOOLEAN DEFAULT true,
    shelf_location VARCHAR(100), -- e.g., "Aisle 3, Shelf 2"
    promotion_price DECIMAL(10, 2),
    promotion_start_date DATE,
    promotion_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, sku)
);

CREATE INDEX idx_availability_store ON store_product_availability(store_id);
CREATE INDEX idx_availability_sku ON store_product_availability(sku);
CREATE INDEX idx_availability_reorder ON store_product_availability(reorder_point);

-- 8. INVENTORY TABLE
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku) ON DELETE RESTRICT,
    current_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0, -- For pending orders
    damaged_quantity INT DEFAULT 0,
    unit_of_measure VARCHAR(50),
    last_count_date TIMESTAMP,
    next_count_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, sku)
);

CREATE INDEX idx_inventory_store ON inventory(store_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_low_stock ON inventory(current_quantity) WHERE current_quantity < 10;

-- 9. ORDERS TABLE
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable
    store_id INT NOT NULL REFERENCES stores(store_id),
    vendor_id INT NOT NULL REFERENCES vendors(vendor_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    total_amount DECIMAL(12, 2),
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_date ON orders(order_date DESC);

-- 10. ORDER ITEMS TABLE
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2),
    received_quantity INT DEFAULT 0,
    received_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_sku ON order_items(sku);

-- ===== HISTORICAL & AUDIT TABLES =====

-- 11. PRICE HISTORY (Track pricing changes)
CREATE TABLE price_history (
    price_history_id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    store_id INT REFERENCES stores(store_id) ON DELETE CASCADE,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    price_type VARCHAR(50), -- "wholesale", "retail", "promotion"
    effective_date DATE NOT NULL,
    reason VARCHAR(255), -- e.g., "vendor price increase", "promotional discount"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_sku ON price_history(sku);
CREATE INDEX idx_price_history_store ON price_history(store_id);
CREATE INDEX idx_price_history_date ON price_history(effective_date DESC);

-- 12. STOCK MOVEMENTS (Audit trail for inventory changes)
CREATE TABLE stock_movements (
    movement_id SERIAL PRIMARY KEY,
    inventory_id INT NOT NULL REFERENCES inventory(inventory_id) ON DELETE CASCADE,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES products(sku),
    movement_type VARCHAR(50), -- "receipt", "sale", "adjustment", "damage", "transfer"
    quantity_change INT,
    reference_id VARCHAR(100), -- e.g., order_id, transfer_id
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_inventory ON stock_movements(inventory_id);
CREATE INDEX idx_stock_movements_store ON stock_movements(store_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);

-- 13. AUDIT LOG (Master audit trail)
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100), -- "store", "vendor", "product", etc.
    entity_id VARCHAR(100),
    action VARCHAR(50), -- "create", "update", "delete"
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    user_email VARCHAR(255),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at DESC);

-- ===== VIEWS FOR COMMON QUERIES =====

-- View: Low Stock Alert
CREATE VIEW low_stock_alert AS
SELECT 
    s.store_id,
    s.store_name,
    s.city,
    i.sku,
    p.product_name,
    i.current_quantity,
    spa.min_stock_level,
    spa.reorder_point,
    (spa.max_stock_level - i.current_quantity) as units_to_reorder
FROM inventory i
JOIN stores s ON i.store_id = s.store_id
JOIN products p ON i.sku = p.sku
JOIN store_product_availability spa ON s.store_id = spa.store_id AND i.sku = spa.sku
WHERE i.current_quantity <= spa.reorder_point
AND s.is_active = true
ORDER BY i.current_quantity ASC;

-- View: Vendor Performance
CREATE VIEW vendor_performance AS
SELECT 
    v.vendor_id,
    v.vendor_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT s.store_id) as served_stores,
    ROUND(AVG(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END) * 100, 2) as on_time_delivery_rate,
    ROUND(AVG(v.rating), 2) as avg_rating,
    SUM(o.total_amount) as total_spent
FROM vendors v
LEFT JOIN orders o ON v.vendor_id = o.vendor_id
LEFT JOIN stores s ON o.store_id = s.store_id
WHERE v.is_active = true
GROUP BY v.vendor_id, v.vendor_name
ORDER BY total_orders DESC;

-- View: Store Inventory Value
CREATE VIEW store_inventory_value AS
SELECT 
    s.store_id,
    s.store_name,
    s.city,
    s.region,
    COUNT(DISTINCT i.sku) as unique_products,
    SUM(i.current_quantity) as total_units,
    ROUND(SUM(i.current_quantity * p.wholesale_price)::NUMERIC, 2) as inventory_value_wholesale,
    ROUND(SUM(i.current_quantity * spa.retail_price)::NUMERIC, 2) as inventory_value_retail
FROM stores s
LEFT JOIN inventory i ON s.store_id = i.store_id
LEFT JOIN products p ON i.sku = p.sku
LEFT JOIN store_product_availability spa ON s.store_id = spa.store_id AND i.sku = spa.sku
WHERE s.is_active = true
GROUP BY s.store_id, s.store_name, s.city, s.region
ORDER BY inventory_value_retail DESC;

-- View: Product Availability Across Stores
CREATE VIEW product_availability_summary AS
SELECT 
    p.sku,
    p.product_name,
    p.product_name,
    COUNT(DISTINCT spa.store_id) as stores_carrying,
    MIN(spa.retail_price) as min_price,
    MAX(spa.retail_price) as max_price,
    AVG(spa.retail_price)::NUMERIC(10,2) as avg_price,
    SUM(i.current_quantity) as total_in_stock
FROM products p
LEFT JOIN store_product_availability spa ON p.sku = spa.sku
LEFT JOIN inventory i ON i.sku = p.sku
WHERE p.is_active = true
GROUP BY p.sku, p.product_name
ORDER BY stores_carrying DESC;
```

### 3.2 Execute SQL Script

```bash
# Run the script
psql -U mdm_user -d mdm_db -f schema.sql

# Verify tables were created
psql -U mdm_user -d mdm_db -c "\dt"
```

---

## Part 4: Seed Sample Data

### 4.1 Create Seed Script (`seed.sql`)

```sql
-- ===== INSERT CATEGORIES =====
INSERT INTO categories (name, description) VALUES
('Beverages', 'All drink products'),
('Soft Drinks', 'Sodas and non-alcoholic drinks'),
('Coffee & Hot Drinks', 'Hot beverage products'),
('Energy Drinks', 'Energy and sports beverages'),
('Juices & Smoothies', 'Fruit juices and smoothie drinks'),
('Water & Hydration', 'Bottled water and sports drinks'),
('Snacks', 'Salty and sweet snack items'),
('Chips & Crisps', 'Potato chips and similar products'),
('Nuts & Seeds', 'Roasted and salted nuts'),
('Candy & Confections', 'Candy bars and sweet treats'),
('Granola & Cereal Bars', 'Breakfast and nutrition bars'),
('Prepared Foods', 'Ready-to-eat food items'),
('Sandwiches', 'Pre-made sandwiches and wraps'),
('Bakery Items', 'Bread, pastries, and baked goods'),
('Salads & Bowls', 'Fresh salads and grain bowls');

-- ===== INSERT VENDORS =====
INSERT INTO vendors (vendor_name, category, contact_person, email, phone, street_address, city, state, zip_code, payment_terms, minimum_order_quantity, rating) VALUES
('National Beverage Co.', 'beverages', 'Robert Wilson', 'robert.wilson@nationalbeverage.com', '214-555-0201', '1000 Industrial Way', 'Dallas', 'TX', '75201', 'Net 30', 100, 4.5),
('Snack Master Inc.', 'snacks', 'Lisa Anderson', 'lisa.anderson@snackmaster.com', '512-555-0202', '2500 Commerce St', 'Austin', 'TX', '78701', 'Net 45', 50, 4.3),
('Fresh Foods Logistics', 'food', 'Michael Thompson', 'm.thompson@freshfoods.com', '713-555-0203', '5000 Warehouse Rd', 'Houston', 'TX', '77040', 'Net 15', 75, 4.7),
('Texas Coffee Roasters', 'beverages', 'Jennifer Blake', 'jennifer.blake@txcoffee.com', '512-555-0204', '1200 Coffee Lane', 'Austin', 'TX', '78704', 'Net 30', 25, 4.8),
('Premium Candy & Confections', 'snacks', 'Kevin Martinez', 'kevin.m@premiumcandy.com', '210-555-0205', '800 Sweet St', 'San Antonio', 'TX', '78201', 'Net 60', 40, 4.2),
('Gourmet Sandwich Solutions', 'food', 'Amanda Foster', 'amanda.foster@gourmetsandwich.com', '713-555-0206', '3000 Deli Drive', 'Houston', 'TX', '77030', 'Net 14', 60, 4.6),
('Healthy Beverage Corp', 'beverages', 'David Kim', 'd.kim@healthybev.com', '713-555-0207', '2200 Health Way', 'Houston', 'TX', '77002', 'Net 45', 80, 4.4),
('Artisan Bakery Partners', 'food', 'Sophie Turner', 'sophie.t@artisanbakery.com', '817-555-0208', '1500 Bakers Road', 'Fort Worth', 'TX', '76102', 'Net 7', 30, 4.9);

-- ===== INSERT STORES =====
INSERT INTO stores (store_name, street_address, city, state, zip_code, region, store_type, manager_name, manager_phone, manager_email, square_footage, latitude, longitude) VALUES
('Downtown Houston', '123 Main St', 'Houston', 'TX', '77002', 'South', 'standalone', 'John Smith', '713-555-0101', 'john.smith@mdm.com', 2500, 29.7589, -95.3677),
('Midtown Plaza', '456 Park Ave', 'Houston', 'TX', '77004', 'South', 'kiosk', 'Maria Garcia', '713-555-0102', 'maria.garcia@mdm.com', 1200, 29.7489, -95.3877),
('Airport Express', '2000 Airport Blvd', 'Houston', 'TX', '77010', 'South', 'express', 'David Chen', '713-555-0103', 'david.chen@mdm.com', 3000, 29.9847, -95.3411),
('Dallas Central', '789 Commerce St', 'Dallas', 'TX', '75201', 'North', 'standalone', 'James Rodriguez', '214-555-0104', 'james.rodriguez@mdm.com', 2800, 32.7767, -96.7970),
('Fort Worth Station', '500 Main St', 'Fort Worth', 'TX', '76102', 'North', 'express', 'Sarah Johnson', '817-555-0105', 'sarah.johnson@mdm.com', 1800, 32.7555, -97.3308),
('Austin Convention Center', '100 Congress Ave', 'Austin', 'TX', '78701', 'Central', 'kiosk', 'Emily Watson', '512-555-0106', 'emily.watson@mdm.com', 900, 30.2672, -97.7431),
('San Antonio Tower', '300 Broadway', 'San Antonio', 'TX', '78215', 'South', 'standalone', 'Carlos Hernandez', '210-555-0107', 'carlos.hernandez@mdm.com', 2600, 29.4241, -98.4936);

-- ===== INSERT OPERATING HOURS =====
INSERT INTO operating_hours (store_id, day_of_week, opening_time, closing_time, is_closed) VALUES
-- Downtown Houston (Open 6 AM - 11 PM weekdays, Midnight weekends)
(1, 0, '07:00'::TIME, '23:00'::TIME, false), -- Sunday
(1, 1, '06:00'::TIME, '23:00'::TIME, false), -- Monday
(1, 2, '06:00'::TIME, '23:00'::TIME, false), -- Tuesday
(1, 3, '06:00'::TIME, '23:00'::TIME, false), -- Wednesday
(1, 4, '06:00'::TIME, '23:00'::TIME, false), -- Thursday
(1, 5, '06:00'::TIME, '00:00'::TIME, false), -- Friday
(1, 6, '06:00'::TIME, '00:00'::TIME, false), -- Saturday
-- Airport Express (24/7)
(3, 0, '05:00'::TIME, '23:59'::TIME, false),
(3, 1, '05:00'::TIME, '23:59'::TIME, false),
(3, 2, '05:00'::TIME, '23:59'::TIME, false),
(3, 3, '05:00'::TIME, '23:59'::TIME, false),
(3, 4, '05:00'::TIME, '23:59'::TIME, false),
(3, 5, '05:00'::TIME, '23:59'::TIME, false),
(3, 6, '05:00'::TIME, '23:59'::TIME, false);

-- ===== INSERT PRODUCTS =====
INSERT INTO products (sku, product_name, category_id, vendor_id, vendor_sku, description, unit_of_measure, units_per_case, wholesale_price, retail_price_base, weight, barcode) VALUES
('PRD001', 'Cola Classic 12oz', 3, 1, 'BEV-COLA-12', 'Classic cola soft drink', 'case', 24, 3.50, 0.99, 0.375, '012345678901'),
('PRD002', 'Lemon Lime Soda 20oz', 3, 1, 'BEV-LEMON-20', 'Lemon-lime flavored soda', 'case', 12, 4.25, 1.49, 1.25, '012345678902'),
('PRD003', 'Potato Chips - Salted 1.5oz', 9, 2, 'SNK-CHIP-SALT-15', 'Classic salted potato chips', 'case', 40, 8.99, 0.79, 1.5, '012345678903'),
('PRD004', 'Corn Chips - BBQ 1oz', 9, 2, 'SNK-CORN-BBQ-10', 'Barbecue flavored corn chips', 'case', 50, 7.50, 0.69, 1.0, '012345678904'),
('PRD005', 'Chicken Sandwich', 13, 3, 'FOOD-CHICK-SAND', 'Grilled chicken sandwich', 'unit', 1, 3.75, 6.99, 0.35, '012345678905'),
('PRD006', 'Bottled Coffee - Iced 16oz', 4, 4, 'BEV-ICECOFF-16', 'Ready-to-drink iced coffee', 'case', 12, 5.99, 2.49, 1.0, '012345678906'),
('PRD007', 'Energy Drink - Berry 16oz', 5, 7, 'ENR-BERRY-16', 'High-performance energy drink', 'case', 12, 7.25, 2.99, 1.0, '012345678907'),
('PRD008', 'Orange Juice 100% Pure 12oz', 6, 1, 'JUI-ORANGE-12', 'Pure orange juice', 'case', 24, 4.99, 1.79, 0.8, '012345678908'),
('PRD009', 'Bottled Spring Water 16.9oz', 7, 7, 'WAT-SPRING-17', 'Pure spring water', 'case', 35, 2.99, 1.49, 0.6, '012345678909'),
('PRD010', 'Mixed Nuts 1oz', 10, 2, 'NUT-MIX-10', 'Roasted mixed nuts', 'case', 42, 9.99, 3.99, 1.0, '012345678910');

-- ===== INSERT STORE-VENDOR RELATIONSHIPS =====
INSERT INTO store_vendor_relationships (store_id, vendor_id, vendor_representative, vendor_phone, delivery_frequency, delivery_days, lead_time_days) VALUES
(1, 1, 'Robert Wilson', '214-555-0201', '3x weekly', '["Monday", "Wednesday", "Friday"]'::JSON, 2),
(1, 2, 'Lisa Anderson', '512-555-0202', '2x weekly', '["Tuesday", "Saturday"]'::JSON, 3),
(1, 3, 'Michael Thompson', '713-555-0203', 'daily', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::JSON, 1),
(1, 4, 'Jennifer Blake', '512-555-0204', '2x weekly', '["Wednesday", "Friday"]'::JSON, 2),
(3, 1, 'Robert Wilson', '214-555-0201', 'daily', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'::JSON, 1),
(3, 3, 'Michael Thompson', '713-555-0203', '2x daily', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'::JSON, 0),
(4, 1, 'Robert Wilson', '214-555-0201', '3x weekly', '["Tuesday", "Thursday", "Saturday"]'::JSON, 2),
(4, 2, 'Lisa Anderson', '512-555-0202', '2x weekly', '["Monday", "Thursday"]'::JSON, 3);

-- ===== INSERT STORE-PRODUCT AVAILABILITY =====
INSERT INTO store_product_availability (store_id, sku, retail_price, wholesale_cost, min_stock_level, max_stock_level, reorder_point, reorder_quantity) VALUES
(1, 'PRD001', 0.99, 3.50, 50, 200, 75, 100),
(1, 'PRD002', 1.49, 4.25, 30, 120, 50, 60),
(1, 'PRD003', 0.79, 8.99, 100, 300, 150, 150),
(1, 'PRD004', 0.69, 7.50, 100, 350, 150, 200),
(1, 'PRD005', 6.99, 3.75, 5, 20, 10, 15),
(1, 'PRD006', 2.49, 5.99, 10, 50, 20, 30),
(3, 'PRD001', 1.09, 3.50, 100, 400, 200, 200),
(3, 'PRD005', 7.99, 3.75, 15, 50, 25, 35),
(3, 'PRD006', 2.49, 5.99, 20, 80, 40, 50),
(4, 'PRD001', 0.99, 3.50, 60, 220, 90, 100),
(4, 'PRD002', 1.49, 4.25, 35, 140, 60, 70),
(4, 'PRD007', 2.99, 7.25, 20, 80, 40, 50);

-- ===== INSERT INVENTORY =====
INSERT INTO inventory (store_id, sku, current_quantity, reserved_quantity, unit_of_measure, last_count_date, next_count_date) VALUES
(1, 'PRD001', 125, 10, 'case', '2026-08-05 10:00:00', '2026-08-12 10:00:00'),
(1, 'PRD002', 75, 5, 'case', '2026-08-05 10:15:00', '2026-08-12 10:15:00'),
(1, 'PRD003', 200, 20, 'case', '2026-08-05 10:30:00', '2026-08-12 10:30:00'),
(1, 'PRD004', 220, 15, 'case', '2026-08-05 10:45:00', '2026-08-12 10:45:00'),
(1, 'PRD005', 12, 2, 'unit', '2026-08-04 15:30:00', '2026-08-11 15:30:00'),
(1, 'PRD006', 35, 5, 'case', '2026-08-05 11:00:00', '2026-08-12 11:00:00'),
(3, 'PRD001', 350, 30, 'case', '2026-08-05 09:30:00', '2026-08-12 09:30:00'),
(3, 'PRD005', 18, 3, 'unit', '2026-08-04 16:00:00', '2026-08-11 16:00:00'),
(3, 'PRD006', 58, 8, 'case', '2026-08-05 09:45:00', '2026-08-12 09:45:00'),
(4, 'PRD001', 145, 12, 'case', '2026-08-05 08:00:00', '2026-08-12 08:00:00'),
(4, 'PRD002', 88, 8, 'case', '2026-08-05 08:15:00', '2026-08-12 08:15:00'),
(4, 'PRD007', 52, 6, 'case', '2026-08-05 08:30:00', '2026-08-12 08:30:00');

-- ===== INSERT ORDERS (Examples) =====
INSERT INTO orders (order_number, store_id, vendor_id, order_date, expected_delivery_date, order_status, total_amount, created_by) VALUES
('ORD-2026-08-001', 1, 1, '2026-08-05 14:00:00', '2026-08-07', 'pending', 420.00, 'john.smith@mdm.com'),
('ORD-2026-08-002', 1, 3, '2026-08-05 15:30:00', '2026-08-06', 'confirmed', 225.00, 'john.smith@mdm.com'),
('ORD-2026-08-003', 3, 1, '2026-08-05 10:00:00', '2026-08-05', 'delivered', 630.00, 'david.chen@mdm.com'),
('ORD-2026-08-004', 4, 2, '2026-08-04 16:20:00', '2026-08-07', 'shipped', 360.00, 'james.rodriguez@mdm.com');

-- ===== INSERT ORDER ITEMS =====
INSERT INTO order_items (order_id, sku, quantity, unit_cost, line_total) VALUES
(1, 'PRD001', 50, 3.50, 175.00),
(1, 'PRD002', 60, 4.25, 255.00),
(2, 'PRD005', 60, 3.75, 225.00),
(3, 'PRD001', 100, 3.50, 350.00),
(3, 'PRD003', 80, 8.99, 280.00),
(4, 'PRD003', 40, 8.99, 360.00);
```

### 4.2 Run Seed Script

```bash
psql -U mdm_user -d mdm_db -f seed.sql
```

---

## Part 5: Real-World Query Examples

### 5.1 Common Business Scenarios

#### **Scenario 1: Get Low Stock Alerts for a Store**

```sql
-- Which products need reordering at Downtown Houston?
SELECT 
    p.sku,
    p.product_name,
    i.current_quantity,
    spa.reorder_point,
    spa.max_stock_level - i.current_quantity as units_to_reorder,
    v.vendor_name,
    v.email,
    svr.delivery_frequency
FROM inventory i
JOIN products p ON i.sku = p.sku
JOIN store_product_availability spa ON i.store_id = spa.store_id AND i.sku = spa.sku
JOIN vendors v ON p.vendor_id = v.vendor_id
JOIN store_vendor_relationships svr ON i.store_id = svr.store_id AND v.vendor_id = svr.vendor_id
WHERE i.store_id = 1
  AND i.current_quantity <= spa.reorder_point
ORDER BY i.current_quantity ASC;
```

#### **Scenario 2: Calculate Store Inventory Value**

```sql
-- What's the total inventory value for each store?
SELECT 
    s.store_id,
    s.store_name,
    s.city,
    s.region,
    COUNT(DISTINCT i.sku) as unique_products,
    SUM(i.current_quantity) as total_units,
    ROUND(SUM(i.current_quantity * p.wholesale_price)::NUMERIC, 2) as cost_value,
    ROUND(SUM(i.current_quantity * spa.retail_price)::NUMERIC, 2) as retail_value,
    ROUND((SUM(i.current_quantity * spa.retail_price) - SUM(i.current_quantity * p.wholesale_price))::NUMERIC, 2) as potential_margin
FROM stores s
LEFT JOIN inventory i ON s.store_id = i.store_id
LEFT JOIN products p ON i.sku = p.sku
LEFT JOIN store_product_availability spa ON s.store_id = spa.store_id AND i.sku = spa.sku
WHERE s.is_active = true
GROUP BY s.store_id, s.store_name, s.city, s.region
ORDER BY retail_value DESC;
```

#### **Scenario 3: Find Products Below Promotional Pricing**

```sql
-- Which products are currently on promotion?
SELECT 
    s.store_name,
    p.sku,
    p.product_name,
    spa.retail_price as regular_price,
    spa.promotion_price,
    ROUND(((spa.retail_price - spa.promotion_price) / spa.retail_price * 100)::NUMERIC, 2) as discount_percent,
    spa.promotion_start_date,
    spa.promotion_end_date,
    i.current_quantity as stock_available
FROM store_product_availability spa
JOIN stores s ON spa.store_id = s.store_id
JOIN products p ON spa.sku = p.sku
JOIN inventory i ON s.store_id = i.store_id AND p.sku = i.sku
WHERE spa.promotion_price IS NOT NULL
  AND CURRENT_DATE BETWEEN spa.promotion_start_date AND spa.promotion_end_date
  AND s.is_active = true
ORDER BY discount_percent DESC;
```

#### **Scenario 4: Vendor Performance Report**

```sql
-- How well are vendors performing?
SELECT 
    v.vendor_id,
    v.vendor_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT svr.store_id) as served_stores,
    ROUND(AVG(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END) * 100, 2) as on_time_delivery_rate,
    v.rating as avg_rating,
    ROUND(SUM(COALESCE(o.total_amount, 0))::NUMERIC, 2) as total_spent,
    ROUND(AVG(COALESCE(o.total_amount, 0))::NUMERIC, 2) as avg_order_value
FROM vendors v
LEFT JOIN orders o ON v.vendor_id = o.vendor_id
LEFT JOIN store_vendor_relationships svr ON v.vendor_id = svr.vendor_id
WHERE v.is_active = true
GROUP BY v.vendor_id, v.vendor_name, v.rating
ORDER BY total_orders DESC;
```

#### **Scenario 5: Product Availability Across Stores**

```sql
-- Which stores carry each product and at what price?
SELECT 
    p.sku,
    p.product_name,
    COUNT(spa.store_id) as stores_carrying,
    MIN(spa.retail_price) as min_price,
    MAX(spa.retail_price) as max_price,
    STRING_AGG(s.store_name || ' ($' || spa.retail_price::TEXT || ')', ', ') as store_prices
FROM products p
LEFT JOIN store_product_availability spa ON p.sku = spa.sku
LEFT JOIN stores s ON spa.store_id = s.store_id
WHERE p.is_active = true
GROUP BY p.sku, p.product_name
ORDER BY stores_carrying DESC;
```

#### **Scenario 6: Pending Orders Status**

```sql
-- What orders are pending and due soon?
SELECT 
    o.order_number,
    s.store_name,
    v.vendor_name,
    o.order_date,
    o.expected_delivery_date,
    CURRENT_DATE - o.order_date as days_since_order,
    o.expected_delivery_date - CURRENT_DATE as days_until_delivery,
    o.total_amount,
    o.order_status,
    STRING_AGG(p.product_name || ' (' || oi.quantity || ')', ', ') as items
FROM orders o
JOIN stores s ON o.store_id = s.store_id
JOIN vendors v ON o.vendor_id = v.vendor_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.sku = p.sku
WHERE o.order_status IN ('pending', 'confirmed', 'shipped')
  AND o.expected_delivery_date <= CURRENT_DATE + INTERVAL '3 days'
GROUP BY o.order_id, o.order_number, s.store_name, v.vendor_name, o.order_date, o.expected_delivery_date, o.total_amount, o.order_status
ORDER BY o.expected_delivery_date ASC;
```

#### **Scenario 7: Stock Movement Audit Trail**

```sql
-- Track all inventory changes for a specific product
SELECT 
    sm.movement_id,
    s.store_name,
    sm.movement_type,
    sm.quantity_change,
    i.current_quantity as current_qty_after_movement,
    sm.reference_id,
    sm.notes,
    sm.created_by,
    sm.created_at
FROM stock_movements sm
JOIN stores s ON sm.store_id = s.store_id
JOIN inventory i ON sm.inventory_id = i.inventory_id
WHERE sm.sku = 'PRD001'
  AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sm.created_at DESC;
```

#### **Scenario 8: Price Changes Over Time**

```sql
-- Show price history for a product
SELECT 
    ph.price_history_id,
    COALESCE(s.store_name, 'System-wide') as location,
    ph.price_type,
    ph.old_price,
    ph.new_price,
    ROUND(((ph.new_price - ph.old_price) / ph.old_price * 100)::NUMERIC, 2) as percent_change,
    ph.reason,
    ph.effective_date,
    ph.created_at
FROM price_history ph
LEFT JOIN stores s ON ph.store_id = s.store_id
WHERE ph.sku = 'PRD001'
ORDER BY ph.effective_date DESC;
```

#### **Scenario 9: Vendor Delivery Performance by Store**

```sql
-- Which vendors deliver on time to which stores?
SELECT 
    s.store_name,
    v.vendor_name,
    COUNT(o.order_id) as total_orders,
    COUNT(CASE WHEN o.actual_delivery_date <= o.expected_delivery_date THEN 1 END) as on_time_deliveries,
    ROUND(COUNT(CASE WHEN o.actual_delivery_date <= o.expected_delivery_date THEN 1 END)::NUMERIC / COUNT(o.order_id) * 100, 2) as on_time_percent
FROM orders o
JOIN stores s ON o.store_id = s.store_id
JOIN vendors v ON o.vendor_id = v.vendor_id
WHERE o.order_status = 'delivered'
  AND o.actual_delivery_date IS NOT NULL
GROUP BY s.store_id, s.store_name, v.vendor_id, v.vendor_name
HAVING COUNT(o.order_id) >= 3
ORDER BY s.store_name, on_time_percent DESC;
```

#### **Scenario 10: Category Performance Across Stores**

```sql
-- Which product categories are most valuable at each store?
SELECT 
    s.store_name,
    c.name as category,
    COUNT(DISTINCT i.sku) as unique_products,
    SUM(i.current_quantity) as total_units,
    ROUND(SUM(i.current_quantity * p.wholesale_price)::NUMERIC, 2) as inventory_cost,
    ROUND(SUM(i.current_quantity * spa.retail_price)::NUMERIC, 2) as inventory_value
FROM inventory i
JOIN stores s ON i.store_id = s.store_id
JOIN products p ON i.sku = p.sku
JOIN categories c ON p.category_id = c.category_id
JOIN store_product_availability spa ON s.store_id = spa.store_id AND i.sku = spa.sku
WHERE s.is_active = true
GROUP BY s.store_id, s.store_name, c.category_id, c.name
ORDER BY s.store_name, inventory_value DESC;
```

---

## Part 6: Node.js API Layer (Database Queries)

### 6.1 Database Connection Pool (`lib/db.ts`)

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
```

### 6.2 Queries Service (`lib/queries.ts`)

```typescript
import pool from './db';
import { QueryResult } from 'pg';

export const mdmQueries = {
  // Low Stock Alert
  async getLowStockAlerts(storeId?: number) {
    const query = `
      SELECT 
        s.store_id, s.store_name, s.city,
        i.sku, p.product_name,
        i.current_quantity, spa.min_stock_level, spa.reorder_point,
        (spa.max_stock_level - i.current_quantity) as units_to_reorder,
        v.vendor_name, v.email, svr.delivery_frequency
      FROM inventory i
      JOIN products p ON i.sku = p.sku
      JOIN store_product_availability spa ON i.store_id = spa.store_id AND i.sku = spa.sku
      JOIN vendors v ON p.vendor_id = v.vendor_id
      JOIN store_vendor_relationships svr ON i.store_id = svr.store_id AND v.vendor_id = svr.vendor_id
      ${storeId ? 'WHERE i.store_id = $1' : ''}
      AND i.current_quantity <= spa.reorder_point
      ORDER BY i.current_quantity ASC
    `;
    
    const params = storeId ? [storeId] : [];
    return pool.query(query, params);
  },

  // Store Inventory Value
  async getStoreInventoryValue(storeId?: number) {
    const query = `
      SELECT 
        s.store_id, s.store_name, s.city, s.region,
        COUNT(DISTINCT i.sku) as unique_products,
        SUM(i.current_quantity) as total_units,
        ROUND(SUM(i.current_quantity * p.wholesale_price)::NUMERIC, 2) as cost_value,
        ROUND(SUM(i.current_quantity * spa.retail_price)::NUMERIC, 2) as retail_value,
        ROUND((SUM(i.current_quantity * spa.retail_price) - SUM(i.current_quantity * p.wholesale_price))::NUMERIC, 2) as potential_margin
      FROM stores s
      LEFT JOIN inventory i ON s.store_id = i.store_id
      LEFT JOIN products p ON i.sku = p.sku
      LEFT JOIN store_product_availability spa ON s.store_id = spa.store_id AND i.sku = spa.sku
      ${storeId ? 'WHERE s.store_id = $1' : 'WHERE s.is_active = true'}
      GROUP BY s.store_id, s.store_name, s.city, s.region
      ORDER BY retail_value DESC
    `;
    
    const params = storeId ? [storeId] : [];
    return pool.query(query, params);
  },

  // Pending Orders
  async getPendingOrders(daysUntilDelivery: number = 3) {
    const query = `
      SELECT 
        o.order_number, s.store_name, v.vendor_name,
        o.order_date, o.expected_delivery_date,
        CURRENT_DATE - o.order_date as days_since_order,
        o.expected_delivery_date - CURRENT_DATE as days_until_delivery,
        o.total_amount, o.order_status,
        STRING_AGG(p.product_name || ' (' || oi.quantity || ')', ', ') as items
      FROM orders o
      JOIN stores s ON o.store_id = s.store_id
      JOIN vendors v ON o.vendor_id = v.vendor_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.sku = p.sku
      WHERE o.order_status IN ('pending', 'confirmed', 'shipped')
        AND o.expected_delivery_date <= CURRENT_DATE + INTERVAL '${daysUntilDelivery} days'
      GROUP BY o.order_id, o.order_number, s.store_name, v.vendor_name, o.order_date, o.expected_delivery_date, o.total_amount, o.order_status
      ORDER BY o.expected_delivery_date ASC
    `;
    
    return pool.query(query);
  },

  // Product Availability
  async getProductAvailability(sku?: string) {
    const query = `
      SELECT 
        p.sku, p.product_name,
        COUNT(spa.store_id) as stores_carrying,
        MIN(spa.retail_price) as min_price,
        MAX(spa.retail_price) as max_price,
        STRING_AGG(s.store_name || ' ($' || spa.retail_price::TEXT || ')', ', ') as store_prices
      FROM products p
      LEFT JOIN store_product_availability spa ON p.sku = spa.sku
      LEFT JOIN stores s ON spa.store_id = s.store_id
      ${sku ? 'WHERE p.sku = $1' : 'WHERE p.is_active = true'}
      GROUP BY p.sku, p.product_name
      ORDER BY stores_carrying DESC
    `;
    
    const params = sku ? [sku] : [];
    return pool.query(query, params);
  },

  // Vendor Performance
  async getVendorPerformance(vendorId?: number) {
    const query = `
      SELECT 
        v.vendor_id, v.vendor_name,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT svr.store_id) as served_stores,
        ROUND(AVG(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END) * 100, 2) as on_time_delivery_rate,
        v.rating, ROUND(SUM(COALESCE(o.total_amount, 0))::NUMERIC, 2) as total_spent,
        ROUND(AVG(COALESCE(o.total_amount, 0))::NUMERIC, 2) as avg_order_value
      FROM vendors v
      LEFT JOIN orders o ON v.vendor_id = o.vendor_id
      LEFT JOIN store_vendor_relationships svr ON v.vendor_id = svr.vendor_id
      ${vendorId ? 'WHERE v.vendor_id = $1' : 'WHERE v.is_active = true'}
      GROUP BY v.vendor_id, v.vendor_name, v.rating
      ORDER BY total_orders DESC
    `;
    
    const params = vendorId ? [vendorId] : [];
    return pool.query(query, params);
  },

  // Stock Movements
  async getStockMovements(sku: string, days: number = 30) {
    const query = `
      SELECT 
        sm.movement_id, s.store_name, sm.movement_type,
        sm.quantity_change, i.current_quantity,
        sm.reference_id, sm.notes, sm.created_by, sm.created_at
      FROM stock_movements sm
      JOIN stores s ON sm.store_id = s.store_id
      JOIN inventory i ON sm.inventory_id = i.inventory_id
      WHERE sm.sku = $1
        AND sm.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY sm.created_at DESC
    `;
    
    return pool.query(query, [sku]);
  },

  // Search (Universal)
  async universalSearch(query: string) {
    const searchTerm = `%${query}%`;
    
    const sql = `
      SELECT 'store' as type, store_id as id, store_name as title, 
             city || ', ' || state as subtitle FROM stores WHERE store_name ILIKE $1
      UNION
      SELECT 'vendor' as type, vendor_id as id, vendor_name as title,
             email as subtitle FROM vendors WHERE vendor_name ILIKE $1
      UNION
      SELECT 'product' as type, 1 as id, product_name as title,
             sku as subtitle FROM products WHERE product_name ILIKE $1 OR sku ILIKE $1
      ORDER BY type, title
      LIMIT 20
    `;
    
    return pool.query(sql, [searchTerm]);
  }
};
```

### 6.3 Next.js API Routes

**File: `app/api/mdm/low-stock/route.ts`**

```typescript
import { mdmQueries } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const result = await mdmQueries.getLowStockAlerts(storeId ? parseInt(storeId) : undefined);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

**File: `app/api/mdm/inventory-value/route.ts`**

```typescript
import { mdmQueries } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const result = await mdmQueries.getStoreInventoryValue(storeId ? parseInt(storeId) : undefined);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

**File: `app/api/mdm/pending-orders/route.ts`**

```typescript
import { mdmQueries } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const days = request.nextUrl.searchParams.get('days') || '3';
    const result = await mdmQueries.getPendingOrders(parseInt(days));
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

**File: `app/api/mdm/search/route.ts`**

```typescript
import { mdmQueries } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }
    
    const result = await mdmQueries.universalSearch(q);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

---

## Part 7: Environment Setup

### 7.1 `.env.local`

```
DATABASE_URL="postgresql://mdm_user:secure_password_123@localhost:5432/mdm_db"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 7.2 Verify Connection

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Run migrations/seed
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

---

## Part 8: Testing the Queries

### 8.1 From Terminal

```bash
# Get low stock alerts
psql $DATABASE_URL -c "SELECT * FROM low_stock_alert;"

# Get store inventory value
psql $DATABASE_URL -c "SELECT * FROM store_inventory_value;"

# Get vendor performance
psql $DATABASE_URL -c "SELECT * FROM vendor_performance;"
```

### 8.2 From Node.js

```typescript
import pool from '@/lib/db';

// Test connection
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected:', result.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
```

---

## Part 9: Optimization Tips

### 9.1 Add Indexes for Performance

```sql
-- Add composite indexes for frequent queries
CREATE INDEX idx_inventory_low_stock ON inventory(current_quantity) 
WHERE current_quantity < 50;

CREATE INDEX idx_orders_status_date ON orders(order_status, order_date DESC);

CREATE INDEX idx_store_vendor_delivery ON store_vendor_relationships(store_id, vendor_id, is_active);

-- Full text search index for product names
CREATE INDEX idx_products_search ON products USING GIN(
  to_tsvector('english', product_name || ' ' || description)
);
```

### 9.2 Add Triggers for Audit Logging

```sql
-- Auto-log changes to products
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, action, old_values, new_values)
  VALUES (
    'product',
    NEW.sku,
    TG_OP,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_product_changes();
```

---

## Part 10: Migration Path from JSON to Database

### 10.1 Migration Script

```typescript
// scripts/migrate-json-to-db.ts
import fs from 'fs';
import pool from '@/lib/db';

async function migrateJsonToDatabase() {
  const jsonData = JSON.parse(
    fs.readFileSync('./convenience-store-mdm-sample.json', 'utf-8')
  );

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Migrate categories
    for (const cat of jsonData.categories) {
      await client.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cat.categoryName, cat.description]
      );
    }

    // Migrate vendors
    for (const vendor of jsonData.vendors) {
      await client.query(
        `INSERT INTO vendors (vendor_name, category, contact_person, email, phone, street_address, city, state, zip_code, payment_terms, minimum_order_quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING`,
        [vendor.vendorName, vendor.vendorCategory, vendor.contactPerson, vendor.email, vendor.phone, vendor.address, vendor.city, vendor.state, vendor.zipCode, vendor.paymentTerms, vendor.minimumOrderQuantity]
      );
    }

    // Similar for stores, products, etc.

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
  }
}

migrateJsonToDatabase();
```

---

## Summary

You now have:
- ✅ PostgreSQL database schema with proper normalization
- ✅ 13 core tables + 4 audit/history tables
- ✅ Pre-built views for common reports
- ✅ 10+ real-world query examples
- ✅ Node.js API layer ready to integrate
- ✅ Next.js API routes for your frontend
- ✅ Optimization guidelines
- ✅ Migration scripts to transition from JSON

**Next Steps:**
1. Set up PostgreSQL
2. Run schema.sql and seed.sql
3. Test queries from terminal
4. Add API routes to Next.js app
5. Connect frontend components to API endpoints
6. Implement additional CRUD operations as needed
