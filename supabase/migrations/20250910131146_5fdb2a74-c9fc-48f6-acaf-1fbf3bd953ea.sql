-- Fix Security Definer function with proper dependency handling

-- 1. Drop the function with CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

-- 2. Create a more secure version that doesn't use Security Definer
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

-- 3. Recreate all necessary policies with the new function
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