import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useRepClients, useUpdateClient } from '@/hooks/useRepresentative';
import { RepClient } from '@/types/representative';
import { Sprout, Users, MapPin, FileText, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface RuralClientManagementPanelProps {
  representativeId: string;
}

export default function RuralClientManagementPanel({ representativeId }: RuralClientManagementPanelProps) {
  const { data: clients, isLoading } = useRepClients(representativeId);
  const updateClientMutation = useUpdateClient();
  const [selectedClient, setSelectedClient] = useState<RepClient | null>(null);
  const [ruralData, setRuralData] = useState<Partial<RepClient>>({});

  useEffect(() => {
    if (selectedClient) {
      setRuralData({
        property_size: selectedClient.property_size,
        property_type: selectedClient.property_type,
        main_crops: selectedClient.main_crops,
        secondary_crops: selectedClient.secondary_crops,
        ie_numbers: selectedClient.ie_numbers,
        cnae_codes: selectedClient.cnae_codes,
        partnership_details: selectedClient.partnership_details,
        accountant_name: selectedClient.accountant_name,
        accountant_contact: selectedClient.accountant_contact,
        nirf: selectedClient.nirf,
      });
    }
  }, [selectedClient]);

  const handleUpdateRuralData = async () => {
    if (!selectedClient) return;

    try {
      await updateClientMutation.mutateAsync({
        id: selectedClient.id,
        updates: ruralData,
      });
      toast.success('Dados rurais atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados rurais');
      console.error(error);
    }
  };

  const formatPropertySize = (size?: number) => {
    if (!size) return 'Não informado';
    return `${size.toLocaleString()} hectares`;
  };

  const formatCrops = (crops?: string[]) => {
    if (!crops || crops.length === 0) return 'Não informado';
    return crops.join(', ');
  };

  if (isLoading) {
    return <div className="p-4">Carregando clientes...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Sprout className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Gestão Rural de Clientes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes ({clients?.length || 0})
              </CardTitle>
              <CardDescription>
                Selecione um cliente para gerenciar dados rurais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {clients?.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                    selectedClient?.id === client.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="font-medium text-sm">{client.company_name}</div>
                  <div className="text-xs text-muted-foreground">{client.contact_name}</div>
                  <div className="text-xs text-muted-foreground">{client.city}/{client.state}</div>
                  {client.property_size && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {formatPropertySize(client.property_size)}
                    </Badge>
                  )}
                </div>
              ))}
              {(!clients || clients.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum cliente cadastrado
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Cliente */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedClient.company_name}
                </CardTitle>
                <CardDescription>
                  {selectedClient.contact_name} - {selectedClient.city}/{selectedClient.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rural" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rural">Dados Rurais</TabsTrigger>
                    <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rural" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="property_size">Tamanho da Propriedade (hectares)</Label>
                        <Input
                          id="property_size"
                          type="number"
                          value={ruralData.property_size || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            property_size: e.target.value ? Number(e.target.value) : undefined
                          })}
                          placeholder="Ex: 1200"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="property_type">Tipo de Propriedade</Label>
                        <Input
                          id="property_type"
                          value={ruralData.property_type || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            property_type: e.target.value
                          })}
                          placeholder="Ex: Fazenda, Sítio, Condomínio"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="main_crops">Culturas Principais</Label>
                        <Input
                          id="main_crops"
                          value={ruralData.main_crops?.join(', ') || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            main_crops: e.target.value ? e.target.value.split(',').map(c => c.trim()) : []
                          })}
                          placeholder="Ex: soja, milho"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary_crops">Culturas Secundárias</Label>
                        <Input
                          id="secondary_crops"
                          value={ruralData.secondary_crops?.join(', ') || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            secondary_crops: e.target.value ? e.target.value.split(',').map(c => c.trim()) : []
                          })}
                          placeholder="Ex: trigo, feijão"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ie_numbers">Inscrições Estaduais</Label>
                      <Input
                        id="ie_numbers"
                        value={ruralData.ie_numbers?.join(', ') || ''}
                        onChange={(e) => setRuralData({
                          ...ruralData,
                          ie_numbers: e.target.value ? e.target.value.split(',').map(ie => ie.trim()) : []
                        })}
                        placeholder="Ex: 365.036.944.111, 365.048.250.113"
                      />
                    </div>

                    <div>
                      <Label htmlFor="partnership_details">Detalhes de Parcerias</Label>
                      <Textarea
                        id="partnership_details"
                        value={ruralData.partnership_details || ''}
                        onChange={(e) => setRuralData({
                          ...ruralData,
                          partnership_details: e.target.value
                        })}
                        placeholder="Informações sobre sociedades, parcerias, etc."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountant_name">Nome do Contador</Label>
                        <Input
                          id="accountant_name"
                          value={ruralData.accountant_name || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            accountant_name: e.target.value
                          })}
                          placeholder="Nome completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="accountant_contact">Contato do Contador</Label>
                        <Input
                          id="accountant_contact"
                          value={ruralData.accountant_contact || ''}
                          onChange={(e) => setRuralData({
                            ...ruralData,
                            accountant_contact: e.target.value
                          })}
                          placeholder="Email ou telefone"
                        />
                      </div>
                    </div>

                    <Separator />
                    
                    <Button 
                      onClick={handleUpdateRuralData}
                      disabled={updateClientMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateClientMutation.isPending ? 'Salvando...' : 'Salvar Dados Rurais'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Razão Social:</span>
                        <span>{selectedClient.company_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">CNPJ:</span>
                        <span>{selectedClient.cnpj_cpf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Contato:</span>
                        <span>{selectedClient.contact_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Telefone:</span>
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Localização:</span>
                        <span>{selectedClient.city}/{selectedClient.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Limite de Crédito:</span>
                        <span>R$ {selectedClient.credit_limit?.toLocaleString()}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Gestão de documentos em desenvolvimento</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um Cliente</h3>
                  <p className="text-muted-foreground">
                    Escolha um cliente da lista ao lado para gerenciar seus dados rurais
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}