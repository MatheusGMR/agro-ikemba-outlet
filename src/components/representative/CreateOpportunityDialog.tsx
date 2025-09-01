import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRepClients, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { useState } from 'react';
import { RepClient } from '@/types/representative';

interface CreateOpportunityDialogProps {
  onClose: () => void;
}

export default function CreateOpportunityDialog({ onClose }: CreateOpportunityDialogProps) {
  const { data: representative } = useCurrentRepresentative();
  const { data: clients = [] } = useRepClients(representative?.id || '');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    estimated_value: '',
    probability: '50'
  });

  const [selectedClient, setSelectedClient] = useState<RepClient | null>(null);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, client_id: clientId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating opportunity:', formData);
    // TODO: Implementar criação de oportunidade
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título da Oportunidade</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Venda de herbicidas para safra 2025"
          required
        />
      </div>

      <div>
        <Label htmlFor="client">Cliente</Label>
        <Select value={formData.client_id} onValueChange={handleClientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Dados do Cliente</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Empresa:</span>
              <p className="font-medium">{selectedClient.company_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contato:</span>
              <p className="font-medium">{selectedClient.contact_name || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">CNPJ:</span>
              <p className="font-medium">{selectedClient.cnpj_cpf || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Telefone:</span>
              <p className="font-medium">{selectedClient.phone || 'Não informado'}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="estimated_value">Valor Estimado (R$)</Label>
        <Input
          id="estimated_value"
          type="number"
          step="0.01"
          value={formData.estimated_value}
          onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value }))}
          placeholder="0,00"
          required
        />
      </div>

      <div>
        <Label htmlFor="probability">Probabilidade (%)</Label>
        <Input
          id="probability"
          type="number"
          min="0"
          max="100"
          value={formData.probability}
          onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva os detalhes da oportunidade..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Criar Oportunidade
        </Button>
      </div>
    </form>
  );
}