import { useMissingProductImages } from '@/hooks/useProductImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

/**
 * Development component to diagnose missing product images
 * Only renders in development environment
 * Shows which image files are missing from Supabase Storage
 */
export function ProductImageDiagnostic() {
  const { data: diagnosis, isLoading, error } = useMissingProductImages();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="m-4 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Package className="h-5 w-5" />
            Diagnóstico de Imagens (Carregando...)
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="m-4 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Erro ao diagnosticar imagens: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!diagnosis) return null;

  return (
    <Card className="m-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Package className="h-5 w-5" />
          Diagnóstico de Imagens do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{diagnosis.total}</div>
            <div className="text-sm text-blue-600">Total de registros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{diagnosis.existing.length}</div>
            <div className="text-sm text-green-600">Arquivos existentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{diagnosis.missing.length}</div>
            <div className="text-sm text-red-600">Arquivos faltantes</div>
          </div>
        </div>

        {diagnosis.missing.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Arquivos faltantes no Supabase Storage:</strong>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {diagnosis.missingFiles.map((file, index) => (
                  <div key={index} className="font-mono text-xs bg-red-100 p-1 rounded">
                    {file}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {diagnosis.existing.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Arquivos encontrados:</strong>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {diagnosis.existing.map((img, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {img.product_sku}
                    </Badge>
                    <span className="font-mono text-xs">{img.image_url}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-700">
            <strong>Para corrigir:</strong> Faça upload dos arquivos faltantes para o bucket 
            <code className="bg-blue-100 px-1 rounded">product-images</code> no Supabase Storage.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}