-- Crear política para permitir UPDATE en la tabla products
-- Para desarrollo: permite a cualquiera actualizar productos
CREATE POLICY "Allow public updates on products"
ON products FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- También crear política para SELECT si no existe
CREATE POLICY "Allow public select on products"
ON products FOR SELECT
TO public
USING (true);
