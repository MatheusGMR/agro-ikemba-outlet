import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useRepresentative';
import { toast } from 'sonner';

interface MariaValentinaClientRegistrationProps {
  representativeId: string;
  onSuccess?: () => void;
}

export default function MariaValentinaClientRegistration({ 
  representativeId, 
  onSuccess 
}: MariaValentinaClientRegistrationProps) {
  const { mutate: createClient, isPending } = useCreateClient();

  const [formData, setFormData] = useState({
    // Dados Pessoais
    company_name: 'Maria Valentina dos Santos',
    cnpj_cpf: '123.456.789-00', // CPF a ser confirmado
    contact_name: 'Maria Valentina dos Santos',
    contact_function: 'Proprietária/Produtora Rural',
    email: 'maria.valentina@email.com', // Email a ser confirmado
    phone: '(18) 99999-9999', // Telefone a ser confirmado
    whatsapp: '(18) 99999-9999', // WhatsApp a ser confirmado

    // Endereço
    address: 'Fazenda Santa Maria',
    city: 'Itabera',
    state: 'SP',
    postal_code: '18740-000',

    // Propriedade Rural
    property_size: 800,
    property_type: 'Fazenda Única',
    main_crops: ['soja', 'milho'],
    secondary_crops: ['feijão'],
    ie_numbers: ['365.XXX.XXX.XXX'], // Inscrição Estadual a ser confirmada

    // CNAE
    cnae_codes: ['0111-2/01'], // Cultivo de soja

    // Informações Financeiras
    credit_limit: 40000.00,
    payment_terms: 'À vista ou parcelado conforme negociação',

    // Contador
    accountant_name: 'A definir',
    accountant_contact: '',

    // Observações
    partnership_details: 'Produtora independente',
    nirf: '', // NIRF a ser preenchido

    representative_id: representativeId
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createClient(formData, {
      onSuccess: () => {
        toast.success('Cliente Maria Valentina cadastrado com sucesso!');
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error) => {
        console.error('Erro ao cadastrar cliente:', error);
        toast.error('Erro ao cadastrar cliente. Tente novamente.');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Cliente - Maria Valentina dos Santos</CardTitle>
          <CardDescription>
            Dados extraídos dos documentos. Verifique e ajuste as informações conforme necessário.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nome/Razão Social</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj_cpf">CPF/CNPJ</Label>
                  <Input
                    id="cnpj_cpf"
                    value={formData.cnpj_cpf}
                    onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                    placeholder="Digite o CPF ou CNPJ correto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_name">Nome do Contato</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_function">Função do Contato</Label>
                  <Input
                    id="contact_function"
                    value={formData.contact_function}
                    onChange={(e) => handleInputChange('contact_function', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Confirme o email correto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Confirme o telefone correto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="Confirme o WhatsApp correto"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="postal_code">CEP</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Propriedade Rural */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Propriedade Rural</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_size">Tamanho da Propriedade (hectares)</Label>
                  <Input
                    id="property_size"
                    type="number"
                    value={formData.property_size}
                    onChange={(e) => handleInputChange('property_size', Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="property_type">Tipo de Propriedade</Label>
                  <Input
                    id="property_type"
                    value={formData.property_type}
                    onChange={(e) => handleInputChange('property_type', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="main_crops">Culturas Principais</Label>
                  <Input
                    id="main_crops"
                    value={formData.main_crops.join(', ')}
                    onChange={(e) => handleInputChange('main_crops', e.target.value.split(', '))}
                    placeholder="Ex: soja, milho"
                  />
                </div>
                
                <div>
                  <Label htmlFor="secondary_crops">Culturas Secundárias</Label>
                  <Input
                    id="secondary_crops"
                    value={formData.secondary_crops.join(', ')}
                    onChange={(e) => handleInputChange('secondary_crops', e.target.value.split(', '))}
                    placeholder="Ex: feijão"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ie_numbers">Inscrições Estaduais</Label>
                  <Input
                    id="ie_numbers"
                    value={formData.ie_numbers.join(', ')}
                    onChange={(e) => handleInputChange('ie_numbers', e.target.value.split(', '))}
                    placeholder="Digite as IEs corretas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nirf">NIRF</Label>
                  <Input
                    id="nirf"
                    value={formData.nirf}
                    onChange={(e) => handleInputChange('nirf', e.target.value)}
                    placeholder="Número do INCRA"
                  />
                </div>
              </div>
            </div>

            {/* Informações Financeiras */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Financeiras</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credit_limit">Limite de Crédito (R$)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => handleInputChange('credit_limit', Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment_terms">Condições de Pagamento</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contador</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountant_name">Nome do Contador</Label>
                  <Input
                    id="accountant_name"
                    value={formData.accountant_name}
                    onChange={(e) => handleInputChange('accountant_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountant_contact">Contato do Contador</Label>
                  <Input
                    id="accountant_contact"
                    value={formData.accountant_contact}
                    onChange={(e) => handleInputChange('accountant_contact', e.target.value)}
                    placeholder="Telefone ou email do contador"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observações</h3>
              
              <div>
                <Label htmlFor="partnership_details">Detalhes da Sociedade/Observações</Label>
                <Textarea
                  id="partnership_details"
                  value={formData.partnership_details}
                  onChange={(e) => handleInputChange('partnership_details', e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Informações adicionais sobre a cliente"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isPending}
                className="min-w-[200px]"
              >
                {isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}