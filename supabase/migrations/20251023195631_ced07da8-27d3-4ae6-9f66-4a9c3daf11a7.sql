-- A coluna stage é do tipo text, não enum
-- Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage) WHERE status = 'active';

-- Adicionar constraint de CHECK para validar os valores permitidos de stage
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_stage_check;

ALTER TABLE opportunities ADD CONSTRAINT opportunities_stage_check 
CHECK (stage IN (
  'com_oportunidade', 
  'proposta_apresentada', 
  'em_negociacao', 
  'em_aprovacao', 
  'proposta_criada',
  'proposta_enviada',
  'em_faturamento',
  'em_pagamento',
  'em_entrega'
));

-- Comentário explicativo sobre as etapas
COMMENT ON COLUMN opportunities.stage IS 'Etapas do pipeline: proposta_criada (inicial), proposta_enviada (após WhatsApp), em_faturamento (aprovada), em_pagamento (manual), em_entrega (manual)';