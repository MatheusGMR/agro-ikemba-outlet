-- Cancelar manualmente as reservas das propostas P0001-2025 e P0002-2025
-- Esta é uma correção única para liberar o estoque que ficou travado
UPDATE inventory_reservations
SET 
  status = 'cancelled',
  updated_at = now(),
  notes = COALESCE(notes, '') || ' [Cancelado manualmente - correção de bug de cancelamento]'
WHERE proposal_id IN (
  SELECT id FROM proposals 
  WHERE proposal_number IN ('P0001-2025', 'P0002-2025')
)
AND status = 'active';