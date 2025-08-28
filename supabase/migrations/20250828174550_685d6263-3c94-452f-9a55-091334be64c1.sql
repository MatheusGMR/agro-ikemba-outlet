-- Atualizar todos os usuários existentes para status approved
UPDATE public.users SET status = 'approved' WHERE status = 'pending';

-- Alterar o valor padrão da coluna status para 'approved'
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'approved';