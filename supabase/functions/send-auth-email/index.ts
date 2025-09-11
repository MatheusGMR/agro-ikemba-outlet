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
    const fromEmail = Deno.env.get("RESEND_FROM") || "Agro Ikemba <onboarding@resend.dev>";
    
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
        <head>
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          
          <!-- Container Principal -->
          <div style="max-width: 650px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            
            <!-- Header Profissional -->
            <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 40px 40px 30px 40px; text-align: center; border-bottom: 2px solid #f1f5f9;">
              <!-- Logo centralizado -->
              <div style="text-align: center; margin-bottom: 15px;">
                <img src="https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Logo%20Ikemba.png" alt="Logo AgroIkemba" style="width: 64px; height: 64px;">
              </div>
              <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; font-family: 'DM Sans', sans-serif;">O outlet do agro</p>
            </div>
            
            <!-- Seção de Boas-vindas -->
            <div style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0 0 15px 0; line-height: 1.3;">
                  Olá, ${name || 'Usuário'}! 👋
                </h2>
                <p style="color: #475569; font-size: 18px; margin: 0 0 10px 0; line-height: 1.5;">
                  Seja bem-vindo ao primeiro <strong style="color: #22c55e;">Outlet do Agronegócio Brasileiro</strong>
                </p>
              </div>
              
              <!-- Video Section -->
              <div style="text-align: center; margin-bottom: 35px;">
                 <div style="position: relative; display: inline-block; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                   <a href="https://www.youtube.com/embed/anuLkbDW96w" target="_blank" style="text-decoration: none;">
                     <img src="https://i.ytimg.com/vi/anuLkbDW96w/hqdefault.jpg" alt="Demonstração da Plataforma Mobile" style="width: 280px; height: 157px; object-fit: cover; border-radius: 8px;">
                     <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                       <div style="width: 0; height: 0; border-left: 16px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px;"></div>
                     </div>
                   </a>
                 </div>
              </div>
              
              <!-- Botão de Acesso Principal -->
              <div style="text-align: center; margin-bottom: 40px;">
                 <a href="https://www.agroikemba.com.br/login" 
                    style="display: inline-block; background: #22c55e; color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3); transition: all 0.3s ease;">
                   Acessar plataforma
                 </a>
              </div>
              
               <!-- Seção de Credenciais -->
               <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                 <h3 style="color: #334155; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                   Suas credenciais de acesso
                 </h3>
                 <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0; text-align: center; line-height: 1.5;">
                   Para simular e comprar, utilize as credenciais abaixo:
                 </p>
                 
                 <!-- Card do Usuário -->
                 <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   <div style="display: flex; align-items: center; margin-bottom: 8px;">
                     <span style="width: 24px; height: 24px; background: #9ca3af; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">
                       <span style="color: white; font-size: 12px; font-weight: bold;">@</span>
                     </span>
                     <span style="color: #374151; font-size: 14px; font-weight: 600;">Usuário</span>
                   </div>
                   <p style="color: #1f2937; font-size: 16px; margin: 0; font-family: 'SF Mono', Monaco, monospace; background: #f1f5f9; padding: 12px; border-radius: 6px; word-break: break-all;">
                     ${email}
                   </p>
                 </div>
                 
                 <!-- Card da Senha -->
                 <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   <div style="display: flex; align-items: center; margin-bottom: 8px;">
                     <span style="width: 24px; height: 24px; background: #9ca3af; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">
                       <span style="color: white; font-size: 12px; font-weight: bold;">*</span>
                     </span>
                     <span style="color: #374151; font-size: 14px; font-weight: 600;">Senha</span>
                   </div>
                   <p style="color: #1f2937; font-size: 16px; margin: 0; font-family: 'SF Mono', Monaco, monospace; background: #f1f5f9; padding: 12px; border-radius: 6px;">
                     ${password}
                   </p>
                 </div>
               </div>
              
               <!-- Seção de Suporte -->
               <div style="padding: 24px; margin-bottom: 30px; text-align: center;">
                 <h3 style="color: #6b7280; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; font-family: 'DM Sans', sans-serif;">Precisa de ajuda?</h3>
                 <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                   Caso tenha qualquer dificuldade, basta enviar uma mensagem para nosso time
                 </p>
                 <a href="https://wa.me/43984064141" target="_blank" style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; font-family: 'DM Sans', sans-serif;">
                   📱 Falar no WhatsApp
                 </a>
               </div>
              
              <!-- Despedida -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #374151; font-size: 16px; margin: 0; font-weight: 600;">
                  Até logo! 🌱
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  Equipe AgroIkemba
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.4;">
                © 2024 AgroIkemba - O Outlet do Agronegócio Brasileiro<br>
                Este email foi enviado automaticamente. Não responda este email.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin-top: 8px;">
                Template: v2025-09-11-6
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

    console.log("[send-auth-email] Sending email", { type, to: email, version: "v2025-09-11-6" });
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