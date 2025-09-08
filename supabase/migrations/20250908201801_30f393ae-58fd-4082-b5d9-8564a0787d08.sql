-- Primeiro, tornar user_id obrigatório na tabela orders para garantir integridade
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- Criar uma view que combina dados do pedido com informações do usuário
CREATE OR REPLACE VIEW public.orders_with_user_info AS
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
    u.name as user_name,
    u.phone as user_phone,
    u.email as user_email,
    u.company as user_company,
    u.tipo as user_type
FROM public.orders o
INNER JOIN public.users u ON o.user_id = u.id;

-- Garantir que a view é acessível para usuários autenticados
GRANT SELECT ON public.orders_with_user_info TO authenticated;

-- Criar uma função para obter detalhes completos de um pedido específico
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
    user_name text,
    user_phone text,
    user_email text,
    user_company text,
    user_type text,
    products_summary text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        owui.id,
        owui.order_number,
        owui.items,
        owui.total_amount,
        owui.payment_method,
        owui.logistics_option,
        owui.status,
        owui.created_at,
        owui.updated_at,
        owui.user_name,
        owui.user_phone,
        owui.user_email,
        owui.user_company,
        owui.user_type,
        (
            SELECT string_agg(
                (item->>'name') || ' (' || (item->>'volume') || ' ' || 
                COALESCE((item->>'unit'), 'L') || ') - R$ ' || 
                (item->>'price')::numeric::text, 
                ', '
            )
            FROM jsonb_array_elements(owui.items) AS item
        ) as products_summary
    FROM public.orders_with_user_info owui
    WHERE owui.id = order_id;
END;
$$;

-- Criar política RLS para a view
CREATE POLICY "Users can view their own orders with user info" 
ON public.orders_with_user_info 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = orders_with_user_info.id 
        AND o.user_id = auth.uid()
    )
);

-- Habilitar RLS na view (se possível)
-- Note: Views herdam as políticas das tabelas base, mas podemos criar políticas específicas

-- Comentário para documentar a estrutura dos items no JSONB
COMMENT ON COLUMN public.orders.items IS 'Estrutura esperada: [{"id": "sku", "name": "nome_produto", "price": valor_unitario, "volume": quantidade, "total": valor_total, "sku": "codigo"}]';