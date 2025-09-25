-- 1. Expandir tabela rep_clients com campos rurais opcionais
ALTER TABLE public.rep_clients 
ADD COLUMN IF NOT EXISTS property_size NUMERIC,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS main_crops TEXT[],
ADD COLUMN IF NOT EXISTS secondary_crops TEXT[],
ADD COLUMN IF NOT EXISTS ie_numbers TEXT[],
ADD COLUMN IF NOT EXISTS cnae_codes TEXT[],
ADD COLUMN IF NOT EXISTS partnership_details TEXT,
ADD COLUMN IF NOT EXISTS accountant_name TEXT,
ADD COLUMN IF NOT EXISTS accountant_contact TEXT,
ADD COLUMN IF NOT EXISTS nirf TEXT;

-- 2. Criar função para sincronizar rep_clients com users
CREATE OR REPLACE FUNCTION public.sync_rep_client_to_users()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS sync_rep_client_trigger ON public.rep_clients;
CREATE TRIGGER sync_rep_client_trigger
    AFTER INSERT OR UPDATE ON public.rep_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_rep_client_to_users();

-- 4. Criar função para buscar representante por nome/email
CREATE OR REPLACE FUNCTION public.find_representative_by_identifier(
    identifier_value TEXT
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Inserir dados do cliente Leandro para o representante Vinicius
DO $$
DECLARE
    vinicius_rep_id UUID;
BEGIN
    -- Buscar ID do representante Vinicius
    SELECT find_representative_by_identifier('vinicius') INTO vinicius_rep_id;
    
    IF vinicius_rep_id IS NOT NULL THEN
        -- Inserir cliente Leandro
        INSERT INTO public.rep_clients (
            representative_id,
            company_name,
            cnpj_cpf,
            contact_name,
            contact_function,
            email,
            phone,
            city,
            state,
            property_size,
            property_type,
            main_crops,
            secondary_crops,
            ie_numbers,
            cnae_codes,
            partnership_details,
            accountant_name,
            credit_limit
        ) VALUES (
            vinicius_rep_id,
            'LEANDRO GOMES MARIANO CESAR E OUTRA',
            '34.715.180/0001-00',
            'Leandro Gomes Mariano Cesar',
            'Proprietário/Produtor Rural',
            'agropecuariasaojorgegmo@hotmail.com',
            '(18) 3904-5285',
            'Itabera',
            'SP',
            1200, -- propriedade estimada em hectares
            'Múltiplas Fazendas',
            ARRAY['soja'],
            ARRAY['milho', 'trigo', 'feijão'],
            ARRAY['365.036.944.111', '365.048.250.113', '365.050.316.119'],
            ARRAY['0111-2/01'], -- Cultivo de soja
            'Sociedade em nome coletivo com Andressa',
            'A definir',
            50000.00
        );
    END IF;
END $$;

-- 6. Criar função para validar CNPJ
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN AS $$
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
    -- Implementação completa do algoritmo de validação pode ser adicionada depois
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rep_clients_email ON public.rep_clients(email);
CREATE INDEX IF NOT EXISTS idx_rep_clients_cnpj ON public.rep_clients(cnpj_cpf);
CREATE INDEX IF NOT EXISTS idx_rep_clients_representative_id ON public.rep_clients(representative_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_cnpj ON public.users(cnpj);