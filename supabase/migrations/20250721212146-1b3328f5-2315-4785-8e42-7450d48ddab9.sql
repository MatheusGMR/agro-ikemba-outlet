
-- Adicionar constraints únicas para permitir UPSERT adequado

-- Para commodity_prices: constraint única baseada em commodity_name, source, region, date
ALTER TABLE public.commodity_prices 
ADD CONSTRAINT commodity_prices_unique_key 
UNIQUE (commodity_name, source, region, date);

-- Para market_prices: constraint única baseada em input_id, source, source_name, region, date
ALTER TABLE public.market_prices 
ADD CONSTRAINT market_prices_unique_key 
UNIQUE (input_id, source, source_name, region, date);

-- Adicionar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_commodity_prices_lookup 
ON public.commodity_prices (commodity_name, region, date DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_lookup 
ON public.market_prices (input_id, region, date DESC);
