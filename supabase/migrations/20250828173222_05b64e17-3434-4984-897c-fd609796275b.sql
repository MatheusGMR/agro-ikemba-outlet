-- First, update null phone values with empty string
UPDATE public.users 
SET phone = '' 
WHERE phone IS NULL;

-- Then make phone field required
ALTER TABLE public.users 
ALTER COLUMN phone SET NOT NULL;