import React, { useState, useRef, useEffect } from 'react';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import { ProgressiveInput } from '@/components/ui/progressive-input';
import { ButtonGrid } from '@/components/ui/button-grid';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Building, Mail, Phone, Users, Store, Tractor, Globe, Linkedin, Instagram, Calendar, MessageSquare, Newspaper } from 'lucide-react';
import { userService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBotProtection } from '@/hooks/useBotProtection';
import { HoneypotFields } from '@/components/auth/HoneypotFields';

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

function UnifiedRegistrationFormInner({
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

  // Bot protection hooks
  const { 
    honeypotData, 
    updateHoneypot, 
    validateBotProtection, 
    testReCaptcha, 
    formStartTime, 
    isReCaptchaReady,
    recaptchaStatus,
    recaptchaError
  } = useBotProtection();

  // Test reCAPTCHA on component mount and show toast on timeout
  useEffect(() => {
    const testCaptcha = async () => {
      if (isReCaptchaReady) {
        console.log('🧪 Component mounted - testing reCAPTCHA...');
        const test = await testReCaptcha();
        if (!test.working) {
          console.warn('⚠️ reCAPTCHA test failed on mount:', test.error);
        } else {
          console.log('✅ reCAPTCHA is working properly. Score:', test.score);
        }
      }
    };

    // Wait a bit for reCAPTCHA to initialize
    const timer = setTimeout(testCaptcha, 3000);
    return () => clearTimeout(timer);
  }, [isReCaptchaReady, testReCaptcha]);

  // Show warning toast if reCAPTCHA times out
  useEffect(() => {
    if (recaptchaStatus === 'timeout' && recaptchaError) {
      toast.error(recaptchaError, {
        duration: 8000,
        description: 'Tente recarregar a página ou desative bloqueadores de anúncios.'
      });
    }
  }, [recaptchaStatus, recaptchaError]);

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
    console.log(`🔍 Validating step ${step} with data:`, formData);
    
    switch (step) {
      case 1: // Nome
        const nameValid = formData.name.length >= 2;
        if (!nameValid) {
          console.log(`❌ Step ${step} validation failed: Nome muito curto (${formData.name.length} chars)`);
        }
        return nameValid || "Nome deve ter pelo menos 2 caracteres";
        
      case 2: // Tipo
        const typeValid = !!formData.tipo;
        if (!typeValid) {
          console.log(`❌ Step ${step} validation failed: Tipo não selecionado`);
        }
        return typeValid || "Selecione uma opção";
        
      case 3: // CNPJ (opcional)
        console.log(`✅ Step ${step} validation passed: CNPJ is optional`);
        return true;
        
      case 4: // Empresa
        const companyValid = !!formData.company;
        if (!companyValid) {
          console.log(`❌ Step ${step} validation failed: Empresa não preenchida`);
        }
        return companyValid || "Nome da empresa é obrigatório";
        
      case 5: // Contato
        const phoneValid = formData.phone.length >= 11;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        
        if (!phoneValid) {
          console.log(`❌ Step ${step} validation failed: Telefone inválido (${formData.phone.length} chars)`);
          return "Telefone deve ter pelo menos 11 dígitos";
        }
        if (!emailValid) {
          console.log(`❌ Step ${step} validation failed: Email inválido (${formData.email})`);
          return "Email inválido";
        }
        
        console.log(`✅ Step ${step} validation passed: Contato válido`);
        return true;
        
      case 6: // Como conheceu (opcional)
        console.log(`✅ Step ${step} validation passed: Como conheceu is optional`);
        return true;
        
      default:
        console.log(`✅ Step ${step} validation passed: Default case`);
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Unique attempt id to correlate logs across steps
    const attemptId = `reg-${Date.now()}-${Math.random().toString(36).slice(-6)}`;
    const common = {
      form_name: 'registration_form',
      form_context: context,
      form_id: 'unified_registration',
      attempt_id: attemptId,
    };
    
    try {
      console.log(`[REG][${attemptId}] Start unified registration`, { context, data: formData });
      
      // 🛡️ BOT PROTECTION - Check before processing
      console.log(`[REG][${attemptId}] Running bot protection validation...`);
      const botCheck = await validateBotProtection();
      
      if (botCheck.isBot) {
        console.log(`[REG][${attemptId}] Bot detected:`, botCheck);
        trackFormEvent('bot_detected', {
          ...common,
          bot_reason: botCheck.reason,
          recaptcha_score: botCheck.recaptchaScore,
          form_time: Date.now() - formStartTime
        });
        
        // Show specific error messages based on bot detection reason
        let errorMessage = 'Verificação de segurança falhada. Tente novamente.';
        let errorDescription = '';
        
        if (botCheck.reason === 'honeypot') {
          errorMessage = 'Suspeita de atividade automatizada detectada.';
        } else if (botCheck.reason === 'too_fast') {
          errorMessage = 'Por favor, preencha o formulário com mais atenção.';
          errorDescription = 'Dedique alguns segundos para revisar suas informações.';
        } else if (botCheck.reason === 'recaptcha_timeout') {
          errorMessage = 'Sistema de segurança não carregou a tempo.';
          errorDescription = 'Recarregue a página ou desative bloqueadores de anúncios.';
        } else if (botCheck.reason === 'recaptcha_unavailable') {
          errorMessage = 'Sistema de segurança não está disponível.';
          errorDescription = 'Verifique sua conexão e bloqueadores de anúncios.';
        } else if (botCheck.reason?.includes('recaptcha')) {
          errorMessage = 'Verificação de segurança falhou.';
          errorDescription = 'Recarregue a página e tente novamente.';
        }
        
        toast.error(errorMessage, errorDescription ? { description: errorDescription } : undefined);
        return;
      }

      console.log(`[REG][${attemptId}] Bot protection passed. Score: ${botCheck.recaptchaScore}`);
      trackFormEvent('form_attempt_start', {
        ...common,
        account_type: formData.tipo,
        has_cnpj: !!formData.cnpj,
        how_found: formData.conheceu || 'not_specified',
        recaptcha_score: botCheck.recaptchaScore,
        form_time: Date.now() - formStartTime
      });

      // Check if email already exists in users table
      trackFormEvent('email_check_start', { ...common, email: formData.email });
      const { exists, error: checkError } = await userService.checkEmailExists(formData.email);
      console.log(`[REG][${attemptId}] Email check result`, { exists, checkError });
      if (checkError) {
        trackFormEvent('email_check_error', { ...common, message: checkError });
        throw new Error(`Erro ao verificar email: ${checkError}`);
      }
      if (exists) {
        trackFormEvent('email_already_exists', { ...common });
        toast.error('Este email já está cadastrado');
        setCurrentStep(5); // Go back to contact step
        return;
      }

      // Create user directly in Supabase Auth with temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'; // Ensure it meets password requirements
      trackFormEvent('auth_user_create_start', { ...common });
      const { data: authData, error: authError } = await supabase.functions.invoke('create-auth-user', {
        body: {
          email: formData.email,
          password: tempPassword,
          name: formData.name,
        },
      });
      console.log(`[REG][${attemptId}] Auth user create response`, { authData, authError });
      if (authError) {
        if (authError.message?.includes('email_exists') || authError.message?.includes('409')) {
          trackFormEvent('auth_email_conflict', { ...common });
          toast.error('Este email já possui uma conta. Tente fazer login.');
          setCurrentStep(5);
          return;
        }
        trackFormEvent('auth_user_create_error', { ...common, message: authError.message || String(authError) });
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      } else {
        trackFormEvent('auth_user_create_success', { ...common, user_id: (authData as any)?.user?.id || null });
      }

      // Add user to database with pending status
      trackFormEvent('db_insert_start', { ...common });
      const { success, error: userError } = await userService.addUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        tipo: formData.tipo,
        cnpj: formData.cnpj || undefined,
        conheceu: formData.conheceu || undefined,
      });
      console.log(`[REG][${attemptId}] DB insert result`, { success, userError });
      if (!success || userError) {
        trackFormEvent('db_insert_error', { ...common, message: userError });
        throw new Error(`Erro ao salvar cadastro: ${userError}`);
      } else {
        trackFormEvent('db_insert_success', { ...common });
      }

      // Auto sign in the user with the temporary password
      trackFormEvent('auto_sign_in_start', { ...common });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: tempPassword,
      });
      if (signInError) {
        console.warn(`[REG][${attemptId}] Auto sign-in failed`, signInError);
        trackFormEvent('auto_sign_in_error', { ...common, message: signInError.message });
        // Don't throw error here, user can still login manually later
      } else {
        trackFormEvent('auto_sign_in_success', { ...common });
      }

      // Send registration email (non-critical)
      try {
        const emailFunction = context === 'preregistration' ? 'send-pre-registration' : 'send-registration';
        trackFormEvent('email_send_start', { ...common, function: emailFunction });
        const { data: emailResult, error: emailError } = await supabase.functions.invoke(emailFunction, {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            tipo: formData.tipo,
            cnpj: formData.cnpj || undefined,
            conheceu: formData.conheceu || undefined,
          },
        });
        console.log(`[REG][${attemptId}] Email send response`, { emailResult, emailError });
        if (emailError) {
          console.warn('Aviso: Erro no envio de emails:', emailError);
          trackFormEvent('email_send_error', { ...common, message: emailError.message || String(emailError) });
        } else if ((emailResult as any)?.success) {
          console.log('Emails enviados com sucesso');
          trackFormEvent('email_send_success', { ...common });
        } else {
          console.warn('Aviso: Falha no envio de emails:', emailResult);
          trackFormEvent('email_send_failure', { ...common });
        }
      } catch (emailError) {
        console.warn('Aviso: Erro inesperado no envio de emails:', emailError);
        trackFormEvent('email_send_exception', { ...common, message: String(emailError) });
      }

      console.log(`[REG][${attemptId}] Registration completed successfully`);

      // Track form_submit event
      trackFormEvent('form_submit', {
        ...common,
        account_type: formData.tipo,
        has_cnpj: !!formData.cnpj,
        how_found: formData.conheceu || 'not_specified',
      });
      trackFormEvent('registration_success', { ...common });

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
      console.error(`[REG][${attemptId}] Registration error`, error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Erro inesperado ao criar conta. Tente novamente.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('email') && errorMsg.includes('already')) {
          errorMessage = 'Este email já possui uma conta. Tente fazer login.';
          setCurrentStep(5); // Go back to email step
        } else if (errorMsg.includes('recaptcha') || errorMsg.includes('bot')) {
          errorMessage = 'Verificação de segurança falhada. Aguarde um momento e tente novamente.';
        } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
          errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
          errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
          // Don't go to a specific step, let user check current data
        }
      }
      
      trackFormEvent('registration_error', {
        ...common,
        message: error instanceof Error ? error.message : String(error),
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        current_step: currentStep,
      });
      
      toast.error(errorMessage);
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
        {/* 🍯 Honeypot fields for bot detection */}
        <HoneypotFields data={honeypotData} onChange={updateHoneypot} />
        
        {/* reCAPTCHA status indicator */}
        {recaptchaStatus === 'loading' && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-md flex items-center gap-2 text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-muted-foreground">Carregando sistema de segurança...</span>
          </div>
        )}
        
        {recaptchaStatus === 'timeout' && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
            <p className="text-destructive font-medium">⚠️ Sistema de segurança não carregou</p>
            <p className="text-destructive/80 text-xs mt-1">Recarregue a página ou desative bloqueadores de anúncios</p>
          </div>
        )}
        
        <ProgressiveForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting || recaptchaStatus === 'loading' || recaptchaStatus === 'timeout'}
          submitText={
            recaptchaStatus === 'loading' 
              ? 'Aguarde...' 
              : recaptchaStatus === 'timeout'
              ? 'Sistema indisponível'
              : contextMessages.submitText
          }
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

// Main component without reCAPTCHA provider (using global provider from App.tsx)
export function UnifiedRegistrationForm(props: UnifiedRegistrationFormProps) {
  return <UnifiedRegistrationFormInner {...props} />;
}