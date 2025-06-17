
-- Criar tabela para usuários pendentes/aprovados
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  conheceu TEXT,
  cnpj TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos usuários (registro público)
CREATE POLICY "Anyone can register" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Política para permitir que admins atualizem status dos usuários
CREATE POLICY "Admins can update user status" 
  ON public.users 
  FOR UPDATE 
  USING (true);

-- Criar função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_created_at ON public.users(created_at);
