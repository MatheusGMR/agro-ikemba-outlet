import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Retry com backoff para resiliência
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

interface ApplicationData {
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  uf: string;
  linkedin?: string;
  possui_pj: boolean;
  cnpj?: string;
  razao_social?: string;
  experiencia_anos: string;
  segmentos: string[];
  canais: string[];
  regioes: string[];
  conflito_interesse: boolean;
  conflito_detalhe?: string;
  produtos_lista: string;
  infra_celular: boolean;
  infra_internet: boolean;
  infra_veic_proprio: boolean;
  infra_veic_alugado: boolean;
  termos_aceitos: boolean;
  status?: 'aguardando' | 'reprovado' | 'aprovado';
  motivo_status?: string;
}

export function useRepresentativeApplication() {
  const [isLoading, setIsLoading] = useState(false);

  const submitApplication = async (data: ApplicationData) => {
    setIsLoading(true);
    
    try {
      // Submit application via Edge Function com retry
      const { data: responseData, error } = await retryWithBackoff(() =>
        supabase.functions.invoke('submit-representative-application', {
          body: {
            applicationData: data
          }
        })
      );

      if (error) {
        throw error;
      }

      console.log('Application submitted successfully:', responseData);

      // Tracking do Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'representative_form_submit', {
          event_category: 'Representative',
          event_label: data.status || 'aguardando',
          value: 1
        });
      }

      // Mensagem especial para caso "reprovado"
      if (data.status === 'reprovado') {
        toast.error(
          'Obrigado pelo seu interesse em representar a Agro Ikemba. Para participar, é necessário ter CNPJ ativo (ex.: MEI). Quando sua empresa estiver aberta, faça um novo pedido de inscrição. 💚'
        );
        return;
      }

      toast.success('Inscrição enviada com sucesso! Nossa equipe entrará em contato em até 5 dias úteis.');

    } catch (error: any) {
      console.error('=== ERROR SUBMITTING APPLICATION ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      console.error('Application data:', JSON.stringify(data, null, 2));
      
      // Mensagens mais específicas
      let errorMessage = 'Erro ao enviar inscrição. Por favor, tente novamente.';
      
      if (error?.message?.includes('RLS')) {
        errorMessage = 'Erro de permissão. Entre em contato conosco.';
      } else if (error?.message?.includes('duplicate')) {
        errorMessage = 'Este email já foi cadastrado. Verifique seu email ou entre em contato.';
      } else if (error?.message?.includes('invalid')) {
        errorMessage = 'Dados inválidos detectados. Verifique CNPJ, email e telefone.';
      } else if (error?.code) {
        errorMessage = `Erro ${error.code}: ${error.message}`;
      }
      
      toast.error(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitApplication,
    isLoading
  };
}