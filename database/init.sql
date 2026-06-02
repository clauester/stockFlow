-- schema de la base de datos para el sistema de inventario

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'Viewer',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- tabla de productos del inventario
CREATE TABLE IF NOT EXISTS products (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    category    VARCHAR(100) NOT NULL,
    sku         VARCHAR(50)  NOT NULL UNIQUE,
    stock       INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- tabla de lotes por producto, cada lote puede tener precio y fecha diferente
CREATE TABLE IF NOT EXISTS product_lots (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number  VARCHAR(50)   NOT NULL UNIQUE,
    price       NUMERIC(18,2) NOT NULL,
    entry_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    quantity    INTEGER       NOT NULL,
    notes       VARCHAR(300)
);

-- indices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku       ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_lots_product_id    ON product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_entry_date    ON product_lots(entry_date DESC);

-- datos de prueba
INSERT INTO products (id, name, description, category, sku, stock, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'Laptop Dell XPS 15',   'Laptop de alto rendimiento',     'Electrónica',   'DELL-XPS-001', 12, NOW(), NOW()),
    (gen_random_uuid(), 'Teclado Mecánico TKL',  'Teclado mecánico con iluminación RGB', 'Periféricos', 'KB-MECH-002',   8, NOW(), NOW()),
    (gen_random_uuid(), 'Hub USB-C 7 en 1',      'Adaptador USB-C multipuerto',    'Accesorios',    'HUB-USBC-003',  3, NOW(), NOW()),
    (gen_random_uuid(), 'Monitor 27" 4K',         'Monitor IPS 4K 144Hz',           'Electrónica',   'MON-4K-004',    5, NOW(), NOW()),
    (gen_random_uuid(), 'Mouse Inalámbrico',      'Mouse ergonómico inalámbrico',   'Periféricos',   'MS-WIRE-005',   0, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;
