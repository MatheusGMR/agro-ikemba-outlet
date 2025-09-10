import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'signup' | 'recovery' | 'auth_created' | 'test';
  token?: string;
  name?: string;
  password?: string;
  subject?: string;
  content?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, token, name, password, subject: customSubject, content: customContent }: AuthEmailRequest = await req.json();

    if (!email || !type) {
      throw new Error("Email and type are required");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";
    
    let subject: string;
    let html: string;

    if (type === 'signup') {
      subject = "Confirme sua conta - AgroIkemba";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0;">O Outlet de insumos agrícolas do Brasil</p>
          </div>
          
          <div style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1a202c;">Confirme sua conta</h2>
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px;">
              ${name ? `Olá ${name}! ` : ''}Para concluir seu cadastro, clique no botão abaixo:
            </p>
            
            <a href="${token}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Confirmar Conta
            </a>
          </div>
        </div>
      `;
    } else if (type === 'recovery') {
      subject = "Redefinir senha - AgroIkemba";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0;">O Outlet de insumos agrícolas do Brasil</p>
          </div>
          
          <div style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1a202c;">Redefinir senha</h2>
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px;">
              Clique no botão abaixo para redefinir sua senha:
            </p>
            
            <a href="${token}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
        </div>
      `;
    } else if (type === 'auth_created') {
      subject = "Bem-vindo ao AgroIkemba! 🌱";
      html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao AgroIkemba</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          
          <!-- Container Principal -->
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header com Logo -->
            <div style="background: white; padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
              <div></div>
              <div style="text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end;">
                  <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></div>
                  <h1 style="color: #22c55e; margin: 0; font-size: 24px; font-weight: 700;">AgroIkemba</h1>
                </div>
                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">O Outlet do Agro</p>
              </div>
            </div>
            
            <!-- Conteúdo Principal -->
            <div style="padding: 40px 30px; text-align: left;">
              
              <!-- Saudação -->
              <h2 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Olá, ${name || 'Usuário'}</h2>
              
              <!-- Mensagem de Boas-vindas -->
              <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; line-height: 1.6;">
                Seja bem vindo ao primeiro <strong>Outlet do Agronegócio Brasileiro</strong>.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 35px 0;">
                Sua experiência com vídeo ficará melhor pelo celular.
              </p>
              
              <!-- Botão de Acesso -->
              <div style="text-align: center; margin-bottom: 35px;">
                <a href="https://www.agroikemba.com.br/login" 
                   style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px;">
                  Acessar
                </a>
              </div>
              
              <!-- Credenciais -->
              <div style="margin-bottom: 30px;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">
                  Para simular e comprar você precisará inserir suas credenciais:
                </p>
                
                <div style="background: #f9fafb; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                  <p style="color: #374151; font-size: 14px; margin: 0; font-family: monospace;">
                    <strong>Usuário:</strong> ${email}
                  </p>
                </div>
                
                <div style="background: #f9fafb; border-radius: 6px; padding: 15px;">
                  <p style="color: #374151; font-size: 14px; margin: 0; font-family: monospace;">
                    <strong>Senha:</strong> ${password}
                  </p>
                </div>
              </div>
              
              <!-- Suporte -->
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
                Caso tenha qualquer dificuldade, basta enviar uma mensagem para nosso time.
              </p>
              
              <!-- Despedida -->
              <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 500;">
                Até logo!
              </p>
              
            </div>
            
          </div>
          
        </body>
        </html>
      `;
    } else if (type === 'test') {
      subject = customSubject || "✅ Teste de Email - AgroIkemba";
      html = customContent || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0;">Sistema de Email em Produção</p>
          </div>
          <div style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1a202c;">✅ Sistema Funcionando</h2>
            <p style="color: #4a5568; font-size: 16px;">
              Email enviado com sucesso em ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `;
    } else {
      throw new Error('Tipo de email inválido');
    }

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
      headers: {
        'X-Entity-Ref-ID': new Date().getTime().toString(),
        'List-Unsubscribe': '<mailto:unsubscribe@agroikemba.com.br>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (emailResponse.error) {
      throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResponse 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email send failed:", error.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);