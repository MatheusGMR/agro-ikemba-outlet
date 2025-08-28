-- Corrigir search_path das funções para segurança
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;