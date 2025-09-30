import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import { ProgressiveInput } from '@/components/ui/progressive-input';
import { ButtonGrid } from '@/components/ui/button-grid';
import { Building, User, Users, Phone, Mail } from 'lucide-react';
import { useCreateClient } from '@/hooks/useRepresentative';
import { toast } from 'sonner';
import { useBotProtection } from '@/hooks/useBotProtection';
import { HoneypotFields } from '@/components/auth/HoneypotFields';

interface ProgressiveClientRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  representativeId: string;
}

interface ClientFormData {
  company_name: string;
  contact_name: string;
  contact_function: string;
  cnpj_cpf: string;
  phone: string;
  email: string;
}

const contactFunctionOptions = [
  { value: 'Diretor', label: 'Diretor', icon: User, description: 'Direção executiva' },
  { value: 'Gerente', label: 'Gerente', icon: Users, description: 'Gerência operacional' },
  { value: 'Comprador', label: 'Comprador', icon: Building, description: 'Responsável por compras' },
  { value: 'Técnico', label: 'Técnico', icon: User, description: 'Área técnica' },
  { value: 'Outro', label: 'Outro', icon: User, description: 'Outras funções' },
];

const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export default function ProgressiveClientRegistrationDialog({
  open,
  onOpenChange,
  representativeId
}: ProgressiveClientRegistrationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    company_name: '',
    contact_name: '',
    contact_function: '',
    cnpj_cpf: '',
    phone: '',
    email: '',
  });

  const createClientMutation = useCreateClient();
  
  // Bot protection
  const {
    honeypotData,
    updateHoneypot,
    validateBotProtection,
    isReCaptchaReady,
    recaptchaError
  } = useBotProtection();

  const updateFormData = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean | string => {
    switch (step) {
      case 1: // Company
        return formData.company_name.length >= 2 || "Nome da empresa deve ter pelo menos 2 caracteres";
      case 2: // Contact Name
        return formData.contact_name.length >= 2 || "Nome do contato deve ter pelo menos 2 caracteres";
      case 3: // Contact Function
        return !!formData.contact_function || "Selecione a função do contato";
      case 4: // CNPJ (optional)
        return true;
      case 5: // Phone and Email
        const phoneValid = !formData.phone || formData.phone.length >= 11;
        const emailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (!phoneValid) return "Telefone deve ter pelo menos 11 dígitos";
        if (!emailValid) return "Email inválido";
        if (!formData.phone && !formData.email) return "Informe pelo menos telefone ou email";
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate bot protection
      const botValidation = await validateBotProtection();
      
      if (botValidation.isBot) {
        toast.error(botValidation.reason || 'Falha na verificação de segurança. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      await createClientMutation.mutateAsync({
        representative_id: representativeId,
        company_name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim(),
        contact_function: formData.contact_function,
        cnpj_cpf: formData.cnpj_cpf || undefined,
        phone: formData.phone || undefined,
        email: formData.email.trim() || undefined,
        credit_limit: 0
      });

      toast.success('Cliente cadastrado com sucesso!');
      
      // Reset form and close dialog
      setFormData({
        company_name: '',
        contact_name: '',
        contact_function: '',
        cnpj_cpf: '',
        phone: '',
        email: '',
      });
      setCurrentStep(1);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: ProgressiveFormStep[] = [
    {
      id: 'company',
      title: 'Nome da empresa',
      description: 'Qual é o nome da empresa do cliente?',
      component: (
        <div className="space-y-4">
          {/* Honeypot fields for bot protection */}
          <HoneypotFields data={honeypotData} onChange={updateHoneypot} />
          
          <ProgressiveInput
            label="Nome da Empresa"
            placeholder="Digite o nome da empresa"
            value={formData.company_name}
            onChange={(value) => updateFormData('company_name', value)}
            onEnter={() => setCurrentStep(2)}
            icon={Building}
            required
            autoFocus
            error={validateStep(1) !== true ? String(validateStep(1)) : undefined}
          />
        </div>
      ),
      validate: () => validateStep(1),
    },
    {
      id: 'contact-name',
      title: 'Nome do contato',
      description: 'Quem é a pessoa de contato nesta empresa?',
      component: (
        <ProgressiveInput
          label="Nome do Contato"
          placeholder="Digite o nome da pessoa de contato"
          value={formData.contact_name}
          onChange={(value) => updateFormData('contact_name', value)}
          onEnter={() => setCurrentStep(3)}
          icon={User}
          required
          autoFocus
          error={validateStep(2) !== true ? String(validateStep(2)) : undefined}
        />
      ),
      validate: () => validateStep(2),
    },
    {
      id: 'contact-function',
      title: 'Função do contato',
      description: 'Qual é a função desta pessoa na empresa?',
      component: (
        <ButtonGrid
          options={contactFunctionOptions}
          value={formData.contact_function}
          onSelect={(value) => updateFormData('contact_function', value)}
          columns={2}
        />
      ),
      validate: () => validateStep(3),
    },
    {
      id: 'cnpj',
      title: 'CNPJ da empresa',
      description: 'Se souber o CNPJ, isso ajuda na identificação',
      component: (
        <div className="space-y-4">
          <ProgressiveInput
            label="CNPJ"
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={formData.cnpj_cpf}
            onChange={(value) => updateFormData('cnpj_cpf', value)}
            onEnter={() => setCurrentStep(5)}
            icon={Building}
            formatter={formatCNPJ}
            autoFocus
          />
          <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md text-center">
            <p>💡 O CNPJ é opcional, mas facilita a identificação da empresa</p>
          </div>
        </div>
      ),
      optional: true,
      validate: () => validateStep(4),
    },
    {
      id: 'contact-info',
      title: 'Informações de contato',
      description: 'Como podemos entrar em contato? (pelo menos um campo)',
      component: (
        <div className="space-y-6">
          <ProgressiveInput
            label="Telefone"
            placeholder="(43) 99999-9999"
            value={formData.phone}
            onChange={(value) => updateFormData('phone', value)}
            type="tel"
            icon={Phone}
            formatter={formatPhone}
            autoFocus
          />
          <ProgressiveInput
            label="Email"
            placeholder="contato@empresa.com"
            value={formData.email}
            onChange={(value) => updateFormData('email', value)}
            type="email"
            icon={Mail}
          />
          {validateStep(5) !== true && (
            <p className="text-sm text-destructive">{String(validateStep(5))}</p>
          )}
        </div>
      ),
      validate: () => validateStep(5),
    },
  ];

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setFormData({
        company_name: '',
        contact_name: '',
        contact_function: '',
        cnpj_cpf: '',
        phone: '',
        email: '',
      });
      setCurrentStep(1);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ProgressiveForm
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Cadastrar Cliente"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}