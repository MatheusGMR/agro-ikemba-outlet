import React, { useState } from 'react';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { PersonJuridicaPopup } from './PersonJuridicaPopup';
import { TermsDialog } from './TermsDialog';
import { useRepresentativeApplication } from '@/hooks/useRepresentativeApplication';
import { toast } from 'sonner';
import { validateCNPJ, validatePhone, validateUF, validateEmail, formatCNPJ, formatPhone } from '@/utils/validators';
import { useBotProtection } from '@/hooks/useBotProtection';
import { HoneypotFields } from '@/components/auth/HoneypotFields';

interface FormData {
  // Identificação
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  uf: string;
  linkedin: string;
  
  // Pessoa Jurídica
  possui_pj: boolean | null;
  cnpj: string;
  razao_social: string;
  
  // Atuação Comercial
  experiencia_anos: string;
  segmentos: string[];
  canais: string[];
  regioes: string[];
  conflito_interesse: boolean;
  conflito_detalhe: string;
  
  // Infraestrutura
  infra_celular: boolean;
  infra_internet: boolean;
  infra_veic_proprio: boolean;
  infra_veic_alugado: boolean;
  
  // Termos
  termos_aceitos: boolean;
}

const initialFormData: FormData = {
  nome: '',
  email: '',
  whatsapp: '',
  cidade: '',
  uf: '',
  linkedin: '',
  possui_pj: null,
  cnpj: '',
  razao_social: '',
  experiencia_anos: '',
  segmentos: [],
  canais: [],
  regioes: [],
  conflito_interesse: false,
  conflito_detalhe: '',
  infra_celular: true,
  infra_internet: true,
  infra_veic_proprio: false,
  infra_veic_alugado: false,
  termos_aceitos: false
};

