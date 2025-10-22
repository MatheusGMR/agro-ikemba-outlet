-- Função para cancelar reservas automaticamente quando proposta é rejeitada/cancelada
CREATE OR REPLACE FUNCTION auto_cancel_reservations_on_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se a proposta foi rejeitada ou cancelada
  IF NEW.status IN ('rejected', 'cancelled') AND OLD.status NOT IN ('rejected', 'cancelled') THEN
    -- Cancelar todas as reservas ativas da proposta
    UPDATE inventory_reservations
    SET 
      status = 'cancelled',
      updated_at = now(),
      notes = COALESCE(notes, '') || ' [Auto-cancelada: proposta ' || NEW.status || ']'
    WHERE proposal_id = NEW.id
      AND status = 'active';
    
    -- Atualizar reservation_status da proposta
    NEW.reservation_status := 'cancelled';
    
    RAISE NOTICE 'Reservas canceladas automaticamente para proposta %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-cancelamento
DROP TRIGGER IF EXISTS trigger_auto_cancel_reservations ON proposals;

CREATE TRIGGER trigger_auto_cancel_reservations
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE FUNCTION auto_cancel_reservations_on_rejection();

COMMENT ON FUNCTION auto_cancel_reservations_on_rejection() IS 
'Cancela automaticamente todas as reservas de inventário quando uma proposta é rejeitada ou cancelada';

COMMENT ON TRIGGER trigger_auto_cancel_reservations ON proposals IS
'Trigger que garante sincronização entre status da proposta e reservas de inventário';