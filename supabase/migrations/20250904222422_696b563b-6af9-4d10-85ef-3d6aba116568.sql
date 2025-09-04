-- Atualizar nome do produto na tabela inventory (3 registros com diferentes price_tier)
UPDATE inventory 
SET product_name = 'Ciprian' 
WHERE product_sku = '11501' AND product_name = 'MAXAPAC 250 EC';

-- Atualizar nome dos documentos relacionados
UPDATE product_documents 
SET document_name = 'Bula Ciprian' 
WHERE product_sku = '11501' AND document_name = 'Bula Maxapac 250 EC';

UPDATE product_documents 
SET document_name = 'ADAPAR Ciprian' 
WHERE product_sku = '11501' AND document_name = 'ADAPAR Maxapac 250 EC';