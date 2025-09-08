-- Fix the generate_order_number function to use correct table and add concurrency protection
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  -- Advisory lock to prevent race conditions during order number generation
  PERFORM pg_advisory_xact_lock(424242);
  
  year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Fix: Query the correct table 'orders' instead of 'sales_orders'
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '^ORD(\d+)-') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE order_number ~ ('^ORD\d+-' || year_suffix || '$');
  
  RETURN 'ORD' || LPAD(next_number::TEXT, 4, '0') || '-' || year_suffix;
END;
$function$;