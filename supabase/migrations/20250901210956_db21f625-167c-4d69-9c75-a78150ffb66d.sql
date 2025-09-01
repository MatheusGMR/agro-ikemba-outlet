-- Atualizar a coluna stage da tabela opportunities para usar os novos estágios
ALTER TABLE public.opportunities 
DROP CONSTRAINT IF EXISTS opportunities_stage_check;

-- Adicionar nova constraint com os novos estágios
ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_stage_check 
CHECK (stage IN ('com_oportunidade', 'proposta_apresentada', 'em_negociacao', 'em_aprovacao', 'em_entrega'));

-- Atualizar registros existentes para mapeamento dos estágios
UPDATE public.opportunities 
SET stage = CASE 
  WHEN stage IN ('prospection', 'qualification', 'needs_analysis', 'viability') THEN 'com_oportunidade'
  WHEN stage = 'proposal_sent' THEN 'proposta_apresentada'
  WHEN stage = 'client_approval' THEN 'em_aprovacao'
  WHEN stage = 'negotiation' THEN 'em_negociacao'
  WHEN stage = 'closed_won' THEN 'em_entrega'
  WHEN stage = 'closed_lost' THEN 'com_oportunidade' -- Recolocar no início do funil
  ELSE 'com_oportunidade'
END;