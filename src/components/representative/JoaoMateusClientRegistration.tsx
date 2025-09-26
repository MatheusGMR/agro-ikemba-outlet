import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useRepresentative';
import { toast } from 'sonner';
import { User, MapPin, Phone, Mail, FileText, Tractor, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface JoaoMateusClientRegistrationProps {
  representativeId: string;
  onSuccess?: () => void;
}

export default function JoaoMateusClientRegistration({ 
  representativeId, 
  onSuccess 
}: JoaoMateusClientRegistrationProps) {
  const createClientMutation = useCreateClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-filled data extracted from João Mateus documents
  const [formData, setFormData] = useState({
    // Dados pessoais básicos
    company_name: 'João Mateus de Oliveira Macedo',
    contact_name: 'João Mateus de Oliveira Macedo',
    contact_function: 'Proprietário Rural',
    cnpj_cpf: '033.564.401-04',
    email: 'joaomateus@email.com', // Placeholder - não estava nos documentos
    phone: '(43) 99999-9999', // Placeholder - não estava nos documentos
    whatsapp: '(43) 99999-9999', // Placeholder
    
    // Endereço completo
    address: 'Estrada Vicinal Joaquim Macedo, Sítio São João',
    city: 'Cambará',
    state: 'PR',
    postal_code: '86390-000',
    
    // Dados rurais específicos
    property_size: 12.10,
    property_type: 'Sítio',
    main_crops: ['soja', 'milho', 'feijão', 'trigo'],
    secondary_crops: ['pastagem'],
    nirf: '2.043.206.215.049-8',
    
    // Informações conjugais
    spouse_name: 'Jéssica Oliveira de Macedo',
    spouse_cpf: '084.169.959-73',
    
    // Dados financeiros baseados no IRPF
    credit_limit: 50000, // Baseado na renda declarada
    annual_income: 42000, // Conforme IRPF 2024
    
    // Informações de negócio
    years_farming: 10,
    accountant_name: 'Contador parceiro',
    accountant_contact: '(43) 3333-3333',
    
    // Fornecedores atuais
    current_suppliers: 'Fornecedores locais de sementes e defensivos',
    
    // Observações gerais
    observations: `
Cliente rural com 10 anos de experiência em agricultura. 
Propriedade: Sítio São João com 12,10 hectares.
Culturas principais: soja, milho, feijão e trigo.
Declaração de IRPF 2024 com renda anual de R$ 42.000.
Casado com Jéssica Oliveira de Macedo.
NIRF: 2.043.206.215.049-8.
Documentos analisados: IRPF, RG, Contrato de Comodato Rural, Ficha de Cadastro.
    `.trim()
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createClientMutation.mutateAsync({
        representative_id: representativeId,
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        contact_function: formData.contact_function,
        cnpj_cpf: formData.cnpj_cpf,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        credit_limit: formData.credit_limit,
        
        // Dados rurais
        property_size: formData.property_size,
        property_type: formData.property_type,
        main_crops: formData.main_crops,
        secondary_crops: formData.secondary_crops,
        nirf: formData.nirf,
        
        // Contador
        accountant_name: formData.accountant_name,
        accountant_contact: formData.accountant_contact,
        
        // Observações
        partnership_details: formData.observations
      });

      toast.success('Cliente João Mateus cadastrado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Cadastro do Cliente: João Mateus de Oliveira Macedo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dados extraídos dos documentos oficiais (IRPF, RG, Contrato de Comodato Rural)
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Nome/Razão Social *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cnpj_cpf">CPF *</Label>
                <Input
                  id="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
            </div>
          </div>

          <Separator />

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Endereço</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço Completo</Label>
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
            </div>
          </div>

          <Separator />

          {/* Informações Rurais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Tractor className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Propriedade Rural</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_size">Área (hectares)</Label>
                <Input
                  id="property_size"
                  type="number"
                  step="0.01"
                  value={formData.property_size}
                  onChange={(e) => handleInputChange('property_size', parseFloat(e.target.value) || 0)}
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
                <Label htmlFor="nirf">NIRF</Label>
                <Input
                  id="nirf"
                  value={formData.nirf}
                  onChange={(e) => handleInputChange('nirf', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="years_farming">Anos de Experiência</Label>
                <Input
                  id="years_farming"
                  type="number"
                  value={formData.years_farming}
                  onChange={(e) => handleInputChange('years_farming', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="main_crops">Culturas Principais</Label>
              <Input
                id="main_crops"
                value={formData.main_crops.join(', ')}
                onChange={(e) => handleInputChange('main_crops', e.target.value.split(', '))}
                placeholder="soja, milho, feijão, trigo"
              />
            </div>
          </div>

          <Separator />

          {/* Informações Financeiras */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Informações Financeiras</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credit_limit">Limite de Crédito Sugerido (R$)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="annual_income">Renda Anual Declarada (R$)</Label>
                <Input
                  id="annual_income"
                  type="number"
                  value={formData.annual_income}
                  onChange={(e) => handleInputChange('annual_income', parseFloat(e.target.value) || 0)}
                  disabled
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contador */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Contador</h3>
            </div>
            
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

          <Separator />

          {/* Observações */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="observations">Observações e Histórico</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}