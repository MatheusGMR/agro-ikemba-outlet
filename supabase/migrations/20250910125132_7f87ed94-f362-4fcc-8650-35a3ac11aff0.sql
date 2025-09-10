-- Phase 1: Critical Business Data Security Fixes for AgroIkemba

-- 1. Create admin role system with proper security
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$$;

-- 3. Fix users table RLS policies - remove overly permissive admin access
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user status" ON public.users;

-- Create secure admin policies for users table
CREATE POLICY "Secure admin access to users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow users to view their own profile data
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text IN (
    SELECT user_id::text FROM auth.users WHERE id = auth.uid()
  ) OR public.is_admin());

-- 4. Fix representatives table RLS policies
DROP POLICY IF EXISTS "Admins can manage representatives" ON public.representatives;

CREATE POLICY "Secure admin access to representatives"
  ON public.representatives
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Fix rep_clients table admin policy
DROP POLICY IF EXISTS "Admins can view all clients" ON public.rep_clients;

CREATE POLICY "Secure admin access to rep_clients"
  ON public.rep_clients
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Fix opportunities table admin policy  
DROP POLICY IF EXISTS "Admins can view all opportunities" ON public.opportunities;

CREATE POLICY "Secure admin access to opportunities"
  ON public.opportunities
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Fix proposals table admin policy
DROP POLICY IF EXISTS "Admins can view all proposals" ON public.proposals;

CREATE POLICY "Secure admin access to proposals" 
  ON public.proposals
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Fix commissions table admin policy
DROP POLICY IF EXISTS "Admins can manage all commissions" ON public.commissions;

CREATE POLICY "Secure admin access to commissions"
  ON public.commissions  
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. Fix sales_orders table admin policy
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.sales_orders;

CREATE POLICY "Secure admin access to sales_orders"
  ON public.sales_orders
  FOR ALL  
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. Create RLS policies for admin_users table
CREATE POLICY "Admins can manage admin users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. Create trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Insert initial admin user (will need to be updated with real admin email)
-- This is a placeholder - admin will need to create account through proper auth
INSERT INTO public.admin_users (email, role)
VALUES ('admin@agroikemba.com', 'admin')
ON CONFLICT (email) DO NOTHING;