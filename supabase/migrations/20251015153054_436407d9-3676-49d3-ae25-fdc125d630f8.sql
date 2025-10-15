-- Corrigir views para usar security_invoker ao invés de security_definer
DROP VIEW IF EXISTS public.inventory_available;
DROP VIEW IF EXISTS public.inventory_reservations_report;

-- Recriar view inventory_available com security_invoker
CREATE VIEW public.inventory_available
WITH (security_invoker = true)
AS
SELECT 
  i.id,
  i.product_sku,
  i.product_name,
  i.manufacturer,
  i.active_ingredient,
  i.mapa_number,
  i.packaging,
  i.unit,
  i.state,
  i.city,
  i.expiry_date,
  i.base_price,
  i.preco_banda_menor,
  i.preco_banda_maior,
  i.commission_unit,
  i.net_commission,
  i.commission_percentage,
  i.rep_percentage,
  i.supplier_net,
  i.volume_available AS total_volume,
  COALESCE(
    (SELECT SUM(reserved_volume) 
     FROM inventory_reservations r 
     WHERE r.product_sku = i.product_sku 
       AND r.city = i.city 
       AND r.state = i.state 
       AND r.status = 'active'
       AND r.expires_at > now()
    ), 0
  ) AS reserved_volume,
  i.volume_available - COALESCE(
    (SELECT SUM(reserved_volume) 
     FROM inventory_reservations r 
     WHERE r.product_sku = i.product_sku 
       AND r.city = i.city 
       AND r.state = i.state 
       AND r.status = 'active'
       AND r.expires_at > now()
    ), 0
  ) AS available_volume,
  i.created_at,
  i.updated_at
FROM public.inventory i
WHERE i.expiry_date > CURRENT_DATE;

GRANT SELECT ON public.inventory_available TO authenticated;

-- Recriar view inventory_reservations_report com security_invoker
CREATE VIEW public.inventory_reservations_report
WITH (security_invoker = true)
AS
SELECT 
  i.product_name,
  i.product_sku,
  i.city,
  i.state,
  i.volume_available AS total_volume,
  COALESCE(SUM(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.reserved_volume ELSE 0 END), 0) AS reserved_volume,
  i.volume_available - COALESCE(SUM(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.reserved_volume ELSE 0 END), 0) AS available_volume,
  COUNT(DISTINCT CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.id END) AS active_reservations,
  MIN(CASE WHEN r.status = 'active' AND r.expires_at > now() THEN r.expires_at END) AS next_expiry
FROM inventory i
LEFT JOIN inventory_reservations r ON 
  r.product_sku = i.product_sku 
  AND r.city = i.city 
  AND r.state = i.state
WHERE i.expiry_date > CURRENT_DATE
GROUP BY i.id, i.product_name, i.product_sku, i.city, i.state, i.volume_available
ORDER BY i.product_name, i.state, i.city;

GRANT SELECT ON public.inventory_reservations_report TO authenticated;