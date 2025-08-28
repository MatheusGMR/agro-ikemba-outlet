-- Tabela de representantes
CREATE TABLE public.representatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  commission_percentage NUMERIC DEFAULT 1.0,
  region TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes dos representantes
CREATE TABLE public.rep_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  cnpj_cpf TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  state_registration TEXT,
  credit_limit NUMERIC DEFAULT 0,
  payment_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de oportunidades
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.rep_clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT DEFAULT 'prospection' CHECK (stage IN ('prospection', 'qualification', 'needs_analysis', 'viability', 'proposal_sent', 'client_approval', 'negotiation', 'closed_won', 'closed_lost')),
  estimated_value NUMERIC DEFAULT 0,
  estimated_commission NUMERIC DEFAULT 0,
  probability NUMERIC DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  next_action TEXT,
  next_action_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens da oportunidade
CREATE TABLE public.opportunity_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  commission_unit NUMERIC NOT NULL,
  total_commission NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propostas
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  proposal_number TEXT NOT NULL UNIQUE,
  total_value NUMERIC NOT NULL,
  total_commission NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  payment_terms TEXT,
  delivery_terms TEXT,
  validity_date DATE NOT NULL,
  observations TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
  client_approved_at TIMESTAMP WITH TIME ZONE,
  client_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE public.sales_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.rep_clients(id) ON DELETE CASCADE NOT NULL,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  total_value NUMERIC NOT NULL,
  total_commission NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending_invoice' CHECK (status IN ('pending_invoice', 'invoiced', 'shipped', 'delivered', 'cancelled')),
  invoice_date DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  tracking_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comissões
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  commission_amount NUMERIC NOT NULL,
  commission_percentage NUMERIC NOT NULL,
  base_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid')),
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de atividades
CREATE TABLE public.rep_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.rep_clients(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'whatsapp', 'visit', 'note', 'task')),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.rep_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_id UUID REFERENCES public.representatives(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rep_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rep_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rep_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para representantes
CREATE POLICY "Representatives can view their own data" ON public.representatives
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Representatives can update their own data" ON public.representatives
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage representatives" ON public.representatives
  FOR ALL USING (true);

-- Políticas RLS para clientes
CREATE POLICY "Representatives can manage their clients" ON public.rep_clients
  FOR ALL USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all clients" ON public.rep_clients
  FOR SELECT USING (true);

-- Políticas RLS para oportunidades
CREATE POLICY "Representatives can manage their opportunities" ON public.opportunities
  FOR ALL USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all opportunities" ON public.opportunities
  FOR SELECT USING (true);

-- Políticas RLS para itens de oportunidade
CREATE POLICY "Representatives can manage their opportunity items" ON public.opportunity_items
  FOR ALL USING (
    opportunity_id IN (
      SELECT id FROM public.opportunities 
      WHERE representative_id IN (
        SELECT id FROM public.representatives WHERE user_id = auth.uid()
      )
    )
  );

-- Políticas RLS para propostas
CREATE POLICY "Representatives can manage their proposals" ON public.proposals
  FOR ALL USING (
    opportunity_id IN (
      SELECT id FROM public.opportunities 
      WHERE representative_id IN (
        SELECT id FROM public.representatives WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all proposals" ON public.proposals
  FOR SELECT USING (true);

-- Políticas RLS para pedidos
CREATE POLICY "Representatives can manage their orders" ON public.sales_orders
  FOR ALL USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all orders" ON public.sales_orders
  FOR ALL USING (true);

-- Políticas RLS para comissões
CREATE POLICY "Representatives can view their commissions" ON public.commissions
  FOR SELECT USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all commissions" ON public.commissions
  FOR ALL USING (true);

-- Políticas RLS para atividades
CREATE POLICY "Representatives can manage their activities" ON public.rep_activities
  FOR ALL USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para notificações
CREATE POLICY "Representatives can view their notifications" ON public.rep_notifications
  FOR SELECT USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Representatives can update their notifications" ON public.rep_notifications
  FOR UPDATE USING (
    representative_id IN (
      SELECT id FROM public.representatives WHERE user_id = auth.uid()
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_representatives_updated_at
  BEFORE UPDATE ON public.representatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rep_clients_updated_at
  BEFORE UPDATE ON public.rep_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at
  BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de proposta
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '^P(\d+)-') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.proposals
  WHERE proposal_number ~ ('^P\d+-' || year_suffix || '$');
  
  RETURN 'P' || LPAD(next_number::TEXT, 4, '0') || '-' || year_suffix;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '^ORD(\d+)-') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales_orders
  WHERE order_number ~ ('^ORD\d+-' || year_suffix || '$');
  
  RETURN 'ORD' || LPAD(next_number::TEXT, 4, '0') || '-' || year_suffix;
END;
$$ LANGUAGE plpgsql;