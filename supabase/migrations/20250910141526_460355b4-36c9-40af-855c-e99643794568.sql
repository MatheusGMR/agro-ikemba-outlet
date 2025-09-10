-- Fix recursive/overly broad policy on admin_users and allow safe self-read for admin check

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop problematic ALL policy that referenced check_admin_access() on the same table (can cause recursion)
DROP POLICY IF EXISTS "Admin management of admin_users" ON public.admin_users;

-- Create a minimal, non-recursive SELECT policy so users can verify their admin status
CREATE POLICY "Users can read their own admin row"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);
