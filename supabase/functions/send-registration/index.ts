
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  name: string;
  email: string;
  tipo: string;
  conheceu?: string;
  cnpj?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const data: RegistrationRequest = await req.json();
    console.log("Dados de cadastro recebidos:", data);

    // Enviar email para a empresa
    const companyEmailResponse = await resend.emails.send({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: "Nova Solicitação de Cadastro - Agro Ikemba",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #075e54;">Nova Solicitação de Cadastro Completo</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Tipo:</strong> ${data.tipo}</p>
            ${data.conheceu ? `<p><strong>Como conheceu:</strong> ${data.conheceu}</p>` : ''}
            ${data.cnpj ? `<p><strong>CNPJ:</strong> ${data.cnpj}</p>` : '<p><strong>CNPJ:</strong> Email corporativo - não necessário</p>'}
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p><strong>Próximos passos:</strong></p>
          <ul>
            <li>Analisar a solicitação de cadastro</li>
            <li>Verificar dados da empresa (se aplicável)</li>
            <li>Aprovar ou solicitar informações adicionais</li>
            <li>Entrar em contato com o usuário</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Este email foi gerado automaticamente pelo sistema Agro Ikemba.
          </p>
        </div>
      `,
    });

    // Enviar email de confirmação para o usuário
    const userEmailResponse = await resend.emails.send({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: [data.email],
      subject: "Solicitação de Cadastro Recebida - Agro Ikemba",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #075e54;">Solicitação Recebida com Sucesso, ${data.name}!</h2>
          
          <p>Recebemos sua solicitação de cadastro na <strong>Agro Ikemba</strong> e agora ela está em análise pela nossa equipe.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #075e54;">
            <h3 style="color: #075e54; margin-top: 0;">Dados da sua solicitação:</h3>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Tipo:</strong> ${data.tipo}</p>
            ${data.conheceu ? `<p><strong>Como conheceu:</strong> ${data.conheceu}</p>` : ''}
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>⏰ O que acontece agora?</strong></p>
            <p style="margin: 5px 0 0 0;">Nossa equipe analisará sua solicitação e entrará em contato em até <strong>24 horas</strong> pelo email cadastrado.</p>
          </div>
          
          <p><strong>Enquanto isso, você pode:</strong></p>
          <ul>
            <li>📱 Entrar em contato pelo WhatsApp: +55 43 98406-4141</li>
            <li>🌐 Visitar nosso site para mais informações</li>
            <li>📧 Responder este email caso tenha dúvidas</li>
          </ul>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; text-align: center;">
              <strong>🚀 Agro Ikemba</strong><br>
              Revolucionando o mercado de insumos agrícolas
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Agro Ikemba</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Este é um email automático. Se você não solicitou este cadastro, pode ignorar esta mensagem.
          </p>
        </div>
      `,
    });

    console.log("Emails de cadastro enviados com sucesso:", { companyEmailResponse, userEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Solicitação de cadastro enviada com sucesso!" 
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
    console.error("Erro ao processar solicitação de cadastro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erro interno do servidor",
        message: "Não foi possível processar sua solicitação. Tente novamente." 
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
