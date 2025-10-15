import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { validateCNPJ, validatePhone, formatCNPJ, formatPhone } from '@/utils/validators';
import type { RepClient } from '@/types/representative';
import { useBulkCreateClients } from '@/hooks/useRepresentative';
import { Badge } from '@/components/ui/badge';

interface BulkClientImportProps {
  representativeId: string;
  onClose: () => void;
}

interface ParsedClient {
  company_name: string;
  contact_name: string;
  contact_function: string;
  cnpj_cpf: string;
  phone: string;
  email?: string;
}

interface ValidationResult {
  row: number;
  data: ParsedClient;
  isValid: boolean;
  errors: string[];
}

export default function BulkClientImport({ representativeId, onClose }: BulkClientImportProps) {
  const [parsedData, setParsedData] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreateMutation = useBulkCreateClients();

  const downloadTemplate = () => {
    const template = `company_name,contact_name,contact_function,cnpj_cpf,phone,email
Fazenda ABC Ltda,João Silva,Diretor,12.345.678/0001-90,(43) 99999-9999,joao@fazendaabc.com
Agro XYZ S.A.,Maria Santos,Gerente,98.765.432/0001-10,(44) 98888-8888,maria@agroxyz.com
Rural 123,Pedro Costa,Comprador,11.222.333/0001-44,(45) 97777-7777,pedro@rural123.com`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_clientes.csv';
    link.click();
    toast.success('Modelo baixado com sucesso!');
  };

  const validateClient = (client: ParsedClient, row: number): ValidationResult => {
    const errors: string[] = [];

    if (!client.company_name || client.company_name.trim().length < 2) {
      errors.push('Nome da empresa inválido');
    }
    if (!client.contact_name || client.contact_name.trim().length < 2) {
      errors.push('Nome do contato inválido');
    }
    if (!client.contact_function || client.contact_function.trim().length < 2) {
      errors.push('Função do contato inválida');
    }
    if (!client.cnpj_cpf || !validateCNPJ(client.cnpj_cpf)) {
      errors.push('CNPJ inválido');
    }
    if (!client.phone || !validatePhone(client.phone)) {
      errors.push('Telefone inválido');
    }
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      errors.push('Email inválido');
    }

    return {
      row,
      data: client,
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validations: ValidationResult[] = results.data.map((row: any, index: number) => {
          const client: ParsedClient = {
            company_name: row.company_name?.trim() || '',
            contact_name: row.contact_name?.trim() || '',
            contact_function: row.contact_function?.trim() || '',
            cnpj_cpf: formatCNPJ(row.cnpj_cpf || ''),
            phone: formatPhone(row.phone || ''),
            email: row.email?.trim() || undefined
          };
          return validateClient(client, index + 2); // +2 porque linha 1 é header
        });

        setParsedData(validations);
        setIsProcessing(false);
        
        const validCount = validations.filter(v => v.isValid).length;
        const invalidCount = validations.filter(v => !v.isValid).length;
        
        toast.info(`${validCount} clientes válidos, ${invalidCount} inválidos`);
      },
      error: (error) => {
        console.error('Erro ao fazer parse do CSV:', error);
        toast.error('Erro ao processar arquivo CSV');
        setIsProcessing(false);
      }
    });
  };

  const handleImport = async () => {
    const validClients = parsedData.filter(v => v.isValid);
    
    if (validClients.length === 0) {
      toast.error('Nenhum cliente válido para importar');
      return;
    }

    setIsProcessing(true);

    try {
      const clientsToCreate = validClients.map(v => ({
        representative_id: representativeId,
        company_name: v.data.company_name,
        contact_name: v.data.contact_name,
        contact_function: v.data.contact_function,
        cnpj_cpf: v.data.cnpj_cpf,
        phone: v.data.phone,
        email: v.data.email || undefined,
        credit_limit: 0
      }));

      const results = await bulkCreateMutation.mutateAsync({
        representativeId,
        clients: clientsToCreate
      });

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      if (failureCount > 0) {
        toast.warning(`${successCount} clientes cadastrados, ${failureCount} falharam`);
      } else {
        toast.success(`${successCount} clientes cadastrados com sucesso!`);
        onClose();
      }
    } catch (error) {
      console.error('Erro na importação em massa:', error);
      toast.error('Erro ao importar clientes');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadErrors = () => {
    const invalidClients = parsedData.filter(v => !v.isValid);
    const csvContent = 'row,company_name,errors\n' + 
      invalidClients.map(v => 
        `${v.row},"${v.data.company_name}","${v.errors.join('; ')}"`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'erros_importacao.csv';
    link.click();
  };

  const validCount = parsedData.filter(v => v.isValid).length;
  const invalidCount = parsedData.filter(v => !v.isValid).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importação em Massa de Clientes</CardTitle>
          <CardDescription>
            Faça upload de um arquivo CSV com os dados dos clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Upload CSV'}
            </Button>
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  {validCount} válidos
                </Badge>
                <Badge variant="destructive" className="text-lg py-2 px-4">
                  <XCircle className="h-4 w-4 mr-2" />
                  {invalidCount} inválidos
                </Badge>
              </div>

              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((validation) => (
                      <TableRow key={validation.row} className={!validation.isValid ? 'bg-destructive/10' : ''}>
                        <TableCell>{validation.row}</TableCell>
                        <TableCell>{validation.data.company_name}</TableCell>
                        <TableCell>{validation.data.contact_name}</TableCell>
                        <TableCell>{validation.data.cnpj_cpf}</TableCell>
                        <TableCell>{validation.data.phone}</TableCell>
                        <TableCell>
                          {validation.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive">
                                {validation.errors[0]}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || isProcessing}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Importando...' : `Importar ${validCount} Clientes`}
                </Button>
                
                {invalidCount > 0 && (
                  <Button variant="outline" onClick={downloadErrors}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório de Erros
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