export function RepresentativeApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPJPopup, setShowPJPopup] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitApplication } = useRepresentativeApplication();
  
  // Bot protection
  const {
    honeypotData,
    updateHoneypot,
    validateBotProtection,
    isReCaptchaReady,
    recaptchaError
  } = useBotProtection();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTermsAccept = () => {
    updateFormData('termos_aceitos', true);
  };

  const handlePJResponse = (hasActivePJ: boolean, confirmed?: boolean) => {
    if (hasActivePJ && confirmed) {
      updateFormData('possui_pj', true);
      setShowPJPopup(false);
    } else if (!hasActivePJ) {
      // Será tratado pelo handleSubmitBlocked
      updateFormData('possui_pj', false);
    }
  };

  const handleSubmitBlocked = async () => {
    try {
      // Criar dados para submissão com status "reprovado"
      const blockedData = {
        ...formData,
        produtos_lista: '', // Campo vazio para compatibilidade
        possui_pj: false,
        status: 'reprovado' as const,
        motivo_status: 'Não possui CNPJ ativo (MEI ou empresa)'
      };

      // Submeter automaticamente
      await submitApplication(blockedData);
      
      // Não mostrar toast aqui pois será mostrado no hook
    } catch (error) {
      console.error('Erro ao submeter aplicação bloqueada:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
      throw error;
    }
  };

  const validateStep = (step: number): boolean | string => {
    switch (step) {
      case 1: // Identificação
        if (!formData.nome.trim()) return 'Nome é obrigatório';
        if (!formData.email.trim()) return 'Email é obrigatório';
        if (!validateEmail(formData.email)) return 'Email inválido';
        if (!formData.whatsapp.trim()) return 'WhatsApp é obrigatório';
        if (!validatePhone(formData.whatsapp)) return 'WhatsApp deve ter formato brasileiro válido';
        if (!formData.cidade.trim()) return 'Cidade é obrigatória';
        if (!formData.uf.trim()) return 'UF é obrigatória';
        if (!validateUF(formData.uf)) return 'UF deve ser válida (ex: SP, RJ, MG)';
        return true;
        
      case 2: // Pessoa Jurídica
        if (!formData.possui_pj) return 'É necessário ter CNPJ para prosseguir';
        if (formData.possui_pj && !formData.cnpj.trim()) return 'CNPJ é obrigatório';
        if (formData.possui_pj && !validateCNPJ(formData.cnpj)) return 'CNPJ inválido';
        if (formData.possui_pj && !formData.razao_social.trim()) return 'Razão social é obrigatória';
        return true;
        
      case 3: // Atuação Comercial
        if (!formData.experiencia_anos) return 'Anos de experiência é obrigatório';
        if (formData.segmentos.length === 0) return 'Selecione pelo menos um segmento';
        if (formData.canais.length === 0) return 'Selecione pelo menos um canal';
        if (formData.regioes.length === 0) return 'Selecione pelo menos uma região';
        return true;
        
      case 4: // Infraestrutura
        if (!formData.infra_celular && !formData.infra_internet) {
          return 'É necessário ter pelo menos celular ou internet';
        }
        return true;
        
      case 5: // Termos
        if (!formData.termos_aceitos) return 'Você deve aceitar os termos e condições';
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

      await submitApplication({
        ...formData,
        produtos_lista: '', // Campo vazio para compatibilidade
        status: 'aguardando',
        motivo_status: 'Aguardando análise'
      });
      
      toast.success('Inscrição enviada com sucesso! Entraremos em contato em até 5 dias úteis.');
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      toast.error('Erro ao enviar inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: ProgressiveFormStep[] = [
    {
      id: 'identification',
      title: 'Identificação',
      description: 'Informações pessoais básicas',
      component: (
        <div className="space-y-6">
          {/* Honeypot fields for bot protection */}
          <HoneypotFields data={honeypotData} onChange={updateHoneypot} />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => updateFormData('nome', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="whatsapp">Celular/WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => updateFormData('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => updateFormData('cidade', e.target.value)}
                placeholder="Sua cidade"
                required
              />
            </div>
            <div>
              <Label htmlFor="uf">UF *</Label>
              <Input
                id="uf"
                value={formData.uf}
                onChange={(e) => updateFormData('uf', e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => updateFormData('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
            />
          </div>
        </div>
      ),
      validate: () => validateStep(1)
    },
    {
      id: 'pessoa-juridica',
      title: 'Pessoa Jurídica',
      description: 'Informações sobre sua empresa',
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">
              Você possui pessoa jurídica aberta (MEI/Empresa)? *
            </Label>
            <RadioGroup
              value={formData.possui_pj === null ? '' : String(formData.possui_pj)}
              onValueChange={(value) => {
                if (value === 'false') {
                  setShowPJPopup(true);
                } else if (value === 'true') {
                  updateFormData('possui_pj', true);
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="pj-sim" />
                <Label htmlFor="pj-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="pj-nao" />
                <Label htmlFor="pj-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.possui_pj === true && (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => updateFormData('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social / Nome Fantasia *</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => updateFormData('razao_social', e.target.value)}
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>
            </div>
          )}
        </div>
      ),
      validate: () => validateStep(2)
    },
    {
      id: 'atuacao-comercial',
      title: 'Atuação Comercial',
      description: 'Sua experiência no agronegócio',
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">
              Tempo de experiência em agronegócio *
            </Label>
            <RadioGroup
              value={formData.experiencia_anos}
              onValueChange={(value) => updateFormData('experiencia_anos', value)}
            >
              {['<1 ano', '1-3 anos', '3-5 anos', '>5 anos'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`exp-${option}`} />
                  <Label htmlFor={`exp-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-medium mb-4 block">
              Segmentos de experiência (múltipla seleção) *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {['Defensivos', 'Nutrição', 'Sementes', 'Crédito/Barter', 'Logística', 'Armazenagem'].map((segment) => (
                <div key={segment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`seg-${segment}`}
                    checked={formData.segmentos.includes(segment)}
                    onCheckedChange={(checked) => {
                      const newSegments = checked 
                        ? [...formData.segmentos, segment]
                        : formData.segmentos.filter(s => s !== segment);
                      updateFormData('segmentos', newSegments);
                    }}
                  />
                  <Label htmlFor={`seg-${segment}`}>{segment}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-4 block">
              Canais atendidos *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {['Produtor', 'Revenda', 'Cooperativa', 'Agroindústria'].map((canal) => (
                <div key={canal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`canal-${canal}`}
                    checked={formData.canais.includes(canal)}
                    onCheckedChange={(checked) => {
                      const newCanais = checked 
                        ? [...formData.canais, canal]
                        : formData.canais.filter(c => c !== canal);
                      updateFormData('canais', newCanais);
                    }}
                  />
                  <Label htmlFor={`canal-${canal}`}>{canal}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="regioes">Regiões/cidades atendidas *</Label>
            <Textarea
              id="regioes"
              value={formData.regioes.join('\n')}
              onChange={(e) => updateFormData('regioes', e.target.value.split('\n').filter(r => r.trim()))}
              placeholder="Digite uma cidade/região por linha&#10;Exemplo:&#10;São Paulo - SP&#10;Campinas - SP&#10;Região de Ribeirão Preto - SP"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="conflito"
                checked={formData.conflito_interesse}
                onCheckedChange={(checked) => updateFormData('conflito_interesse', !!checked)}
              />
              <Label htmlFor="conflito">Possuo conflito de interesse atual com alguma empresa</Label>
            </div>
            
            {formData.conflito_interesse && (
              <div className="animate-fade-in">
                <Label htmlFor="conflito_detalhe">Qual empresa/situação?</Label>
                <Textarea
                  id="conflito_detalhe"
                  value={formData.conflito_detalhe}
                  onChange={(e) => updateFormData('conflito_detalhe', e.target.value)}
                  placeholder="Descreva o conflito de interesse"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      ),
      validate: () => validateStep(3)
    },
    {
      id: 'infraestrutura',
      title: 'Infraestrutura',
      description: 'Recursos disponíveis para trabalho',
      component: (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="infra-celular">Possuo celular</Label>
                <Checkbox
                  id="infra-celular"
                  checked={formData.infra_celular}
                  onCheckedChange={(checked) => updateFormData('infra_celular', !!checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="infra-internet">Tenho acesso à internet</Label>
                <Checkbox
                  id="infra-internet"
                  checked={formData.infra_internet}
                  onCheckedChange={(checked) => updateFormData('infra_internet', !!checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="infra-veiculo">Possuo veículo próprio</Label>
                <Checkbox
                  id="infra-veiculo"
                  checked={formData.infra_veic_proprio}
                  onCheckedChange={(checked) => updateFormData('infra_veic_proprio', !!checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="infra-alugado">Utilizo veículo alugado</Label>
                <Checkbox
                  id="infra-alugado"
                  checked={formData.infra_veic_alugado}
                  onCheckedChange={(checked) => updateFormData('infra_veic_alugado', !!checked)}
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'termos',
      title: 'Termos e Condições',
      description: 'Aceite dos termos de parceria',
      component: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo da Política de Comissão</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• A comissão é calculada sobre a taxa da plataforma nas vendas efetivamente liquidadas</p>
              <p>• Pode haver indicativos de indicação (sobre vendas de profissionais indicados), conforme regras do documento anexo</p>
              <p>• Obrigações: seguir preços e regras da listagem oficial; não alterar condições; cumprir boas práticas e confidencialidade</p>
              <p>• LGPD: seus dados serão usados exclusivamente para análise de cadastro, auditoria e contato</p>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 text-blue-500 mt-0.5">
                ℹ️
              </div>
              <p className="text-sm text-blue-700">
                <strong>Documentos:</strong> Após análise inicial positiva, nossa equipe solicitará os documentos necessários (RG, CPF, Comprovante de Residência) via e-mail ou WhatsApp.
              </p>
            </div>
          </Card>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termos"
              checked={formData.termos_aceitos}
              onCheckedChange={(checked) => updateFormData('termos_aceitos', !!checked)}
              className="mt-1"
            />
            <Label htmlFor="termos" className="text-sm">
              Li e aceito os{' '}
              <button 
                type="button"
                onClick={() => setShowTermsDialog(true)}
                className="text-primary hover:underline underline-offset-2 cursor-pointer"
              >
                Termos de Parceria e Política de Comissão
              </button>
              {' '}da AgroIkemba *
            </Label>
          </div>
        </div>
      ),
      validate: () => validateStep(5)
    }
  ];

  return (
    <>
      <ProgressiveForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText="Enviar Inscrição"
        className="bg-card shadow-lg border rounded-lg p-8"
      />

        <PersonJuridicaPopup
          isOpen={showPJPopup}
          onClose={() => setShowPJPopup(false)}
          onResponse={handlePJResponse}
          onSubmitBlocked={handleSubmitBlocked}
        />

        <TermsDialog
          open={showTermsDialog}
          onOpenChange={setShowTermsDialog}
          onAccept={handleTermsAccept}
        />
    </>
  );
}