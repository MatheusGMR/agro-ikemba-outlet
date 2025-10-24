-- Criar tabela delivery_simulations
CREATE TABLE delivery_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  
  -- Tipo de operação
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('retirada', 'entrega_nacional', 'entrega_internacional')),
  
  -- Localizações
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_lat NUMERIC,
  origin_lon NUMERIC,
  
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_lat NUMERIC,
  destination_lon NUMERIC,
  
  -- Cálculos de distância
  distance_km NUMERIC NOT NULL,
  round_trip_km NUMERIC NOT NULL,
  
  -- Cálculos de frete
  freight_rate_per_km NUMERIC NOT NULL,
  freight_subtotal NUMERIC NOT NULL,
  
  insurance_percentage NUMERIC NOT NULL,
  insurance_amount NUMERIC NOT NULL,
  
  total_freight_cost NUMERIC NOT NULL,
  
  -- Relação com carga
  cargo_value NUMERIC NOT NULL,
  cargo_volume NUMERIC NOT NULL,
  
  freight_per_liter NUMERIC NOT NULL,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_delivery_simulations_opportunity ON delivery_simulations(opportunity_id);
CREATE INDEX idx_delivery_simulations_proposal ON delivery_simulations(proposal_id);

-- Trigger para updated_at
CREATE TRIGGER update_delivery_simulations_updated_at
  BEFORE UPDATE ON delivery_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE delivery_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Representatives can view their delivery simulations"
  ON delivery_simulations FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM opportunities 
      WHERE representative_id IN (
        SELECT id FROM representatives WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Representatives can manage their delivery simulations"
  ON delivery_simulations FOR ALL
  USING (
    opportunity_id IN (
      SELECT id FROM opportunities 
      WHERE representative_id IN (
        SELECT id FROM representatives WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin access to delivery simulations"
  ON delivery_simulations FOR ALL
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

-- Atualizar tabela proposals
ALTER TABLE proposals 
ADD COLUMN delivery_type TEXT DEFAULT 'retirada' CHECK (delivery_type IN ('retirada', 'entrega_nacional', 'entrega_internacional')),
ADD COLUMN delivery_simulation_id UUID REFERENCES delivery_simulations(id),
ADD COLUMN freight_cost NUMERIC DEFAULT 0,
ADD COLUMN freight_per_liter NUMERIC DEFAULT 0;

-- Atualizar tabela opportunity_items
ALTER TABLE opportunity_items
ADD COLUMN origin_city TEXT,
ADD COLUMN origin_state TEXT;