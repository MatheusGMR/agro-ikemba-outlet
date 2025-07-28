-- Corrigir problemas de segurança identificados

-- 1. Corrigir search_path para funções (criando uma versão segura da função update_updated_at_column)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;