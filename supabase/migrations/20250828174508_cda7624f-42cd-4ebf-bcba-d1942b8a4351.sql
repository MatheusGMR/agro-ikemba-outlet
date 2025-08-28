-- Atualizar todos os usuários existentes para status active
UPDATE public.users SET status = 'active' WHERE status = 'pending';

-- Alterar o valor padrão da coluna status para 'active'
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'active';