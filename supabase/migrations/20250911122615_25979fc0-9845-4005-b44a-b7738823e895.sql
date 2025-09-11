-- Create media-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-assets',
  'media-assets', 
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY IF NOT EXISTS "Public read access for media assets" ON storage.objects
FOR SELECT USING (bucket_id = 'media-assets');

-- Create policy for authenticated uploads
CREATE POLICY IF NOT EXISTS "Authenticated upload for media assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media-assets' AND auth.role() = 'authenticated');