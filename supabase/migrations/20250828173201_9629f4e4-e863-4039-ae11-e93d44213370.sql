-- Make phone field required in users table
ALTER TABLE public.users 
ALTER COLUMN phone SET NOT NULL;