import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UploadResult {
  fileName: string;
  success: boolean;
  error?: string;
  path?: string;
}

export function ImageUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const handleUpload = async () => {
    setIsUploading(true);
    setResults([]);

    try {
      console.log('Starting image upload process...');
      
      const { data, error } = await supabase.functions.invoke('upload-product-images');
      
      if (error) {
        console.error('Error calling upload function:', error);
        toast.error(`Erro no upload: ${error.message}`);
        return;
      }

      console.log('Upload function response:', data);
      
      if (data?.success) {
        setResults(data.results || []);
        const successCount = data.results?.filter((r: UploadResult) => r.success).length || 0;
        const totalCount = data.results?.length || 0;
        
        toast.success(`Upload concluído: ${successCount}/${totalCount} imagens enviadas com sucesso!`);
      } else {
        toast.error(`Erro no upload: ${data?.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload de Imagens dos Produtos
        </CardTitle>
        <CardDescription>
          Faz upload das imagens dos produtos para o Supabase Storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fazendo upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload das Imagens
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Resultados do Upload:</h4>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">{result.fileName}</span>
                {result.error && (
                  <span className="text-xs">- {result.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}