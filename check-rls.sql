-- Ver las políticas RLS de la tabla products
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';

-- Ver si RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'products';
