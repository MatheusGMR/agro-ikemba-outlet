-- Simplificação da estrutura de preços: tornar campos de comissão opcionais
-- Fase 2.1: Tornar campos de comissão nullable para permitir uso apenas no módulo de representantes

ALTER TABLE inventory 
  ALTER COLUMN commission_unit DROP NOT NULL,
  ALTER COLUMN net_commission DROP NOT NULL,
  ALTER COLUMN commission_percentage DROP NOT NULL,
  ALTER COLUMN rep_percentage DROP NOT NULL,
  ALTER COLUMN supplier_net DROP NOT NULL;

-- Fase 2.2: Remover campo redundante preco_unitario (usar base_price como referência)
ALTER TABLE inventory 
  DROP COLUMN IF EXISTS preco_unitario;

-- Comentário: Os valores existentes de comissão serão mantidos
-- Novos produtos podem ser criados sem especificar comissões
-- Comissões permanecem disponíveis para o módulo de representantes autenticados