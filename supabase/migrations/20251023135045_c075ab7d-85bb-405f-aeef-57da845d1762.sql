-- Tornar produtos_lista nullable para compatibilidade
ALTER TABLE public.representative_applications 
ALTER COLUMN produtos_lista DROP NOT NULL;

-- Adicionar valor padrão vazio
ALTER TABLE public.representative_applications 
ALTER COLUMN produtos_lista SET DEFAULT '';

-- Atualizar registros existentes com valor vazio
UPDATE public.representative_applications 
SET produtos_lista = '' 
WHERE produtos_lista IS NULL;