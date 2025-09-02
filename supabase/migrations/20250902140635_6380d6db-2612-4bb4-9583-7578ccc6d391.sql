-- Add contact_function field to rep_clients table
ALTER TABLE public.rep_clients 
ADD COLUMN contact_function TEXT;

-- Update existing records to have a default value if needed
UPDATE public.rep_clients 
SET contact_function = 'Outro' 
WHERE contact_function IS NULL;