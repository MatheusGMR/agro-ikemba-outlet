-- Fix Security Definer function and other security improvements

-- 1. Fix the is_admin function to be more secure by avoiding Security Definer where possible
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Create a more secure version that doesn't use Security Definer
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- 2. Update all policies to use the new function
DROP POLICY IF EXISTS "Secure admin access to users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Secure admin access to representatives" ON public.representatives;
DROP POLICY IF EXISTS "Secure admin access to rep_clients" ON public.rep_clients;
DROP POLICY IF EXISTS "Secure admin access to opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Secure admin access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Secure admin access to commissions" ON public.commissions;
DROP POLICY IF EXISTS "Secure admin access to sales_orders" ON public.sales_orders;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- Recreate policies with the new function
CREATE POLICY "Admin access to users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to representatives"
  ON public.representatives
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to rep_clients"
  ON public.rep_clients
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to opportunities"
  ON public.opportunities
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to proposals"
  ON public.proposals
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to commissions"
  ON public.commissions
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin access to sales_orders"
  ON public.sales_orders
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admin management of admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());