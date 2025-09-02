-- Add fields to proposals table for responsible person and public link
ALTER TABLE public.proposals 
ADD COLUMN responsible_name text,
ADD COLUMN responsible_cpf text,
ADD COLUMN responsible_position text,
ADD COLUMN responsible_email text,
ADD COLUMN responsible_phone text,
ADD COLUMN public_link text UNIQUE;

-- Create index for public_link for fast lookup
CREATE INDEX idx_proposals_public_link ON public.proposals(public_link) WHERE public_link IS NOT NULL;

-- Allow public access to proposals via public_link
CREATE POLICY "Public access to proposals via public link"
ON public.proposals
FOR SELECT
USING (public_link IS NOT NULL);

-- Allow public updates to proposals for approval process
CREATE POLICY "Public updates to proposals for approval"
ON public.proposals
FOR UPDATE
USING (public_link IS NOT NULL)
WITH CHECK (public_link IS NOT NULL);