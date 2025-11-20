-- Agregar columna promotion_price a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_price DECIMAL(10, 2);

-- Comentario para documentación
COMMENT ON COLUMN products.promotion_price IS 'Precio promocional del producto. NULL = sin promoción';
