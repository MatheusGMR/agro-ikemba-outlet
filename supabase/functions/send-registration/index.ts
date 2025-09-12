
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  tipo: string;
  conheceu?: string;
  cnpj?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== INÍCIO DA FUNÇÃO SEND-REGISTRATION ===");
  console.log("Método:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Retornando headers CORS para OPTIONS");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("Método não permitido:", req.method);
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body
    const data: RegistrationRequest = await req.json();
    console.log("=== DADOS REGISTRO RECEBIDOS ===");
    console.log("Nome:", data.name || "NOME NÃO ENCONTRADO");
    console.log("Email:", data.email || "EMAIL NÃO ENCONTRADO");
    console.log("Telefone:", data.phone || "TELEFONE NÃO ENCONTRADO");
    console.log("Empresa:", data.company || "EMPRESA NÃO ENCONTRADA");
    console.log("Dados completos:", JSON.stringify(data, null, 2));

    // Validar campos obrigatórios
    const requiredFields = ['name', 'email', 'phone', 'company'];
    const missingFields = requiredFields.filter(field => !data[field as keyof RegistrationRequest]);
    
    if (missingFields.length > 0) {
      console.error("ERRO: Campos obrigatórios faltando:", missingFields);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Campos obrigatórios faltando",
          missingFields,
          receivedData: data
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Enhanced phone validation
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      console.error("ERRO: Telefone inválido:", data.phone, "Dígitos:", phoneDigits);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Telefone inválido",
          message: "Telefone deve ter 10 ou 11 dígitos"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error("ERRO: Email inválido:", data.email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido",
          message: "Formato de email inválido"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Verificar se a chave da API do Resend está configurada
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("ERRO CRÍTICO: RESEND_API_KEY não está configurada!");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuração de email não encontrada",
          message: "Erro interno: serviço de email não configurado" 
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

    console.log("RESEND_API_KEY encontrada, criando cliente Resend...");
    const resend = new Resend(resendApiKey);

    // Função para enviar email com fallback
    const sendEmailWithFallback = async (emailData: any) => {
      try {
        // Tentar primeiro com domínio personalizado
        console.log("Tentando enviar com domínio personalizado:", emailData.from);
        return await resend.emails.send(emailData);
      } catch (error) {
        console.warn("Falha com domínio personalizado, tentando fallback:", error);
        // Fallback para domínio padrão do Resend
        const fallbackEmailData = {
          ...emailData,
          from: emailData.from.replace(/noreply@agroikemba\.com\.br|AgroIkemba <[^>]+>/, "onboarding@resend.dev")
        };
        console.log("Tentando enviar com fallback:", fallbackEmailData.from);
        return await resend.emails.send(fallbackEmailData);
      }
    };

    console.log("Enviando email para a empresa...");
    // Enviar email para a empresa
    const companyEmailResponse = await sendEmailWithFallback({
      from: Deno.env.get("RESEND_FROM") || "AgroIkemba <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: "Nova Solicitação de Cadastro - AgroIkemba",
      headers: {
        'X-Entity-Ref-ID': new Date().getTime().toString(),
        'X-Priority': '1',
      },
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌱 AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 8px 0 0 0; font-size: 14px;">Sistema de Gestão</p>
          </div>
          
          <div style="background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Nova Solicitação de Cadastro</h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Dados do Solicitante:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Nome:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.name}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.email}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Telefone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.phone}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.company}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tipo:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.tipo}</td></tr>
                ${data.conheceu ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Como conheceu:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.conheceu}</td></tr>` : ''}
                ${data.cnpj ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.cnpj}</td></tr>` : '<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Não informado</td></tr>'}
                <tr><td style="padding: 8px 0;"><strong>Data/Hora:</strong></td><td style="padding: 8px 0;">${new Date().toLocaleString('pt-BR')}</td></tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">📋 Próximos Passos:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Analisar e validar os dados fornecidos</li>
                <li>Verificar informações da empresa</li>
                <li>Aprovar cadastro ou solicitar documentação adicional</li>
                <li>Entrar em contato via telefone ou email</li>
              </ul>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              📧 Notificação automática do sistema AgroIkemba<br>
              Recebido em ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email para empresa enviado:", companyEmailResponse);

    if (companyEmailResponse.error) {
      console.error("Erro ao enviar email para empresa:", companyEmailResponse.error);
      throw new Error(`Erro ao enviar email para empresa: ${companyEmailResponse.error.message}`);
    }

    console.log("Enviando email de confirmação para o usuário...");
    // Enviar email de confirmação para o usuário
    const userEmailResponse = await sendEmailWithFallback({
      from: Deno.env.get("RESEND_FROM") || "AgroIkemba <noreply@agroikemba.com.br>",
      to: [data.email],
      subject: "Solicitação de Cadastro Recebida - AgroIkemba",
      headers: {
        'X-Entity-Ref-ID': new Date().getTime().toString(),
        'List-Unsubscribe': '<mailto:unsubscribe@agroikemba.com.br>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌱 AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 8px 0 0 0; font-size: 14px;">O Outlet de Insumos Agrícolas do Brasil</p>
          </div>
          
          <div style="background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px;">✅ Solicitação Recebida com Sucesso!</h2>
            
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 25px 0;">
              Olá <strong>${data.name}</strong>, sua solicitação de cadastro foi recebida e está sendo analisada pela nossa equipe especializada.
            </p>
            
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbf7d0;">
              <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 16px;">📋 Resumo da Solicitação:</h3>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden;">
                <tr style="background: #f9fafb;"><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.company}</td></tr>
                <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Tipo de Cliente:</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.tipo}</td></tr>
                <tr style="background: #f9fafb;"><td style="padding: 12px;"><strong>Email de Contato:</strong></td><td style="padding: 12px;">${data.email}</td></tr>
              </table>
            </div>
            
            <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #fde68a;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; display: flex; align-items: center;">
                ⏱️ Próximos Passos
              </h4>
              <p style="color: #92400e; margin: 0 0 15px 0;">
                Nossa equipe comercial analisará sua solicitação e entrará em contato em até <strong>24 horas úteis</strong> através do email cadastrado.
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <h4 style="color: #475569; margin: 0 0 15px 0; font-size: 16px;">🤝 Enquanto isso, você pode:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">💬 <strong>WhatsApp:</strong> +55 43 984064141</li>
                <li style="margin-bottom: 8px;">🌐 <strong>Site:</strong> www.agroikemba.com.br</li>
                <li style="margin-bottom: 8px;">📧 <strong>Email:</strong> Responder diretamente este email</li>
                <li>📱 <strong>Redes Sociais:</strong> Seguir para novidades e promoções</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; border-radius: 12px; display: inline-block;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px;">🚀 AgroIkemba</h3>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Conectando o campo ao futuro</p>
              </div>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 16px;">
                Atenciosamente,
              </p>
              <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 600;">
                Equipe Comercial AgroIkemba
              </p>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.4;">
              📧 Esta é uma confirmação automática. Se você não solicitou este cadastro, pode ignorar esta mensagem.<br>
              Para cancelar futuras comunicações, responda este email com "DESCADASTRAR".
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email para usuário enviado:", userEmailResponse);

    if (userEmailResponse.error) {
      console.error("Erro ao enviar email para usuário:", userEmailResponse.error);
      throw new Error(`Erro ao enviar email para usuário: ${userEmailResponse.error.message}`);
    }

    console.log("Ambos os emails enviados com sucesso!");
    console.log("=== FIM DA FUNÇÃO SEND-REGISTRATION ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Solicitação de cadastro enviada com sucesso! Verifique seu email." 
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
    console.error("=== ERRO NA FUNÇÃO SEND-REGISTRATION ===");
    console.error("Tipo do erro:", error.constructor.name);
    console.error("Mensagem do erro:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("=== FIM DO ERRO ===");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erro interno do servidor",
        message: "Não foi possível processar sua solicitação. Tente novamente ou entre em contato conosco." 
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
