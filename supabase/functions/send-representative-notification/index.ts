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

    // Check if this is an interest-only submission
    const isInterestOnly = application.motivo_status?.includes('Manifestação de interesse');

    // Preparar dados para o email
    const status = application.status || 'aguardando';
    const cnpjInfo = application.possui_pj && application.cnpj 
      ? application.cnpj 
      : 'Sem CNPJ';
    
    const subject = isInterestOnly 
      ? `[Interesse] Manifestação — ${application.nome} — ${application.cidade}/${application.uf}`
      : `[Recrutamento] ${status} — ${application.nome} — ${application.cidade}/${application.uf} — ${cnpjInfo}`;
    
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

    // Template do email baseado no tipo de submissão
    let emailContent = '';
    
    if (isInterestOnly) {
      emailContent = `
        <h2>📝 Nova Manifestação de Interesse - Representante Técnico Afiliado</h2>
        
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Atenção:</strong> Esta é uma <strong>manifestação de interesse</strong>. O programa está temporariamente inativo.</p>
        </div>
        
        <p><strong>Candidato:</strong> ${application.nome}</p>
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
        
        <hr>
        <h3>📋 Dados Completos (JSON)</h3>
        <details>
          <summary>Clique para ver os dados completos</summary>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto;">${JSON.stringify(applicationData, null, 2)}</pre>
        </details>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          💡 <strong>Nota:</strong> Este cadastro será contatado quando o programa for reativado.
        </p>
      `;
    } else if (status === 'reprovado') {
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

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "AgroIkemba Recrutamento <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: subject,
      html: emailContent,
    });

    console.log('Admin email sent:', adminEmailResponse);

    // Send confirmation email to applicant
    const fromDomain = Deno.env.get("RESEND_FROM") || "noreply@agroikemba.com.br";
    const applicantSubject = isInterestOnly 
      ? "✅ Recebemos sua manifestação de interesse - AgroIkemba"
      : "✅ Candidatura Recebida - Programa de Afiliados AgroIkemba";

    const applicantEmailHtml = isInterestOnly ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Manifestação de Interesse Recebida</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0;">Programa de Representantes AgroIkemba</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="font-size: 18px; color: #1a202c; margin-bottom: 20px;">
            Olá <strong>${application.nome}</strong>,
          </p>
          
          <p style="color: #4a5568; line-height: 1.8; margin-bottom: 20px;">
            Recebemos sua manifestação de interesse em fazer parte do time de representantes AgroIkemba!
          </p>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: bold; color: #d97706;">⚠️ Informação Importante:</p>
            <p style="margin: 10px 0 0 0; color: #2d3748;">
              O programa de representantes técnicos afiliados está <strong>temporariamente inativo</strong>. 
              No momento, não há processos seletivos em andamento.
            </p>
          </div>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #22c55e;">🎯 O que acontece agora?</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #2d3748;">
              <li style="margin: 8px 0;">Seu cadastro foi registrado em nossa base de dados</li>
              <li style="margin: 8px 0;">Você demonstrou interesse no programa</li>
              <li style="margin: 8px 0;">Entraremos em contato quando o programa for reativado</li>
            </ul>
          </div>

          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>Observação:</strong> Não há previsão definida para reabertura do programa. 
              Seu cadastro não garante participação em processos futuros.
            </p>
          </div>

          <p style="color: #4a5568; line-height: 1.8; margin-top: 30px;">
            Enquanto isso, fique à vontade para:
          </p>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>Conhecer mais sobre nossos produtos no site</li>
            <li>Nos seguir nas redes sociais</li>
            <li>Enviar dúvidas via WhatsApp</li>
          </ul>

          <p style="color: #4a5568; line-height: 1.8; margin-top: 30px;">
            Agradecemos o interesse e aguardamos futuras oportunidades!
          </p>

          <p style="color: #4a5568; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe AgroIkemba</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
          AgroIkemba - Outlet do Agro<br>
          Este é um email automático, por favor não responda.
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Candidatura Recebida</h1>
          <p style="color: #f0fdf4; margin: 10px 0 0 0;">Programa de Representantes AgroIkemba</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="font-size: 18px; color: #1a202c; margin-bottom: 20px;">
            Olá <strong>${application.nome}</strong>,
          </p>
          
          <p style="color: #4a5568; line-height: 1.8; margin-bottom: 20px;">
            Recebemos sua candidatura para se tornar um Representante Técnico Afiliado da AgroIkemba!
          </p>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: bold; color: #22c55e;">Próximos Passos:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #2d3748;">
              <li style="margin: 8px 0;">Nossa equipe analisará seu perfil</li>
              <li style="margin: 8px 0;">Você receberá retorno em até 5 dias úteis</li>
              <li style="margin: 8px 0;">Caso aprovado, entraremos em contato para próximas etapas</li>
            </ul>
          </div>

          <p style="color: #4a5568; line-height: 1.8; margin-top: 30px;">
            Enquanto aguarda, fique à vontade para conhecer mais sobre nossa empresa e produtos.
          </p>

          <p style="color: #4a5568; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe AgroIkemba</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
          AgroIkemba - Outlet do Agro<br>
          Este é um email automático, por favor não responda.
        </div>
      </div>
    `;

    // Send applicant email
    const applicantEmailResponse = await resend.emails.send({
      from: fromDomain,
      to: [application.email],
      subject: applicantSubject,
      html: applicantEmailHtml,
    });

    console.log('Applicant email sent:', applicantEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmailId: adminEmailResponse.data?.id,
        applicantEmailId: applicantEmailResponse.data?.id,
        isInterestOnly,
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