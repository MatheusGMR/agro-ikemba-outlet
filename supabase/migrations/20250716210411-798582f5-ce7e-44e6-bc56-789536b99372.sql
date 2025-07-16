-- Criar tabelas para o simulador de preços de insumos agrícolas

-- Tabela de insumos agrícolas
CREATE TABLE public.agricultural_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- herbicida, fungicida, fertilizante, etc.
  active_ingredient TEXT,
  concentration TEXT,
  unit TEXT NOT NULL DEFAULT 'L', -- L, kg, ton, etc.
  manufacturer TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de preços de mercado
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  input_id UUID REFERENCES public.agricultural_inputs(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'regional', 'quotation', 'historical'
  source_name TEXT NOT NULL, -- IEA/SP, DERAL/PR, Agrofy, etc.
  region TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  unit TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de preços de commodities
CREATE TABLE public.commodity_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_name TEXT NOT NULL, -- soja, milho, algodão, etc.
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  unit TEXT NOT NULL DEFAULT 'saca', -- saca, ton, kg
  source TEXT NOT NULL, -- B3, CBOT, local market
  region TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de simulações de preços
CREATE TABLE public.price_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  input_id UUID REFERENCES public.agricultural_inputs(id) ON DELETE SET NULL,
  simulation_name TEXT NOT NULL,
  
  -- Dados de custo
  purchase_cost DECIMAL(10,2) NOT NULL,
  operational_expenses DECIMAL(10,2) DEFAULT 0,
  taxes_percentage DECIMAL(5,2) DEFAULT 0,
  commissions_percentage DECIMAL(5,2) DEFAULT 0,
  target_margin_percentage DECIMAL(5,2) NOT NULL,
  
  -- Preços calculados
  calculated_price DECIMAL(10,2) NOT NULL,
  
  -- Dados de mercado para comparação
  regional_market_price DECIMAL(10,2),
  quotation_price DECIMAL(10,2),
  historical_average_price DECIMAL(10,2),
  commodity_price DECIMAL(10,2),
  commodity_name TEXT,
  
  -- Métricas calculadas
  market_positioning_percentage DECIMAL(5,2),
  competitive_difference DECIMAL(10,2),
  market_margin_percentage DECIMAL(5,2),
  trade_relation_simulated DECIMAL(10,4),
  trade_relation_market DECIMAL(10,4),
  
  region TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de dados regionais
CREATE TABLE public.regional_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_code TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  state TEXT NOT NULL,
  main_commodities TEXT[], -- array de commodities principais da região
  economic_indicators JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de fontes de dados de mercado
CREATE TABLE public.market_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL, -- 'government', 'platform', 'consultancy'
  api_endpoint TEXT,
  update_frequency TEXT, -- daily, weekly, monthly
  is_active BOOLEAN DEFAULT true,
  credentials_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.agricultural_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sources ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para dados públicos (insumos, preços de mercado, commodities)
CREATE POLICY "Public read access for agricultural inputs"
ON public.agricultural_inputs FOR SELECT
USING (true);

CREATE POLICY "Public read access for market prices"
ON public.market_prices FOR SELECT
USING (true);

CREATE POLICY "Public read access for commodity prices"
ON public.commodity_prices FOR SELECT
USING (true);

CREATE POLICY "Public read access for regional data"
ON public.regional_data FOR SELECT
USING (true);

CREATE POLICY "Public read access for market sources"
ON public.market_sources FOR SELECT
USING (true);

-- Políticas RLS para simulações (privadas por usuário ou públicas se user_id for nulo)
CREATE POLICY "Users can manage their own simulations"
ON public.price_simulations FOR ALL
USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Public simulations are readable by everyone"
ON public.price_simulations FOR SELECT
USING (user_id IS NULL);

-- Triggers para updated_at
CREATE TRIGGER update_agricultural_inputs_updated_at
BEFORE UPDATE ON public.agricultural_inputs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at
BEFORE UPDATE ON public.market_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commodity_prices_updated_at
BEFORE UPDATE ON public.commodity_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_simulations_updated_at
BEFORE UPDATE ON public.price_simulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regional_data_updated_at
BEFORE UPDATE ON public.regional_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_sources_updated_at
BEFORE UPDATE ON public.market_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.agricultural_inputs (name, category, active_ingredient, concentration, unit, manufacturer) VALUES
('Glifosato 480g/L', 'herbicida', 'Glifosato', '480g/L', 'L', 'Diversos'),
('2,4-D 670g/L', 'herbicida', '2,4-D', '670g/L', 'L', 'Diversos'),
('Atrazina 500g/L', 'herbicida', 'Atrazina', '500g/L', 'L', 'Diversos'),
('Tebuconazole 200g/L', 'fungicida', 'Tebuconazole', '200g/L', 'L', 'Diversos'),
('Ureia 45%', 'fertilizante', 'Ureia', '45%', 'ton', 'Diversos'),
('MAP', 'fertilizante', 'Fosfato Monoamônico', '', 'ton', 'Diversos');

INSERT INTO public.regional_data (region_code, region_name, state, main_commodities) VALUES
('SP-01', 'Região de Ribeirão Preto', 'SP', ARRAY['soja', 'milho', 'cana']),
('PR-01', 'Região de Cascavel', 'PR', ARRAY['soja', 'milho', 'trigo']),
('MT-01', 'Região de Sorriso', 'MT', ARRAY['soja', 'milho', 'algodao']),
('GO-01', 'Região de Rio Verde', 'GO', ARRAY['soja', 'milho', 'feijao']);

INSERT INTO public.market_sources (source_name, source_type, update_frequency) VALUES
('IEA/SP', 'government', 'weekly'),
('DERAL/PR', 'government', 'weekly'),
('CONAB', 'government', 'monthly'),
('Agrofy', 'platform', 'daily'),
('Cota Agro', 'platform', 'daily'),
('B3', 'exchange', 'daily'),
('Agroconsult', 'consultancy', 'weekly');