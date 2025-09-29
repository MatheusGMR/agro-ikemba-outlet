-- Criar tabela revendas para dados específicos das revendas/cooperativas
CREATE TABLE public.revendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Dados da empresa
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  
  -- Endereço completo
  endereco_completo TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  
  -- Informações bancárias
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT DEFAULT 'corrente',
  chave_pix TEXT,
  
  -- Configurações operacionais
  regioes_atuacao TEXT[] DEFAULT '{}',
  tipos_produto_interesse TEXT[] DEFAULT '{}',
  volume_minimo_compra NUMERIC DEFAULT 0,
  
  -- Configurações de contato
  telefone_comercial TEXT,
  email_comercial TEXT,
  website TEXT,
  
  -- Dados de operação
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revendas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para revendas
CREATE POLICY "Revendas can view their own data"
  ON public.revendas
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Revendas can update their own data"
  ON public.revendas
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Revendas can insert their own data"
  ON public.revendas
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin access to revendas"
  ON public.revendas
  FOR ALL
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_revendas_updated_at
  BEFORE UPDATE ON public.revendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para sincronizar dados entre revendas e users
CREATE OR REPLACE FUNCTION public.sync_revenda_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se usuário já existe
  IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email_comercial OR id = NEW.user_id) THEN
    -- Atualizar usuário existente
    UPDATE public.users 
    SET 
      name = NEW.razao_social,
      company = NEW.razao_social,
      phone = COALESCE(NEW.telefone_comercial, phone),
      cnpj = NEW.cnpj,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para sincronização
CREATE TRIGGER sync_revenda_to_users_trigger
  AFTER INSERT OR UPDATE ON public.revendas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_revenda_to_users();

-- Criar tabela para produtos das revendas
CREATE TABLE public.revenda_produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  revenda_id UUID NOT NULL REFERENCES public.revendas(id) ON DELETE CASCADE,
  
  -- Dados do produto
  produto_sku TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  ingrediente_ativo TEXT,
  categoria TEXT NOT NULL,
  
  -- Estoque e preços
  volume_disponivel NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'L',
  preco_unitario NUMERIC NOT NULL,
  preco_minimo NUMERIC,
  
  -- Localização e logística
  cidade_origem TEXT NOT NULL,
  estado_origem TEXT NOT NULL,
  prazo_entrega_dias INTEGER DEFAULT 7,
  
  -- Validade e condições
  data_validade DATE NOT NULL,
  condicoes_armazenamento TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'disponivel',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para revenda_produtos
ALTER TABLE public.revenda_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para revenda_produtos
CREATE POLICY "Revendas can manage their products"
  ON public.revenda_produtos
  FOR ALL
  USING (revenda_id IN (
    SELECT id FROM public.revendas WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public read access for revenda products"
  ON public.revenda_produtos
  FOR SELECT
  USING (status = 'disponivel');

CREATE POLICY "Admin access to revenda products"
  ON public.revenda_produtos
  FOR ALL
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_revenda_produtos_updated_at
  BEFORE UPDATE ON public.revenda_produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para ofertas de compra
CREATE TABLE public.ofertas_compra (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  revenda_id UUID NOT NULL REFERENCES public.revendas(id) ON DELETE CASCADE,
  
  -- Produto alvo
  produto_sku TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  volume_desejado NUMERIC NOT NULL,
  preco_ofertado NUMERIC NOT NULL,
  
  -- Localização e entrega
  cidade_entrega TEXT NOT NULL,
  estado_entrega TEXT NOT NULL,
  prazo_entrega_desejado INTEGER DEFAULT 15,
  
  -- Status e observações
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  resposta_fornecedor TEXT,
  
  -- Validade da oferta
  validade_oferta DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para ofertas_compra
ALTER TABLE public.ofertas_compra ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ofertas_compra
CREATE POLICY "Revendas can manage their offers"
  ON public.ofertas_compra
  FOR ALL
  USING (revenda_id IN (
    SELECT id FROM public.revendas WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin access to purchase offers"
  ON public.ofertas_compra
  FOR ALL
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ofertas_compra_updated_at
  BEFORE UPDATE ON public.ofertas_compra
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();