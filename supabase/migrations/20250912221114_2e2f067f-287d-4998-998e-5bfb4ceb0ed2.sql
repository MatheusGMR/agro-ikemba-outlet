-- Create policy to allow users to read their own data from users table
CREATE POLICY "Users can read their own data"
ON public.users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));