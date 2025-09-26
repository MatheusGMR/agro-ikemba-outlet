import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useRepresentative';
import { useToast } from '@/hooks/use-toast';

interface IaroClientRegistrationProps {
  representativeId: string;
  onSuccess?: () => void;
}

export default function IaroClientRegistration({ 
  representativeId, 
  onSuccess 
}: IaroClientRegistrationProps) {
  const createClientMutation = useCreateClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados pré-preenchidos extraídos dos documentos
  const [formData, setFormData] = useState({
    // Dados Pessoais
    company_name: 'IARO MARQUES DIB',
    cnpj_cpf: '934.049.219-68',
    contact_name: 'Iaro Marques Dib',
    contact_function: 'Proprietário Rural',
    email: '',
    phone: '(15) 99704-0018',
    whatsapp: '(15) 99704-0018',
    
    // Endereço
    address: 'Rua Vicente Machado, 577, Centro',
    city: 'Itararé',
    state: 'SP',
    postal_code: '18460-000',
    
    // Propriedade Rural
    property_size: 29, // hectares próprios
    property_type: 'Fazenda de Soja',
    main_crops: ['Soja'],
    secondary_crops: ['Milho'],
    ie_numbers: ['2187', '2371', '2814', '3531', '1411', '51208'], // Matrículas dos CCIRs
    cnae_codes: ['0111-3/01'], // Cultivo de cereais
    
    // Informações Financeiras
    credit_limit: 480000, // Baseado na renda declarada
    payment_terms: '30/60/90 dias',
    
    // Contador
    accountant_name: '',
    accountant_contact: '',
    
    // Outros campos
    nirf: '',
    partnership_details: 'Contrato de arrendamento com Carolline (46,66 alqueires) - Vencimento: 31/05/2027. Cônjuge: Meire Paniz Dib.',
    representative_id: representativeId
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createClientMutation.mutateAsync({
        ...formData,
        representative_id: representativeId
      });
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "Iaro Marques Dib foi adicionado à sua carteira de clientes.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Cadastro do Cliente - Iaro Marques Dib
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Dados extraídos dos documentos oficiais. Revise as informações antes de confirmar o cadastro.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
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
                <Label htmlFor="cnpj_cpf">CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                  required
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
                <Label htmlFor="contact_function">Função</Label>
                <Input
                  id="contact_function"
                  value={formData.contact_function}
                  onChange={(e) => handleInputChange('contact_function', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="iaro@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
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
                <Label htmlFor="property_size">Área Própria (hectares)</Label>
                <Input
                  id="property_size"
                  type="number"
                  value={formData.property_size}
                  onChange={(e) => handleInputChange('property_size', Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  + 46,66 alqueires arrendados (Contrato até 31/05/2027)
                </p>
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
                />
              </div>
              <div>
                <Label htmlFor="secondary_crops">Culturas Secundárias</Label>
                <Input
                  id="secondary_crops"
                  value={formData.secondary_crops.join(', ')}
                  onChange={(e) => handleInputChange('secondary_crops', e.target.value.split(', '))}
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
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Baseado na renda declarada de R$ 480.000,00
                </p>
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
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Observações</h3>
            <div>
              <Label htmlFor="partnership_details">Detalhes dos Contratos e Parcerias</Label>
              <Textarea
                id="partnership_details"
                value={formData.partnership_details}
                onChange={(e) => handleInputChange('partnership_details', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}