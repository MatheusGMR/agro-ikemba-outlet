import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Shield, AlertTriangle } from 'lucide-react';
import type { ProductDocument } from '@/types/inventory';

interface ProductDocumentsProps {
  documents: ProductDocument[];
  productName: string;
}

export function ProductDocuments({ documents, productName }: ProductDocumentsProps) {
  if (documents.length === 0) return null;

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'bula':
        return <FileText className="w-4 h-4" />;
      case 'fisqp':
        return <Shield className="w-4 h-4" />;
      case 'fds':
        return <FileText className="w-4 h-4" />;
      case 'ficha_emergencia':
        return <AlertTriangle className="w-4 h-4" />;
      case 'adapar':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'bula':
        return 'Bula';
      case 'fisqp':
        return 'FISQP';
      case 'fds':
        return 'FDS';
      case 'ficha_emergencia':
        return 'Ficha de Emergência';
      case 'adapar':
        return 'ADAPAR';
      default:
        return type.toUpperCase();
    }
  };

  const handleDocumentView = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentos Técnicos - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  {getDocumentIcon(doc.document_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{getDocumentLabel(doc.document_type)}</p>
                  <p className="text-xs text-muted-foreground">{doc.document_name}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDocumentView(doc.document_url, doc.document_name)}
                className="flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                Visualizar
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>📋 Importante:</strong> Todos os documentos técnicos estão disponíveis para consulta. 
            Sempre consulte a bula e FISQP antes do uso do produto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}