-- Create table for representative applications
CREATE TABLE public.representative_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_envio timestamp with time zone NOT NULL DEFAULT now(),
  status text CHECK (status IN ('aguardando', 'reprovado', 'aprovado')) NOT NULL DEFAULT 'aguardando',
  motivo_status text,
  
  -- Identificação (Seção 1)
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  cidade text NOT NULL,
  uf text NOT NULL,
  linkedin text,
  
  -- Pessoa Jurídica (Seção 2)
  possui_pj boolean NOT NULL,
  cnpj text,
  razao_social text,
  
  -- Atuação Comercial (Seção 3)
  experiencia_anos text NOT NULL,
  segmentos text[] NOT NULL,
  canais text[] NOT NULL,
  regioes text[] NOT NULL,
  conflito_interesse boolean DEFAULT false,
  conflito_detalhe text,
  
  -- Produtos e Forecast (Seção 4)
  produtos_lista text NOT NULL,
  forecast_data jsonb, -- Para armazenar produtos + volumes
  
  -- Infraestrutura (Seção 5)
  infra_celular boolean DEFAULT true,
  infra_internet boolean DEFAULT true,
  infra_veic_proprio boolean DEFAULT false,
  infra_veic_alugado boolean DEFAULT false,
  
  -- Documentos (Seção 6)
  docs_ok boolean DEFAULT false,
  doc_urls jsonb, -- URLs dos documentos uploadados
  
  -- Termos (Seção 7)
  termos_aceitos boolean NOT NULL DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.representative_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for representative applications
CREATE POLICY "Anyone can insert representative applications" 
ON public.representative_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all representative applications" 
ON public.representative_applications 
FOR SELECT 
USING (check_admin_access());

CREATE POLICY "Admins can update representative applications" 
ON public.representative_applications 
FOR UPDATE 
USING (check_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_representative_applications_updated_at
BEFORE UPDATE ON public.representative_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();