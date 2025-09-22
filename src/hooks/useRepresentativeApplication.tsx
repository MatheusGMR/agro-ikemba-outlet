import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Submit application via Edge Function to bypass RLS issues
      const { data: responseData, error } = await supabase.functions.invoke('submit-representative-application', {
        body: {
          applicationData: data
        }
      });

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

    } catch (error) {
      console.error('Erro ao submeter aplicação:', error);
      
      // More specific error message
      if (error.message?.includes('RLS')) {
        toast.error('Erro de permissão. Por favor, tente novamente ou entre em contato conosco.');
      } else {
        toast.error('Erro ao enviar inscrição. Por favor, tente novamente.');
      }
      
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