-- FASE 1: Adicionar novos campos à tabela users
ALTER TABLE public.users 
ADD COLUMN phone TEXT,
ADD COLUMN company TEXT;

-- Função para extrair dados do campo cnpj híbrido
CREATE OR REPLACE FUNCTION extract_phone_company_from_cnpj()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    phone_value TEXT;
    company_value TEXT;
    cnpj_value TEXT;
BEGIN
    -- Processar cada usuário existente
    FOR user_record IN SELECT id, cnpj FROM public.users WHERE cnpj IS NOT NULL
    LOOP
        -- Resetar valores
        phone_value := NULL;
        company_value := NULL;
        cnpj_value := user_record.cnpj;
        
        -- Verificar se é um formato híbrido (contém "Empresa:" e "Tel:")
        IF user_record.cnpj LIKE '%Empresa:%' AND user_record.cnpj LIKE '%Tel:%' THEN
            -- Extrair empresa
            company_value := TRIM(SPLIT_PART(SPLIT_PART(user_record.cnpj, 'Empresa:', 2), '|', 1));
            
            -- Extrair telefone
            phone_value := TRIM(SPLIT_PART(user_record.cnpj, 'Tel:', 2));
            
            -- Limpar o campo cnpj (será NULL pois não é um CNPJ real)
            cnpj_value := NULL;
            
        -- Verificar se é um CNPJ válido (apenas números, hífen e barra)
        ELSIF user_record.cnpj ~ '^[0-9.\-/]+$' AND LENGTH(REPLACE(REPLACE(REPLACE(user_record.cnpj, '.', ''), '-', ''), '/', '')) = 14 THEN
            -- É um CNPJ válido, manter como está
            cnpj_value := user_record.cnpj;
            
        ELSE
            -- Formato desconhecido, limpar o campo cnpj
            cnpj_value := NULL;
        END IF;
        
        -- Atualizar o registro
        UPDATE public.users 
        SET 
            phone = phone_value,
            company = company_value,
            cnpj = cnpj_value
        WHERE id = user_record.id;
        
        -- Log para debug
        RAISE NOTICE 'Processado usuário %: phone=%, company=%, cnpj=%', 
            user_record.id, phone_value, company_value, cnpj_value;
    END LOOP;
END;
$$;

-- Executar a migração
SELECT extract_phone_company_from_cnpj();

-- Remover a função após uso
DROP FUNCTION extract_phone_company_from_cnpj();