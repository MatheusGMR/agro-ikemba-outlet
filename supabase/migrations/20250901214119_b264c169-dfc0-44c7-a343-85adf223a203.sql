-- Update opportunities table stage default value to match the CHECK constraint
ALTER TABLE public.opportunities 
ALTER COLUMN stage SET DEFAULT 'com_oportunidade';