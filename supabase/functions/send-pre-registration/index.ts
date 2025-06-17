
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreRegistrationRequest {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  tipo: string;
  conheceu?: string;
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
    const data: PreRegistrationRequest = await req.json();
    console.log("Dados do pré-cadastro recebidos:", data);

    // Enviar email para a empresa
    const companyEmailResponse = await resend.emails.send({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: ["matheus@agroikemba.com.br"],
      subject: "Novo Pré-cadastro - Agro Ikemba",
      html: `
        <h2>Novo Pré-cadastro Recebido</h2>
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p><strong>Nome:</strong> ${data.nome}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefone:</strong> ${data.telefone}</p>
          <p><strong>Empresa:</strong> ${data.empresa}</p>
          <p><strong>Tipo:</strong> ${data.tipo}</p>
          ${data.conheceu ? `<p><strong>Como conheceu:</strong> ${data.conheceu}</p>` : ''}
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
    });

    // Enviar email de confirmação para o usuário
    const userEmailResponse = await resend.emails.send({
      from: "Agro Ikemba <noreply@agroikemba.com.br>",
      to: [data.email],
      subject: "Confirmação de Pré-cadastro - Agro Ikemba",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #075e54;">Obrigado pelo seu interesse, ${data.nome}!</h2>
          
          <p>Recebemos seu pré-cadastro na <strong>Agro Ikemba</strong> e em breve entraremos em contato para apresentar nossa plataforma de insumos agrícolas.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #075e54; margin-top: 0;">Dados do seu pré-cadastro:</h3>
            <p><strong>Empresa:</strong> ${data.empresa}</p>
            <p><strong>Tipo:</strong> ${data.tipo}</p>
            <p><strong>Telefone:</strong> ${data.telefone}</p>
          </div>
          
          <p>Enquanto isso, você pode:</p>
          <ul>
            <li>Seguir nossas redes sociais para novidades</li>
            <li>Entrar em contato pelo WhatsApp: +55 43 98406-4141</li>
            <li>Visitar nosso site para mais informações</li>
          </ul>
          
          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Agro Ikemba</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Este é um email automático. Se você não solicitou este pré-cadastro, pode ignorar esta mensagem.
          </p>
        </div>
      `,
    });

    console.log("Emails enviados com sucesso:", { companyEmailResponse, userEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pré-cadastro enviado com sucesso!" 
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
    console.error("Erro ao processar pré-cadastro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erro interno do servidor",
        message: "Não foi possível processar seu pré-cadastro. Tente novamente." 
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
