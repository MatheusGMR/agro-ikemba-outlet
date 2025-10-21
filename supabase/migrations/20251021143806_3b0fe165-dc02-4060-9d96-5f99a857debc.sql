-- Adicionar colunas de overprice na tabela opportunity_items
ALTER TABLE public.opportunity_items
ADD COLUMN overprice_percentage NUMERIC DEFAULT 0,
ADD COLUMN overprice_amount NUMERIC DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.opportunity_items.overprice_percentage IS 
'Percentual de overprice aplicado pelo representante sobre o preço afiliado (ex: 5.00 = 5%)';

COMMENT ON COLUMN public.opportunity_items.overprice_amount IS 
'Valor em reais do overprice por unidade aplicado pelo representante';

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_opportunity_items_overprice ON public.opportunity_items(opportunity_id, overprice_amount) 
WHERE overprice_amount > 0;