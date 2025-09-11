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
      subject = "Bem-vindo ao Agro Ikemba! 🌱 Seu acesso está pronto";
      html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao Agro Ikemba</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh;">
          
          <!-- Container Principal -->
          <div style="max-width: 600px; margin: 0 auto; background: white; min-height: 100vh;">
            
            <!-- Hero Section -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 60px 40px; text-align: center; position: relative; overflow: hidden;">
              <!-- Decorative Elements -->
              <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
              <div style="position: absolute; bottom: -30px; right: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
              
              <!-- Logo -->
              <div style="margin-bottom: 30px;">
                <img src="https://www.agroikemba.com.br/lovable-uploads/34d4bbce-6ea4-4767-adc0-3e017766a398.png?v=2" alt="Agro Ikemba Logo" style="width: 60px; height: 60px; margin-bottom: 15px;">
                <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px;">
                  AGRO IKEMBA
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px;">
                  O PRIMEIRO OUTLET DO AGRONEGÓCIO BRASILEIRO
                </p>
              </div>
              
              <!-- Welcome Message -->
              <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; border: 1px solid rgba(255,255,255,0.2);">
                <h2 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                  Olá, ${name || 'Usuário'}! 👋
                </h2>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; line-height: 1.5;">
                  Seja bem-vindo ao futuro do agronegócio.<br>
                  <strong>Seu acesso está liberado!</strong>
                </p>
              </div>
            </div>
            
            <!-- Content Section -->
            <div style="padding: 50px 40px;">
              
              <!-- Access Button -->
              <div style="text-align: center; margin-bottom: 40px;">
                <a href="https://www.agroikemba.com.br/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 18px 50px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; letter-spacing: 0.5px; box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4); text-transform: uppercase; border: 3px solid transparent; background-clip: padding-box;">
                  🚀 ACESSAR PLATAFORMA
                </a>
              </div>
              
              <!-- Credentials Section -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 40px; margin-bottom: 40px; border: 2px solid #e2e8f0; position: relative;">
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                    <span style="color: white; font-size: 28px;">🔐</span>
                  </div>
                  <h3 style="color: #1e293b; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">
                    Suas Credenciais de Acesso
                  </h3>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Guarde estas informações em local seguro
                  </p>
                </div>
                
                <!-- User Credential -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s ease;">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: white; font-size: 18px; font-weight: bold;">@</span>
                    </div>
                    <div>
                      <span style="color: #1e293b; font-size: 16px; font-weight: 700; display: block;">USUÁRIO</span>
                      <span style="color: #64748b; font-size: 12px;">Seu email de acesso</span>
                    </div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-family: 'SF Mono', Monaco, monospace; font-weight: 600; word-break: break-all;">
                      ${email}
                    </p>
                  </div>
                </div>
                
                <!-- Password Credential -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 15px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: white; font-size: 18px;">🔑</span>
                    </div>
                    <div>
                      <span style="color: #1e293b; font-size: 16px; font-weight: 700; display: block;">SENHA</span>
                      <span style="color: #64748b; font-size: 12px;">Sua senha temporária</span>
                    </div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
                    <p style="color: #1e293b; font-size: 18px; margin: 0; font-family: 'SF Mono', Monaco, monospace; font-weight: 700; letter-spacing: 2px;">
                      ${password}
                    </p>
                  </div>
                </div>
                
              </div>
              
              <!-- Support Section -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
                  <span style="color: white; font-size: 24px;">💬</span>
                </div>
                <h3 style="color: #92400e; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Precisa de Ajuda?</h3>
                <p style="color: #a16207; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
                  Nossa equipe está pronta para te ajudar no WhatsApp
                </p>
                <a href="https://wa.me/43984064141" target="_blank" 
                   style="display: inline-block; background: #25d366; color: white; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
                  📱 Falar no WhatsApp
                </a>
              </div>
              
              <!-- Video Section -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h3 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0 0 20px 0;">🎥 Veja como funciona</h3>
                <div style="position: relative; display: inline-block; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2);">
                  <a href="https://youtu.be/anuLkbDW96w" target="_blank" style="text-decoration: none; display: block;">
                    <img src="https://i.ytimg.com/vi/anuLkbDW96w/hqdefault.jpg" alt="Demonstração da Plataforma" style="width: 300px; height: 169px; object-fit: cover;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                      <div style="width: 0; height: 0; border-left: 20px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
                    </div>
                  </a>
                </div>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; text-align: center; color: white;">
              <div style="margin-bottom: 20px;">
                <img src="https://www.agroikemba.com.br/lovable-uploads/34d4bbce-6ea4-4767-adc0-3e017766a398.png?v=2" alt="Logo" style="width: 40px; height: 40px; margin-bottom: 10px;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0; font-weight: 600;">AGRO IKEMBA</p>
              </div>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
                © 2024 Agro Ikemba - O Outlet do Agronegócio Brasileiro<br>
                Este email foi enviado automaticamente. Não responda este email.
              </p>
              <p style="color: #64748b; font-size: 10px; margin: 0;">
                Template: v2025-09-11-4
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

    console.log("[send-auth-email] Sending email", { type, to: email, version: "v2025-09-11-4" });
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