-- ============================================================
-- MIGRACIÓN: Promo 2x1 Anti-abuso
-- DB: malviaja2_db (MySQL)
-- Ejecutar ANTES de activar la promo en producción
-- ============================================================

-- 1. Añadir columna promo_2x1_usada a la tabla usuarios (tracking futuro)
ALTER TABLE usuarios ADD COLUMN promo_2x1_usada BOOLEAN DEFAULT FALSE;

-- 2. Crear índice para queries rápidas (evita full table scan en pedidos)
-- MySQL:
CREATE INDEX idx_pedidos_estado_descuento ON pedidos(estado, descuento);
-- PostgreSQL (si aplica):
-- CREATE INDEX IF NOT EXISTS idx_pedidos_estado_descuento ON pedidos(estado, descuento);

-- 3. Verificar
-- SELECT COUNT(*) FROM usuarios WHERE promo_2x1_usada = TRUE;
-- SELECT COUNT(DISTINCT usuario_id) FROM pedidos WHERE estado = 'ENTREGADO' AND descuento > 0;

-- ============================================================
-- NOTAS PARA EL EQUIPO:
-- 1. Ejecutar este SQL en phpMyAdmin / MySQL Workbench / CLI
-- 2. Luego compilar y desplegar el backend (malviaja2-backend.jar)
-- 3. Luego compilar y desplegar el frontend (dist/)
-- 4. Activar promo desde /admin/config → Promo Lanzamiento 2x1 → Toggle ON
-- ============================================================