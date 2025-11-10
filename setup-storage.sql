-- Agregar columna images a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Crear bucket de storage (ejecutar esto en el dashboard de Supabase)
-- Storage > Create bucket > Name: product-images, Public: Yes
