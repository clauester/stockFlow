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

-- configuración general del sistema
CREATE TABLE IF NOT EXISTS settings (
    id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    key   VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(500) NOT NULL
);

-- umbral para stock bajo (configurable desde el front)
INSERT INTO settings (id, key, value) VALUES (gen_random_uuid(), 'low_stock_threshold', '5')
ON CONFLICT (key) DO NOTHING;

-- tabla de productos del inventario
CREATE TABLE IF NOT EXISTS products (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    code        VARCHAR(50)  NOT NULL UNIQUE,
    units       INTEGER      NOT NULL DEFAULT 0,
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

-- indices
CREATE INDEX IF NOT EXISTS idx_products_code      ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_lots_product_id    ON product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_entry_date    ON product_lots(entry_date DESC);

-- datos de prueba
INSERT INTO products (id, name, description, code, units, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'Laptop Dell XPS 15',    'Laptop de alto rendimiento 15 pulgadas',   'PRD-001', 12, NOW(), NOW()),
    (gen_random_uuid(), 'Teclado Mecánico TKL',  'Teclado mecánico con iluminación RGB',     'PRD-002',  8, NOW(), NOW()),
    (gen_random_uuid(), 'Hub USB-C 7 en 1',      'Adaptador USB-C multipuerto',              'PRD-003',  3, NOW(), NOW()),
    (gen_random_uuid(), 'Monitor 27" 4K',        'Monitor IPS 4K 144Hz para diseño',         'PRD-004',  5, NOW(), NOW()),
    (gen_random_uuid(), 'Mouse Inalámbrico',     'Mouse ergonómico inalámbrico Bluetooth',   'PRD-005',  0, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
