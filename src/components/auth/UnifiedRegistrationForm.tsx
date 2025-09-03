import React, { useState, useRef } from 'react';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import { ProgressiveInput } from '@/components/ui/progressive-input';
import { ButtonGrid } from '@/components/ui/button-grid';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Building, Mail, Phone, Users, Store, Tractor, Globe, Linkedin, Instagram, Calendar, MessageSquare, Newspaper } from 'lucide-react';
import { userService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Google Analytics helper function
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const trackFormEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export interface UnifiedRegistrationData {
  name: string;
  tipo: string;
  cnpj?: string;
  company: string;
  phone: string;
  email: string;
  conheceu?: string;
}

export interface UnifiedRegistrationFormProps {
  context?: 'main' | 'authgate' | 'preregistration';
  onSuccess?: (data: UnifiedRegistrationData) => void;
  onCancel?: () => void;
  showSuccessDialog?: boolean;
  initialStep?: number;
  className?: string;
}

const accountTypeOptions = [
  { value: 'Revenda', label: 'Revenda', icon: Store, description: 'Distribuição de produtos' },
  { value: 'Cooperativa', label: 'Cooperativa', icon: Users, description: 'Associação de produtores' },
  { value: 'Pool de compra', label: 'Pool de compra', icon: Globe, description: 'Compra coletiva' },
  { value: 'Agricultor', label: 'Agricultor', icon: Tractor, description: 'Produtor rural' },
  { value: 'Outro', label: 'Outro', icon: Building, description: 'Outros segmentos' },
];

const howDidYouKnowOptions = [
  { value: 'Linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'Google', label: 'Google', icon: Globe },
  { value: 'Indicação', label: 'Indicação', icon: MessageSquare },
  { value: 'Evento', label: 'Evento', icon: Calendar },
  { value: 'FarmNews', label: 'FarmNews', icon: Newspaper },
  { value: 'AgroLend', label: 'AgroLend', icon: Building },
  { value: 'Outro', label: 'Outro', icon: MessageSquare },
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

export function UnifiedRegistrationForm({
  context = 'main',
  onSuccess,
  onCancel,
  showSuccessDialog = false,
  initialStep = 1,
  className
}: UnifiedRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalSuccessDialog, setInternalSuccessDialog] = useState(false);
  const formStartTracked = useRef(false);
  const [formData, setFormData] = useState<UnifiedRegistrationData>({
    name: '',
    tipo: '',
    cnpj: '',
    company: '',
    phone: '',
    email: '',
    conheceu: '',
  });

  const updateFormData = (field: keyof UnifiedRegistrationData, value: string) => {
    // Track form_start on first interaction
    if (!formStartTracked.current && field === 'name' && value.length > 0) {
      trackFormEvent('form_start', {
        form_name: 'registration_form',
        form_context: context,
        form_id: 'unified_registration'
      });
      formStartTracked.current = true;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean | string => {
    switch (step) {
      case 1: // Nome
        return formData.name.length >= 2 || "Nome deve ter pelo menos 2 caracteres";
      case 2: // Tipo
        return !!formData.tipo || "Selecione uma opção";
      case 3: // CNPJ (opcional)
        return true;
      case 4: // Empresa
        return !!formData.company || "Nome da empresa é obrigatório";
      case 5: // Contato
        const phoneValid = formData.phone.length >= 11;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (!phoneValid) return "Telefone deve ter pelo menos 11 dígitos";
        if (!emailValid) return "Email inválido";
        return true;
      case 6: // Como conheceu (opcional)
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('=== INÍCIO DO CADASTRO UNIFICADO ===');
      console.log('Context:', context);
      console.log('Dados:', formData);

      // Check if email already exists in users table
      const { exists, error: checkError } = await userService.checkEmailExists(formData.email);
      if (checkError) {
        throw new Error(`Erro ao verificar email: ${checkError}`);
      }
      
      if (exists) {
        toast.error('Este email já está cadastrado');
        setCurrentStep(5); // Go back to contact step
        return;
      }

      // Create user directly in Supabase Auth with temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'; // Ensure it meets password requirements
      
      const { data: authData, error: authError } = await supabase.functions.invoke('create-auth-user', {
        body: {
          email: formData.email,
          password: tempPassword,
          name: formData.name
        }
      });

      if (authError) {
        if (authError.message?.includes('email_exists') || authError.message?.includes('409')) {
          toast.error('Este email já possui uma conta. Tente fazer login.');
          setCurrentStep(5);
          return;
        }
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      // Add user to database with pending status
      const { success, error: userError } = await userService.addUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        tipo: formData.tipo,
        cnpj: formData.cnpj || undefined,
        conheceu: formData.conheceu || undefined,
      });

      if (!success || userError) {
        throw new Error(`Erro ao salvar cadastro: ${userError}`);
      }

      // Auto sign in the user with the temporary password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: tempPassword
      });

      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
        // Don't throw error here, user can still login manually later
      }

      // Send registration email (non-critical)
      try {
        const emailFunction = context === 'preregistration' ? 'send-pre-registration' : 'send-registration';
        const { data: emailResult, error: emailError } = await supabase.functions.invoke(emailFunction, {
          body: {
            name: formData.name,
            email: formData.email,
            telefone: formData.phone,
            empresa: formData.company,
            tipo: formData.tipo,
            cnpj: formData.cnpj || undefined,
            conheceu: formData.conheceu || undefined,
          }
        });

        if (emailError) {
          console.warn('Aviso: Erro no envio de emails:', emailError);
        } else if (emailResult?.success) {
          console.log('Emails enviados com sucesso');
        } else {
          console.warn('Aviso: Falha no envio de emails:', emailResult);
        }
      } catch (emailError) {
        console.warn('Aviso: Erro inesperado no envio de emails:', emailError);
      }

      console.log('=== CADASTRO CONCLUÍDO COM SUCESSO ===');

      // Track form_submit event
      trackFormEvent('form_submit', {
        form_name: 'registration_form',
        form_context: context,
        form_id: 'unified_registration',
        account_type: formData.tipo,
        has_cnpj: !!formData.cnpj,
        how_found: formData.conheceu || 'not_specified'
      });

      // Track Google Ads Sign-up conversion
      const { reportSignupConversion } = await import('@/utils/googleAdsConversions');
      reportSignupConversion();

      // Store user data in localStorage for main context
      if (context === 'main') {
        localStorage.setItem('user', JSON.stringify(formData));
      }

      const successMessage = context === 'preregistration' 
        ? 'Pré-cadastro enviado com sucesso! Entraremos em contato em breve via WhatsApp.'
        : 'Cadastro realizado com sucesso! Sua solicitação foi enviada para análise.';

      toast.success(successMessage);

      if (showSuccessDialog) {
        setInternalSuccessDialog(true);
      }

      if (onSuccess) {
        onSuccess(formData);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContextualMessages = () => {
    switch (context) {
      case 'authgate':
        return {
          submitText: 'Criar conta',
          successTitle: '🎉 Conta criada com sucesso!',
          successDescription: 'Parabéns! Sua conta foi criada e você receberá um email com os próximos passos.'
        };
      case 'preregistration':
        return {
          submitText: 'Criar conta',
          successTitle: '✅ Pré-cadastro enviado!',
          successDescription: 'Sua solicitação foi enviada. Entraremos em contato em breve via WhatsApp.'
        };
      default:
        return {
          submitText: 'Criar conta',
          successTitle: '🎉 Conta criada com sucesso!',
          successDescription: 'Parabéns! Sua conta foi criada e você receberá um email com os próximos passos.'
        };
    }
  };

  const contextMessages = getContextualMessages();
  const firstName = formData.name.split(' ')[0];

  const steps: ProgressiveFormStep[] = [
    {
      id: 'name',
      title: 'Vamos começar!',
      description: 'Primeiro, me conta seu nome completo',
      component: (
        <ProgressiveInput
          label="Nome Completo"
          placeholder="Digite seu nome completo"
          value={formData.name}
          onChange={(value) => updateFormData('name', value)}
          onEnter={() => setCurrentStep(2)}
          icon={User}
          required
          autoFocus
          error={validateStep(1) !== true ? String(validateStep(1)) : undefined}
        />
      ),
      validate: () => validateStep(1),
    },
    {
      id: 'account-type',
      title: firstName ? `${firstName}, para que tipo de conta você quer se cadastrar?` : 'Que tipo de conta você quer?',
      description: 'Escolha a opção que melhor descreve seu negócio',
      component: (
        <ButtonGrid
          options={accountTypeOptions}
          value={formData.tipo}
          onSelect={(value) => updateFormData('tipo', value)}
          columns={2}
        />
      ),
      validate: () => validateStep(2),
    },
    {
      id: 'cnpj',
      title: 'Informe o CNPJ',
      description: 'Isso ajudará a acelerar a aprovação da sua conta',
      component: (
        <div className="space-y-4">
          <ProgressiveInput
            label="CNPJ"
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={formData.cnpj || ''}
            onChange={(value) => updateFormData('cnpj', value)}
            onEnter={() => setCurrentStep(4)}
            icon={Building}
            formatter={formatCNPJ}
            autoFocus
          />
          <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md text-center">
            <p>💡 O CNPJ não é obrigatório, mas acelera a aprovação da sua conta</p>
          </div>
        </div>
      ),
      optional: true,
      validate: () => validateStep(3),
    },
    {
      id: 'company',
      title: 'Nome da empresa',
      description: 'Como sua empresa se chama?',
      component: (
        <ProgressiveInput
          label="Nome da Empresa"
          placeholder="Digite o nome da sua empresa"
          value={formData.company}
          onChange={(value) => updateFormData('company', value)}
          onEnter={() => setCurrentStep(5)}
          icon={Building}
          required
          autoFocus
          error={validateStep(4) !== true ? String(validateStep(4)) : undefined}
        />
      ),
      validate: () => validateStep(4),
    },
    {
      id: 'contact',
      title: 'Dados para contato',
      description: 'Precisamos do seu telefone e email para finalizar',
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
            required
            autoFocus
            error={validateStep(5) !== true && typeof validateStep(5) === 'string' && (validateStep(5) as string).includes('Telefone') ? String(validateStep(5)) : undefined}
          />
          <ProgressiveInput
            label="Email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(value) => updateFormData('email', value)}
            onEnter={() => setCurrentStep(6)}
            type="email"
            icon={Mail}
            required
            error={validateStep(5) !== true && typeof validateStep(5) === 'string' && (validateStep(5) as string).includes('Email') ? String(validateStep(5)) : undefined}
          />
        </div>
      ),
      validate: () => validateStep(5),
    },
    {
      id: 'how-did-you-know',
      title: 'Onde ficou sabendo sobre a AgroIkemba?',
      description: 'Isso nos ajuda a entender como chegar a mais pessoas como você',
      component: (
        <ButtonGrid
          options={howDidYouKnowOptions}
          value={formData.conheceu || ''}
          onSelect={(value) => updateFormData('conheceu', value)}
          columns={3}
        />
      ),
      optional: true,
      validate: () => validateStep(6),
    },
  ];

  return (
    <>
      <div className={className}>
        <ProgressiveForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitText={contextMessages.submitText}
        />
      </div>

      <Dialog open={internalSuccessDialog} onOpenChange={setInternalSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{contextMessages.successTitle}</DialogTitle>
            <DialogDescription className="text-center space-y-3 pt-4">
              <p>{contextMessages.successDescription}</p>
              {context === 'main' && (
                <p className="text-sm text-muted-foreground">
                  Agora você pode explorar nosso catálogo de produtos.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setInternalSuccessDialog(false);
                if (onCancel) onCancel();
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {context === 'main' ? 'Explorar produtos' : 'Continuar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}