import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'signup' | 'recovery' | 'auth_created';
  token?: string;
  name?: string;
  password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Request body:", body);
    
    const { email, type, token, name, password }: AuthEmailRequest = JSON.parse(body);
    console.log("Parsed data:", { email, type, name });

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
      subject = "🌱 Sua conta AgroIkemba foi criada - Credenciais de Acesso";
      html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conta AgroIkemba Criada</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          
          <!-- Container Principal -->
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header com Gradient e Logo -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center; position: relative;">
              <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 36px; color: white;">🌱</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">AgroIkemba</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 300;">O Outlet de insumos agrícolas do Brasil</p>
            </div>
            
            <!-- Conteúdo Principal -->
            <div style="padding: 40px 30px;">
              
              <!-- Saudação Personalizada -->
              <div style="text-align: center; margin-bottom: 35px;">
                <h2 style="color: #1e293b; font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Bem-vindo(a), ${name || 'Usuário'}! 👋</h2>
                <p style="color: #64748b; font-size: 18px; margin: 0; font-weight: 300;">Sua conta foi criada com sucesso</p>
              </div>
              
              <!-- Card de Credenciais -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; position: relative;">
                <div style="position: absolute; top: -1px; left: 20px; background: white; padding: 0 15px; color: #22c55e; font-weight: 600; font-size: 14px;">
                  SUAS CREDENCIAIS
                </div>
                
                <div style="margin-top: 15px;">
                  <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #475569; font-size: 14px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">📧 Email de acesso</label>
                    <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-family: 'Courier New', monospace; font-size: 16px; color: #1e293b; word-break: break-all;">
                      ${email}
                    </div>
                  </div>
                  
                  <div>
                    <label style="display: block; color: #475569; font-size: 14px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">🔐 Senha temporária</label>
                    <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 12px 16px; font-family: 'Courier New', monospace; font-size: 18px; color: #92400e; font-weight: 700; letter-spacing: 2px; text-align: center;">
                      ${password}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Aviso de Segurança -->
              <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 10px; padding: 20px; margin-bottom: 35px; display: flex; align-items: flex-start;">
                <span style="font-size: 24px; margin-right: 15px;">⚠️</span>
                <div>
                  <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Importante - Segurança da Conta</h4>
                  <p style="color: #b91c1c; margin: 0; font-size: 14px; line-height: 1.5;">
                    Esta é uma senha temporária. Por segurança, <strong>altere sua senha imediatamente</strong> após o primeiro acesso ao sistema.
                  </p>
                </div>
              </div>
              
              <!-- Botão de Acesso -->
              <div style="text-align: center; margin-bottom: 35px;">
                <a href="https://jhkxcplfempenoczcoep.supabase.co" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); transition: all 0.3s ease;">
                  🚀 Acessar Sistema Agora
                </a>
              </div>
              
              <!-- Linha Separadora -->
              <hr style="border: none; height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 35px 0;">
              
              <!-- Informações de Suporte -->
              <div style="text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; line-height: 1.6;">
                  Precisa de ajuda? Nossa equipe está sempre disponível para auxiliá-lo.
                </p>
                <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.4;">
                    📞 Suporte técnico disponível • 💬 Chat online • 📧 Email de suporte
                  </p>
                </div>
                <p style="color: #475569; font-size: 14px; margin: 0; font-weight: 500;">
                  Atenciosamente,<br>
                  <span style="color: #22c55e; font-weight: 700;">Equipe AgroIkemba</span>
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
                © ${new Date().getFullYear()} AgroIkemba - Todos os direitos reservados<br>
                O maior outlet de insumos agrícolas do Brasil
              </p>
            </div>
            
          </div>
          
        </body>
        </html>
      `;
    } else {
      throw new Error('Tipo de email inválido');
    }

    console.log("Sending email to:", email);
    
    // Use simpler fallback format without display name to avoid validation errors
    const fromEmail = Deno.env.get("RESEND_FROM") || "noreply@resend.dev";
    console.log("Using sender email:", fromEmail);
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao enviar email", 
          details: emailResponse.error 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);