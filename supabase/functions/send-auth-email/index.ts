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
  type: 'signup' | 'recovery';
  token?: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, token, name }: AuthEmailRequest = await req.json();

    let subject: string;
    let html: string;

    if (type === 'signup') {
      subject = "Confirme sua conta - AgroIkemba";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0; font-size: 16px;">O Outlet de insumos agrícolas do Brasil</p>
          </div>
          
          <div style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1a202c; margin-bottom: 20px;">Confirme sua conta</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${name ? `Olá ${name}! ` : ''}Para concluir seu cadastro na AgroIkemba e ter acesso a todos os nossos produtos e ofertas especiais, clique no botão abaixo:
            </p>
            
            <a href="${token}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;
                      margin-bottom: 30px;">
              Confirmar Conta
            </a>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #2d3748; margin: 0; font-size: 14px;">
                <strong>Benefícios da sua conta AgroIkemba:</strong>
              </p>
              <ul style="color: #4a5568; text-align: left; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Acesso a produtos com registro MAPA</li>
                <li>Descontos progressivos por volume</li>
                <li>Suporte de representantes especializados</li>
                <li>Logística otimizada para sua região</li>
              </ul>
            </div>
            
            <p style="color: #718096; font-size: 12px; margin-top: 30px;">
              Se você não criou esta conta, pode ignorar este email com segurança.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'recovery') {
      subject = "Redefinir senha - AgroIkemba";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0; font-size: 16px;">O Outlet de insumos agrícolas do Brasil</p>
          </div>
          
          <div style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1a202c; margin-bottom: 20px;">Redefinir sua senha</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Recebemos uma solicitação para redefinir a senha da sua conta AgroIkemba. Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <a href="${token}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;
                      margin-bottom: 30px;">
              Redefinir Senha
            </a>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Por segurança:</strong> Este link expira em 24 horas. Se você não solicitou esta alteração, ignore este email.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "AgroIkemba <noreply@agroikemba.com>",
      to: [email],
      subject: subject!,
      html: html!,
    });

    return new Response(JSON.stringify(emailResponse), {
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