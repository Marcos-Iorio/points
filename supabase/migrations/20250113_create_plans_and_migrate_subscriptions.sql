-- =====================================================
-- Migración: Crear tabla plans y migrar support_plans
-- =====================================================

-- 1. Crear tabla de planes (catálogo de planes disponibles)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  plan_type VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  max_courts INT, -- NULL = ilimitado
  max_users INT, -- NULL = ilimitado
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar planes iniciales
INSERT INTO plans (name, plan_type, description, price, max_courts, max_users, features) VALUES
(
  'Básico',
  'basic',
  'Plan ideal para clubes pequeños que están comenzando',
  5000,
  2,
  10,
  '["Hasta 2 canchas", "Hasta 10 usuarios", "Soporte básico por email", "Tablero de partidos en vivo"]'::jsonb
),
(
  'Premium',
  'premium',
  'Plan completo para clubes profesionales sin límites',
  15000,
  NULL,
  NULL,
  '["Canchas ilimitadas", "Usuarios ilimitados", "Soporte prioritario 24/7", "Analytics avanzado", "Reportes personalizados", "API access"]'::jsonb
);

-- 2. Renombrar support_plans a club_subscriptions
ALTER TABLE support_plans RENAME TO club_subscriptions;

-- 3. Agregar columna plan_id para referenciar a plans
ALTER TABLE club_subscriptions ADD COLUMN plan_id UUID REFERENCES plans(id);

-- 4. Migrar datos existentes: vincular suscripciones con planes
UPDATE club_subscriptions cs
SET plan_id = p.id
FROM plans p
WHERE cs.plan_type = p.plan_type;

-- 5. Hacer plan_id obligatorio ahora que los datos están migrados
ALTER TABLE club_subscriptions ALTER COLUMN plan_id SET NOT NULL;

-- 6. Agregar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_club_subscriptions_club_id ON club_subscriptions(club_id);
CREATE INDEX IF NOT EXISTS idx_club_subscriptions_plan_id ON club_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_club_subscriptions_status ON club_subscriptions(status);

-- 7. Opcional: Mantener plan_type por compatibilidad (puedes eliminarlo después)
-- Si quieres eliminarlo ahora, descomenta esta línea:
-- ALTER TABLE club_subscriptions DROP COLUMN plan_type;

-- 8. Agregar trigger para updated_at en plans
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_subscriptions_updated_at
    BEFORE UPDATE ON club_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Habilitar RLS en ambas tablas
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_subscriptions ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para plans (todos pueden leer, solo admins pueden modificar)
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans"
ON plans FOR SELECT
TO public
USING (active = true);

-- 11. Políticas RLS para club_subscriptions
DROP POLICY IF EXISTS "Users can view their club subscription" ON club_subscriptions;
CREATE POLICY "Users can view their club subscription"
ON club_subscriptions FOR SELECT
TO authenticated
USING (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
);

-- Permitir a usuarios autenticados insertar/actualizar su suscripción
DROP POLICY IF EXISTS "Users can manage their club subscription" ON club_subscriptions;
CREATE POLICY "Users can manage their club subscription"
ON club_subscriptions FOR ALL
TO authenticated
USING (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
);

-- 12. Comentarios para documentación
COMMENT ON TABLE plans IS 'Catálogo de planes de suscripción disponibles';
COMMENT ON TABLE club_subscriptions IS 'Suscripciones activas de clubes a planes';
COMMENT ON COLUMN plans.max_courts IS 'Máximo de canchas permitidas. NULL = ilimitado';
COMMENT ON COLUMN plans.max_users IS 'Máximo de usuarios permitidos. NULL = ilimitado';
COMMENT ON COLUMN plans.features IS 'Array de características del plan en formato JSON';
