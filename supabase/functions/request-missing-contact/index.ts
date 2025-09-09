import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequestRequest {
  userId: string;
  userName: string;
  userEmail: string;
  missingField: 'phone' | 'email';
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== INÍCIO DA FUNÇÃO REQUEST-MISSING-CONTACT ===");
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
    const data: ContactRequestRequest = await req.json();
    console.log("=== DADOS SOLICITAÇÃO CONTATO ===");
    console.log("User ID:", data.userId);
    console.log("Nome:", data.userName);
    console.log("Email:", data.userEmail);
    console.log("Campo faltando:", data.missingField);

    // Validar campos obrigatórios
    const requiredFields = ['userId', 'userName', 'userEmail', 'missingField'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ContactRequestRequest]);
    
    if (missingFields.length > 0) {
      console.error("ERRO: Campos obrigatórios faltando:", missingFields);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Campos obrigatórios faltando",
          missingFields
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
          error: "Configuração de email não encontrada"
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

    const fieldName = data.missingField === 'phone' ? 'telefone' : 'email';
    const fieldIcon = data.missingField === 'phone' ? '📱' : '📧';

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
          from: emailData.from.replace("noreply@agroikemba.com.br", "onboarding@resend.dev")
        };
        console.log("Tentando enviar com fallback:", fallbackEmailData.from);
        return await resend.emails.send(fallbackEmailData);
      }
    };

    console.log("Enviando email de solicitação de contato...");
    // Enviar email para o usuário solicitando informação faltante
    const userEmailResponse = await sendEmailWithFallback({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: [data.userEmail],
      subject: `${fieldIcon} Informação de contato faltante - Agro Ikemba`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #075e54;">Olá, ${data.userName}!</h2>
          
          <p>Identificamos que suas informações de contato estão incompletas em nosso sistema.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">${fieldIcon} ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} não informado</h3>
            <p style="margin: 0;">Para que possamos entrar em contato e fornecer o melhor atendimento, precisamos que você informe seu ${fieldName}.</p>
          </div>
          
          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; text-align: center;">
              <strong>📞 Como atualizar suas informações:</strong><br>
              Entre em contato conosco pelo WhatsApp: <strong>+55 43 98406-4141</strong><br>
              ou responda este email informando seu ${fieldName}
            </p>
          </div>
          
          <p><strong>Por que precisamos desta informação?</strong></p>
          <ul>
            <li>🚀 Para confirmar sua aprovação na plataforma</li>
            <li>📦 Para informar sobre produtos e promoções</li>
            <li>🎯 Para oferecer suporte personalizado</li>
            <li>📱 Para facilitar a comunicação</li>
          </ul>
          
          <div style="background-color: #f0f8f0; padding: 15px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #075e54;">
            <p style="margin: 0;"><strong>⚡ Ação rápida necessária</strong></p>
            <p style="margin: 5px 0 0 0;">Entre em contato conosco o mais breve possível para completar seu cadastro e ter acesso total à plataforma.</p>
          </div>
          
          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Agro Ikemba</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Este email foi enviado para ${data.userEmail}. Se você não tem uma conta na Agro Ikemba, pode ignorar esta mensagem.
          </p>
        </div>
      `,
    });

    console.log("Email para usuário enviado:", userEmailResponse);

    if (userEmailResponse.error) {
      console.error("Erro ao enviar email para usuário:", userEmailResponse.error);
      throw new Error(`Erro ao enviar email: ${userEmailResponse.error.message}`);
    }

    // Enviar notificação para o admin também
    const adminEmailResponse = await sendEmailWithFallback({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: `Solicitação de ${fieldName} enviada - ${data.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #075e54;">Solicitação de Contato Enviada</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Usuário:</strong> ${data.userName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Campo faltante:</strong> ${fieldName}</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p>Um email foi enviado automaticamente para o usuário solicitando a informação faltante.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Sistema automatizado de solicitação de contato - Agro Ikemba.
          </p>
        </div>
      `,
    });

    console.log("Email para admin enviado:", adminEmailResponse);

    console.log("Emails enviados com sucesso!");
    console.log("=== FIM DA FUNÇÃO REQUEST-MISSING-CONTACT ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Solicitação de contato enviada com sucesso!" 
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
    console.error("=== ERRO NA FUNÇÃO REQUEST-MISSING-CONTACT ===");
    console.error("Tipo do erro:", error.constructor.name);
    console.error("Mensagem do erro:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("=== FIM DO ERRO ===");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erro interno do servidor",
        message: "Não foi possível enviar a solicitação. Tente novamente." 
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