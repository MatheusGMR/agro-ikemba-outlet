import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useRepresentative';
import { toast } from 'sonner';

interface QuickClientRegistrationProps {
  representativeId: string;
  onSuccess?: () => void;
}

export default function QuickClientRegistration({ representativeId, onSuccess }: QuickClientRegistrationProps) {
  const createClientMutation = useCreateClient();
  
  const [formData, setFormData] = useState({
    company_name: 'Maria Valentina Kobil Marques Dib',
    cnpj_cpf: '32.099.817/0005-89',
    contact_name: 'Maria Valentina Kobil Marques Dib',
    email: '',
    phone: '',
    whatsapp: '',
    address: 'R São Pedro, 923 - Centro',
    city: 'Itararé',
    state: 'SP',
    postal_code: '18464-000',
    state_registration: '365.051.980.118',
    credit_limit: 0,
    payment_terms: '30 dias',
    // Campos rurais
    property_size: 833.08,
    property_type: 'Fazenda',
    main_crops: ['Soja', 'Milho', 'Trigo', 'Feijão'],
    secondary_crops: ['Bovinos'],
    ie_numbers: ['365.051.980.118'],
    cnae_codes: ['01.15-6/00', '01.11-3/02', '01.11-3/03'],
    accountant_name: 'Marcio Neilor Silva',
    accountant_contact: 'CRC 1SP323518/O-5',
    nirf: 'SP-3521705-4BF2CDC3E6834CF9AB10D3ACA4D36AA8'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createClientMutation.mutateAsync({
        representative_id: representativeId,
        ...formData
      });
      
      toast.success('Cliente cadastrado com sucesso!');
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao cadastrar cliente');
      console.error('Erro:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cadastro Rápido - Cliente Maria Valentina</CardTitle>
        <p className="text-sm text-muted-foreground">
          Dados extraídos dos documentos fornecidos
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome/Razão Social</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj_cpf}
                onChange={(e) => handleChange('cnpj_cpf', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Digite o email do cliente"
              />
            </div>
            
            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Digite o telefone"
              />
            </div>
            
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="Digite o WhatsApp"
              />
            </div>
            
            <div>
              <Label>Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Tamanho da Propriedade (ha)</Label>
              <Input
                type="number"
                value={formData.property_size}
                onChange={(e) => handleChange('property_size', parseFloat(e.target.value))}
              />
            </div>
            
            <div>
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.state_registration}
                onChange={(e) => handleChange('state_registration', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label>Culturas Principais</Label>
            <Input
              value={formData.main_crops.join(', ')}
              onChange={(e) => handleChange('main_crops', e.target.value.split(', '))}
              placeholder="Ex: Soja, Milho, Trigo"
            />
          </div>
          
          <div>
            <Label>Endereço Completo</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createClientMutation.isPending}
              className="flex-1"
            >
              {createClientMutation.isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}