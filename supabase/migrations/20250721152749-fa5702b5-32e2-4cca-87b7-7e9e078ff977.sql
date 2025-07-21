
-- Create a public storage bucket for media assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', true);

-- Create policy to allow public read access to media assets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media-assets');

-- Create policy to allow authenticated users to upload media assets (for admin purposes)
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media-assets' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update media assets
CREATE POLICY "Authenticated users can update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media-assets' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete media assets
CREATE POLICY "Authenticated users can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media-assets' AND auth.role() = 'authenticated');
