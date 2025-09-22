-- Verificar políticas atuais do bucket media-assets
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';