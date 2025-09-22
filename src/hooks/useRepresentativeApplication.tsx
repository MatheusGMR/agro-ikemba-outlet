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
  doc_urls: Record<string, string>;
  termos_aceitos: boolean;
  status?: 'aguardando' | 'reprovado' | 'aprovado';
  motivo_status?: string;
}

export function useRepresentativeApplication() {
  const [isLoading, setIsLoading] = useState(false);

  const submitApplication = async (data: ApplicationData) => {
    setIsLoading(true);
    
    try {
      // Preparar dados para inserção
      const insertData = {
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        cidade: data.cidade,
        uf: data.uf,
        linkedin: data.linkedin || null,
        possui_pj: data.possui_pj,
        cnpj: data.cnpj || null,
        razao_social: data.razao_social || null,
        experiencia_anos: data.experiencia_anos,
        segmentos: data.segmentos,
        canais: data.canais,
        regioes: data.regioes,
        conflito_interesse: data.conflito_interesse,
        conflito_detalhe: data.conflito_detalhe || null,
        produtos_lista: data.produtos_lista,
        forecast_data: {}, // Objeto vazio para compatibilidade
        infra_celular: data.infra_celular,
        infra_internet: data.infra_internet,
        infra_veic_proprio: data.infra_veic_proprio,
        infra_veic_alugado: data.infra_veic_alugado,
        docs_ok: Object.keys(data.doc_urls).length >= 3,
        // Manter doc_urls como objeto para compatibilidade  
        doc_urls: data.doc_urls ? Object.values(data.doc_urls) : [],
        termos_aceitos: data.termos_aceitos,
        status: data.status || 'aguardando',
        motivo_status: data.motivo_status || 'Aguardando análise'
      };

      // Inserir no banco de dados
      const { data: insertedData, error } = await supabase
        .from('representative_applications')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Aplicação inserida:', insertedData);

      // Enviar notificação por email via Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-representative-notification', {
          body: {
            application: insertedData,
            type: 'new_application'
          }
        });

        if (emailError) {
          console.error('Erro ao enviar email:', emailError);
          // Não bloquear o fluxo se o email falhar
        }
      } catch (emailErr) {
        console.error('Erro ao chamar função de email:', emailErr);
        // Não bloquear o fluxo se o email falhar
      }

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