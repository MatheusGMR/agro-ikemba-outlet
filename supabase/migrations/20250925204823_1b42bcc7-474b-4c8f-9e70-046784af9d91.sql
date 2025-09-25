-- Corrigir problemas de segurança detectados pelo linter

-- 1. Recriar função sync_rep_client_to_users com search_path seguro
CREATE OR REPLACE FUNCTION public.sync_rep_client_to_users()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    existing_user_id UUID;
    user_tipo TEXT;
BEGIN
    -- Determinar tipo baseado na presença de CNPJ
    IF NEW.cnpj_cpf IS NOT NULL AND length(NEW.cnpj_cpf) = 18 THEN
        user_tipo := 'Pessoa Jurídica';
    ELSE
        user_tipo := 'Pessoa Física';
    END IF;

    -- Verificar se usuário já existe por email ou CNPJ/CPF
    SELECT id INTO existing_user_id 
    FROM public.users 
    WHERE email = NEW.email OR cnpj = NEW.cnpj_cpf
    LIMIT 1;

    IF existing_user_id IS NULL THEN
        -- Criar novo usuário
        INSERT INTO public.users (
            name, 
            email, 
            phone, 
            company, 
            cnpj, 
            tipo,
            status
        ) VALUES (
            COALESCE(NEW.contact_name, NEW.company_name),
            NEW.email,
            NEW.phone,
            NEW.company_name,
            NEW.cnpj_cpf,
            user_tipo,
            'approved'
        );
    ELSE
        -- Atualizar usuário existente se necessário
        UPDATE public.users 
        SET 
            name = COALESCE(NEW.contact_name, NEW.company_name),
            phone = COALESCE(NEW.phone, phone),
            company = COALESCE(NEW.company_name, company),
            cnpj = COALESCE(NEW.cnpj_cpf, cnpj),
            updated_at = now()
        WHERE id = existing_user_id;
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Recriar função find_representative_by_identifier com search_path seguro
CREATE OR REPLACE FUNCTION public.find_representative_by_identifier(
    identifier_value TEXT
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    rep_id UUID;
BEGIN
    -- Buscar por email primeiro, depois por nome
    SELECT id INTO rep_id
    FROM public.representatives
    WHERE email ILIKE '%' || identifier_value || '%' 
       OR name ILIKE '%' || identifier_value || '%'
    LIMIT 1;
    
    RETURN rep_id;
END;
$$;

-- 3. Recriar função validate_cnpj com search_path seguro
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
IMMUTABLE 
SET search_path = public
AS $$
BEGIN
    -- Remove caracteres não numéricos
    cnpj_input := regexp_replace(cnpj_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 14 dígitos
    IF length(cnpj_input) != 14 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se não são todos números iguais
    IF cnpj_input IN ('00000000000000', '11111111111111', '22222222222222', 
                      '33333333333333', '44444444444444', '55555555555555',
                      '66666666666666', '77777777777777', '88888888888888', 
                      '99999999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Por simplicidade, retorna true se passou nas validações básicas
    RETURN TRUE;
END;
$$;