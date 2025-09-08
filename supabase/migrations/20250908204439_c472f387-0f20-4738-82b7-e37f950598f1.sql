-- Add boleto-specific fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS boleto_url TEXT,
ADD COLUMN IF NOT EXISTS boleto_barcode TEXT,
ADD COLUMN IF NOT EXISTS boleto_line TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;