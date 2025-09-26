import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  application: any;
  type: 'new_application' | 'status_update';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application, type }: NotificationRequest = await req.json();
    
    console.log('Processing notification:', { type, applicationId: application.id });

    // Preparar dados para o email
    const status = application.status || 'aguardando';
    const cnpjInfo = application.possui_pj && application.cnpj 
      ? application.cnpj 
      : 'Sem CNPJ';
    
    const subject = `[Recrutamento] ${status} — ${application.nome} — ${application.cidade}/${application.uf} — ${cnpjInfo}`;
    
    // Formatear dados da aplicação em JSON legível
    const applicationData = {
      id: application.id,
      data_envio: application.data_envio || application.created_at,
      status: application.status,
      motivo_status: application.motivo_status,
      
      // Identificação
      nome: application.nome,
      email: application.email,
      whatsapp: application.whatsapp,
      cidade: application.cidade,
      uf: application.uf,
      linkedin: application.linkedin || 'Não informado',
      
      // Pessoa Jurídica
      possui_pj: application.possui_pj,
      cnpj: application.cnpj || 'Não informado',
      razao_social: application.razao_social || 'Não informado',
      
      // Atuação Comercial
      experiencia_anos: application.experiencia_anos,
      segmentos: Array.isArray(application.segmentos) ? application.segmentos.join(', ') : application.segmentos,
      canais: Array.isArray(application.canais) ? application.canais.join(', ') : application.canais,
      regioes: Array.isArray(application.regioes) ? application.regioes.join(', ') : application.regioes,
      conflito_interesse: application.conflito_interesse,
      conflito_detalhe: application.conflito_detalhe || 'Não há',
      
      // Produtos
      produtos_lista: application.produtos_lista,
      forecast_data: application.forecast_data ? JSON.stringify(application.forecast_data, null, 2) : 'Não informado',
      
      // Infraestrutura
      infra_celular: application.infra_celular,
      infra_internet: application.infra_internet,
      infra_veic_proprio: application.infra_veic_proprio,
      infra_veic_alugado: application.infra_veic_alugado,
      
      // Documentos
      docs_ok: application.docs_ok,
      doc_urls: application.doc_urls ? application.doc_urls.length : 0,
      
      // Termos
      termos_aceitos: application.termos_aceitos
    };

    // Template do email baseado no status
    let emailContent = '';
    
    if (status === 'reprovado') {
      emailContent = `
        <h2>🚫 Nova Inscrição REPROVADA - Representante Técnico Afiliado</h2>
        
        <p><strong>Candidato:</strong> ${application.nome}</p>
        <p><strong>Motivo da Reprovação:</strong> ${application.motivo_status}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>WhatsApp:</strong> ${application.whatsapp}</p>
        <p><strong>Localização:</strong> ${application.cidade}/${application.uf}</p>
        
        <h3>⚠️ Situação</h3>
        <p>O candidato não possui pessoa jurídica ativa e por isso foi automaticamente reprovado pelo sistema.</p>
        
        <hr>
        <h3>📋 Dados Completos (JSON)</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">${JSON.stringify(applicationData, null, 2)}</pre>
      `;
    } else {
      emailContent = `
        <h2>✅ Nova Inscrição - Representante Técnico Afiliado</h2>
        
        <p><strong>Candidato:</strong> ${application.nome}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>WhatsApp:</strong> ${application.whatsapp}</p>
        <p><strong>Localização:</strong> ${application.cidade}/${application.uf}</p>
        
        <h3>🏢 Pessoa Jurídica</h3>
        <p><strong>Possui PJ:</strong> ${application.possui_pj ? 'Sim' : 'Não'}</p>
        ${application.possui_pj ? `
        <p><strong>CNPJ:</strong> ${application.cnpj}</p>
        <p><strong>Razão Social:</strong> ${application.razao_social}</p>
        ` : ''}
        
        <h3>💼 Experiência</h3>
        <p><strong>Tempo no Agronegócio:</strong> ${application.experiencia_anos}</p>
        <p><strong>Segmentos:</strong> ${Array.isArray(application.segmentos) ? application.segmentos.join(', ') : application.segmentos}</p>
        <p><strong>Canais Atendidos:</strong> ${Array.isArray(application.canais) ? application.canais.join(', ') : application.canais}</p>
        
        <h3>📍 Atuação</h3>
        <p><strong>Regiões:</strong> ${Array.isArray(application.regioes) ? application.regioes.join(', ') : application.regioes}</p>
        
        <h3>📦 Produtos</h3>
        <p><strong>Produtos que vende:</strong></p>
        <pre style="background: #f9f9f9; padding: 10px; border-left: 4px solid #007acc;">${application.produtos_lista}</pre>
        
        <h3>📊 Infraestrutura</h3>
        <p>
          📱 Celular: ${application.infra_celular ? 'Sim' : 'Não'} | 
          🌐 Internet: ${application.infra_internet ? 'Sim' : 'Não'} | 
          🚗 Veículo Próprio: ${application.infra_veic_proprio ? 'Sim' : 'Não'} | 
          🚙 Veículo Alugado: ${application.infra_veic_alugado ? 'Sim' : 'Não'}
        </p>
        
        <h3>📄 Documentos</h3>
        <p><strong>Documentos Enviados:</strong> ${application.doc_urls ? application.doc_urls.length : 0}/3</p>
        <p><strong>Status:</strong> ${application.docs_ok ? '✅ Completo' : '⚠️ Incompleto'}</p>
        
        ${application.conflito_interesse ? `
        <h3>⚠️ Conflito de Interesse</h3>
        <p><strong>Detalhes:</strong> ${application.conflito_detalhe}</p>
        ` : ''}
        
        <hr>
        <h3>📋 Dados Completos para Análise (JSON)</h3>
        <details>
          <summary>Clique para ver os dados completos</summary>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto;">${JSON.stringify(applicationData, null, 2)}</pre>
        </details>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          💡 <strong>Próximos passos:</strong> Analisar a inscrição e entrar em contato em até 5 dias úteis conforme prometido ao candidato.
        </p>
      `;
    }

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "AgroIkemba Recrutamento <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: subject,
      html: emailContent,
    });

    console.log('Email enviado com sucesso:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        status: application.status 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Erro ao enviar notificação:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);