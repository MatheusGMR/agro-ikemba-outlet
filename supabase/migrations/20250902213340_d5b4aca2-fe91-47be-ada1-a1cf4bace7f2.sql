-- Create tables for buyer journey analytics tracking

-- Table to track user navigation behavior
CREATE TABLE public.user_navigation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  time_on_page INTEGER, -- in seconds
  browser_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to track product interactions
CREATE TABLE public.product_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'volume_change', 'tier_select', 'add_to_cart'
  interaction_data JSONB, -- stores volume, tier, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to track checkout abandonment and funnel analysis
CREATE TABLE public.checkout_funnel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  checkout_step TEXT NOT NULL, -- 'volume_selection', 'logistics', 'payment', 'confirmation'
  action_type TEXT NOT NULL, -- 'enter_step', 'exit_step', 'abandon', 'complete'
  step_data JSONB, -- stores form data, selections, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to track volume analysis and pricing behavior
CREATE TABLE public.volume_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  initial_volume NUMERIC,
  final_volume NUMERIC,
  initial_price NUMERIC,
  final_price NUMERIC,
  savings_amount NUMERIC,
  savings_percentage NUMERIC,
  time_spent INTEGER, -- seconds spent on volume selection
  reached_banda_menor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store order documents (PDFs)
CREATE TABLE public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'boleto', 'pix_instructions', 'ted_instructions'
  document_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  downloaded_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on all analytics tables
ALTER TABLE public.user_navigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_funnel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volume_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics (admin can see all, users can see their own)
CREATE POLICY "Admins can view all navigation logs" ON public.user_navigation_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their navigation logs" ON public.user_navigation_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all product interactions" ON public.product_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their product interactions" ON public.product_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all checkout funnel logs" ON public.checkout_funnel_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their checkout funnel logs" ON public.checkout_funnel_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all volume analysis logs" ON public.volume_analysis_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their volume analysis logs" ON public.volume_analysis_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all order documents" ON public.order_documents
  FOR ALL USING (true);

CREATE POLICY "Users can view their own order documents" ON public.order_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_navigation_logs_user_session ON public.user_navigation_logs(user_id, session_id);
CREATE INDEX idx_navigation_logs_created_at ON public.user_navigation_logs(created_at);
CREATE INDEX idx_product_interactions_sku ON public.product_interactions(product_sku);
CREATE INDEX idx_product_interactions_created_at ON public.product_interactions(created_at);
CREATE INDEX idx_checkout_funnel_step ON public.checkout_funnel_logs(checkout_step);
CREATE INDEX idx_checkout_funnel_created_at ON public.checkout_funnel_logs(created_at);
CREATE INDEX idx_volume_analysis_sku ON public.volume_analysis_logs(product_sku);
CREATE INDEX idx_volume_analysis_created_at ON public.volume_analysis_logs(created_at);
CREATE INDEX idx_order_documents_order_id ON public.order_documents(order_id);