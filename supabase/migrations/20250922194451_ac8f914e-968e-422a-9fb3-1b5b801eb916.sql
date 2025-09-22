-- Update media-assets bucket to allow PDF files and increase size limit
UPDATE storage.buckets 
SET file_size_limit = 10485760, -- 10MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
WHERE id = 'media-assets';

-- Clean up and consolidate RLS policies for media-assets bucket
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Create comprehensive policies for media-assets bucket
CREATE POLICY "Public read access for media-assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-assets');

CREATE POLICY "Authenticated users can upload to media-assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'media-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own files in media-assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'media-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files in media-assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'media-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);