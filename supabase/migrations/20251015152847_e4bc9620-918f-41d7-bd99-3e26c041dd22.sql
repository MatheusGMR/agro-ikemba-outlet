-- FASE 1: Criar tabela de reservas de estoque
CREATE TABLE public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL,
  reserved_volume NUMERIC NOT NULL CHECK (reserved_volume > 0),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  consumed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Índices para performance
CREATE INDEX idx_reservations_inventory_item ON inventory_reservations(inventory_item_id);
CREATE INDEX idx_reservations_opportunity ON inventory_reservations(opportunity_id);
CREATE INDEX idx_reservations_proposal ON inventory_reservations(proposal_id);
CREATE INDEX idx_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_reservations_expires_at ON inventory_reservations(expires_at);
CREATE INDEX idx_reservations_product_location ON inventory_reservations(product_sku, city, state);

-- Trigger para updated_at
CREATE TRIGGER update_inventory_reservations_updated_at
  BEFORE UPDATE ON public.inventory_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Representatives can view their reservations"
  ON public.inventory_reservations FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM opportunities 
      WHERE representative_id IN (
        SELECT id FROM representatives WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all reservations"
  ON public.inventory_reservations FOR SELECT
  USING (check_admin_access());

CREATE POLICY "Admins can manage all reservations"
  ON public.inventory_reservations FOR ALL
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

-- Adicionar campos à tabela proposals
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reservation_status TEXT DEFAULT 'pending' CHECK (
  reservation_status IN ('pending', 'active', 'expired', 'confirmed', 'cancelled')
);

CREATE INDEX IF NOT EXISTS idx_proposals_reservation_status ON proposals(reservation_status);

-- Criar view para estoque disponível real
CREATE OR REPLACE VIEW public.inventory_available AS
SELECT 
  i.id,
  i.product_sku,
  i.product_name,
  i.manufacturer,
  i.active_ingredient,
  i.mapa_number,
  i.packaging,
  i.unit,
  i.state,
  i.city,
  i.expiry_date,
  i.base_price,
  i.preco_banda_menor,
  i.preco_banda_maior,
  i.commission_unit,
  i.net_commission,
  i.commission_percentage,
  i.rep_percentage,
  i.supplier_net,
  i.volume_available AS total_volume,
  COALESCE(
    (SELECT SUM(reserved_volume) 
     FROM inventory_reservations r 
     WHERE r.product_sku = i.product_sku 
       AND r.city = i.city 
       AND r.state = i.state 
       AND r.status = 'active'
       AND r.expires_at > now()
    ), 0
  ) AS reserved_volume,
  i.volume_available - COALESCE(
    (SELECT SUM(reserved_volume) 
     FROM inventory_reservations r 
     WHERE r.product_sku = i.product_sku 
       AND r.city = i.city 
       AND r.state = i.state 
       AND r.status = 'active'
       AND r.expires_at > now()
    ), 0
  ) AS available_volume,
  i.created_at,
  i.updated_at
FROM public.inventory i
WHERE i.expiry_date > CURRENT_DATE;

GRANT SELECT ON public.inventory_available TO authenticated;

-- FASE 2: Funções de banco de dados

-- Função para criar reserva
CREATE OR REPLACE FUNCTION public.create_inventory_reservation(
  p_opportunity_id UUID,
  p_proposal_id UUID,
  p_product_sku TEXT,
  p_city TEXT,
  p_state TEXT,
  p_volume NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available_volume NUMERIC;
  v_reservation_id UUID;
  v_inventory_id UUID;
BEGIN
  -- Verificar disponibilidade real
  SELECT available_volume, id INTO v_available_volume, v_inventory_id
  FROM inventory_available
  WHERE product_sku = p_product_sku
    AND city = p_city
    AND state = p_state
  LIMIT 1;
  
  IF v_available_volume IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado no estoque: % em %, %', p_product_sku, p_city, p_state;
  END IF;
  
  IF v_available_volume < p_volume THEN
    RAISE EXCEPTION 'Volume insuficiente. Disponível: %, Solicitado: %', v_available_volume, p_volume;
  END IF;
  
  -- Criar reserva
  INSERT INTO inventory_reservations (
    inventory_item_id,
    opportunity_id,
    proposal_id,
    product_sku,
    reserved_volume,
    city,
    state,
    status,
    expires_at
  ) VALUES (
    v_inventory_id,
    p_opportunity_id,
    p_proposal_id,
    p_product_sku,
    p_volume,
    p_city,
    p_state,
    'active',
    now() + INTERVAL '48 hours'
  ) RETURNING id INTO v_reservation_id;
  
  RETURN v_reservation_id;
END;
$$;

-- Função para expirar reservas
CREATE OR REPLACE FUNCTION public.expire_inventory_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  -- Marcar reservas expiradas
  UPDATE inventory_reservations
  SET 
    status = 'expired',
    updated_at = now()
  WHERE status = 'active'
    AND expires_at <= now()
    AND consumed_at IS NULL;
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  -- Atualizar status das propostas correspondentes
  UPDATE proposals
  SET 
    reservation_status = 'expired',
    updated_at = now()
  WHERE id IN (
    SELECT proposal_id 
    FROM inventory_reservations 
    WHERE status = 'expired'
      AND reservation_status != 'expired'
  );
  
  RETURN v_expired_count;
END;
$$;

-- Função para confirmar reserva
CREATE OR REPLACE FUNCTION public.confirm_inventory_reservation(p_proposal_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Marcar reservas como consumidas
  UPDATE inventory_reservations
  SET 
    status = 'consumed',
    consumed_at = now(),
    updated_at = now()
  WHERE proposal_id = p_proposal_id
    AND status = 'active';
  
  -- Atualizar status da proposta
  UPDATE proposals
  SET 
    reservation_status = 'confirmed',
    updated_at = now()
  WHERE id = p_proposal_id;
  
  RETURN TRUE;
END;
$$;

-- Função para cancelar reserva
CREATE OR REPLACE FUNCTION public.cancel_inventory_reservation(p_proposal_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE inventory_reservations
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE proposal_id = p_proposal_id
    AND status = 'active';
  
  UPDATE proposals
  SET 
    reservation_status = 'cancelled',
    updated_at = now()
  WHERE id = p_proposal_id;
  
  RETURN TRUE;
END;
$$;

-- View para relatório administrativo
CREATE OR REPLACE VIEW public.inventory_reservations_report AS
SELECT 
  i.product_name,
  i.product_sku,
  i.city,
  i.state,
  i.volume_available AS total_volume,
  COALESCE(SUM(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.reserved_volume ELSE 0 END), 0) AS reserved_volume,
  i.volume_available - COALESCE(SUM(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.reserved_volume ELSE 0 END), 0) AS available_volume,
  COUNT(DISTINCT CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.id END) AS active_reservations,
  MIN(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.expires_at END) AS next_expiry
FROM inventory i
LEFT JOIN inventory_reservations r ON 
  r.product_sku = i.product_sku 
  AND r.city = i.city 
  AND r.state = i.state
WHERE i.expiry_date > CURRENT_DATE
GROUP BY i.id, i.product_name, i.product_sku, i.city, i.state, i.volume_available
ORDER BY i.product_name, i.state, i.city;

GRANT SELECT ON public.inventory_reservations_report TO authenticated;