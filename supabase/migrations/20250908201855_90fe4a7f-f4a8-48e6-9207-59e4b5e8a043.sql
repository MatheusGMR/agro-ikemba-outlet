-- Remover a view anterior e criar uma versão mais segura
DROP VIEW IF EXISTS public.orders_with_user_info;

-- Criar uma view simples sem SECURITY DEFINER (mais segura)
CREATE VIEW public.orders_with_user_info AS
SELECT 
    o.id,
    o.order_number,
    o.items,
    o.total_amount,
    o.payment_method,
    o.logistics_option,
    o.status,
    o.created_at,
    o.updated_at,
    o.user_id,
    u.name as user_name,
    u.phone as user_phone,
    u.email as user_email,
    u.company as user_company,
    u.tipo as user_type
FROM public.orders o
INNER JOIN public.users u ON o.user_id = u.id;

-- Garantir que a view é acessível para usuários autenticados
GRANT SELECT ON public.orders_with_user_info TO authenticated;

-- Recriar a função de detalhes sem usar SECURITY DEFINER na view
CREATE OR REPLACE FUNCTION public.get_order_details(order_id uuid)
RETURNS TABLE (
    id uuid,
    order_number text,
    items jsonb,
    total_amount numeric,
    payment_method text,
    logistics_option text,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    user_id uuid,
    user_name text,
    user_phone text,
    user_email text,
    user_company text,
    user_type text,
    products_summary text
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        o.items,
        o.total_amount,
        o.payment_method,
        o.logistics_option,
        o.status,
        o.created_at,
        o.updated_at,
        o.user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email,
        u.company as user_company,
        u.tipo as user_type,
        (
            SELECT string_agg(
                (item->>'name') || ' (' || (item->>'volume') || ' ' || 
                COALESCE((item->>'unit'), 'L') || ') - R$ ' || 
                (item->>'price')::numeric::text, 
                ', '
            )
            FROM jsonb_array_elements(o.items) AS item
        ) as products_summary
    FROM public.orders o
    INNER JOIN public.users u ON o.user_id = u.id
    WHERE o.id = order_id AND o.user_id = auth.uid();
END;
$$;