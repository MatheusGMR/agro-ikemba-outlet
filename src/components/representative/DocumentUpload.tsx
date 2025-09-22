import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUploadProps {
  documentUrls: Record<string, string>;
  onDocumentsChange: (docs: Record<string, string>) => void;
}

interface UploadingDocument {
  name: string;
  progress: number;
  type: string;
}

const REQUIRED_DOCUMENTS = [
  {
    id: 'id_document',
    name: 'Documento oficial com foto (RG/CNH)',
    description: 'Documento de identidade válido com foto'
  },
  {
    id: 'cnpj_card',
    name: 'Cartão CNPJ',
    description: 'Cartão CNPJ emitido pela Receita Federal'
  },
  {
    id: 'social_contract',
    name: 'Contrato Social / Requerimento MEI',
    description: 'Documento de constituição da empresa'
  }
];

export function DocumentUpload({ documentUrls, onDocumentsChange }: DocumentUploadProps) {
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, UploadingDocument>>({});

  const handleFileUpload = async (file: File, documentType: string) => {
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, JPG e PNG são permitidos');
        return;
      }

      // Validar tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo deve ter no máximo 5MB');
        return;
      }

      // Iniciar upload
      const uploadId = `${documentType}_${Date.now()}`;
      setUploadingDocs(prev => ({
        ...prev,
        [uploadId]: {
          name: file.name,
          progress: 0,
          type: documentType
        }
      }));

      // Nome único para o arquivo
      const fileName = `representative-docs/${Date.now()}_${file.name}`;
      
      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setUploadingDocs(prev => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            progress: Math.min(prev[uploadId]?.progress + 10, 90)
          }
        }));
      }, 200);

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('media-assets')
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media-assets')
        .getPublicUrl(fileName);

      // Finalizar upload
      setUploadingDocs(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          progress: 100
        }
      }));

      // Adicionar URL ao documento específico
      const newDocs = {
        ...documentUrls,
        [documentType]: publicUrl
      };
      onDocumentsChange(newDocs);

      // Remover da lista de upload após 2 segundos
      setTimeout(() => {
        setUploadingDocs(prev => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }, 2000);

      toast.success('Documento enviado com sucesso!');

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar documento. Tente novamente.');
      
      setUploadingDocs(prev => {
        const newState = { ...prev };
        delete newState[Object.keys(prev).find(key => prev[key].type === documentType) || ''];
        return newState;
      });
    }
  };

  const removeDocument = (documentType: string) => {
    const newDocs = { ...documentUrls };
    delete newDocs[documentType];
    onDocumentsChange(newDocs);
    toast.success('Documento removido');
  };

  const getDocumentName = (url: string) => {
    const fileName = url.split('/').pop();
    return fileName ? decodeURIComponent(fileName.split('_').slice(1).join('_')) : 'Documento';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Faça upload dos 3 documentos obrigatórios. Formatos aceitos: PDF, JPG, PNG (máximo 5MB cada)
        </p>
      </div>

      {REQUIRED_DOCUMENTS.map((docType, index) => (
        <Card key={docType.id} className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">{docType.name}</Label>
              <p className="text-sm text-muted-foreground">{docType.description}</p>
            </div>

            {/* Área de Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, docType.id);
                  }
                }}
                className="hidden"
                id={`upload-${docType.id}`}
              />
              
              <label
                htmlFor={`upload-${docType.id}`}
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para enviar ou arraste o arquivo aqui
                </span>
                <Button variant="outline" size="sm" type="button">
                  Selecionar Arquivo
                </Button>
              </label>
            </div>

            {/* Documento Enviado para este tipo */}
            {documentUrls[docType.id] && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {getDocumentName(documentUrls[docType.id])}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(docType.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Documentos sendo enviados */}
            {Object.values(uploadingDocs)
              .filter(doc => doc.type === docType.id)
              .map((doc, docIndex) => (
                <div key={docIndex} className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.progress}%
                    </span>
                  </div>
                  <Progress value={doc.progress} className="h-2" />
                </div>
              ))}
          </div>
        </Card>
      ))}

      {/* Status dos documentos */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status dos documentos:</span>
          <span className={`text-sm ${Object.keys(documentUrls).length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
            {Object.keys(documentUrls).length}/3 enviados
          </span>
        </div>
        
        {/* Lista de documentos por tipo */}
        <div className="mt-3 space-y-2">
          {REQUIRED_DOCUMENTS.map((docType) => (
            <div key={docType.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{docType.name}:</span>
              <span className={documentUrls[docType.id] ? 'text-green-600' : 'text-amber-600'}>
                {documentUrls[docType.id] ? '✓ Enviado' : '⏳ Pendente'}
              </span>
            </div>
          ))}
        </div>
        
        {Object.keys(documentUrls).length >= 3 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Todos os documentos foram enviados!</span>
          </div>
        )}
      </div>
    </div>
  );
}