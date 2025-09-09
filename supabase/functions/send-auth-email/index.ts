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
      subject = "Sua conta AgroIkemba foi criada - Credenciais de Acesso";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AgroIkemba</h1>
            <p style="color: #f0fdf4; margin: 10px 0 0 0;">O Outlet de insumos agrícolas do Brasil</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1a202c; text-align: center;">Sua conta está pronta!</h2>
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px;">
              Olá ${name || 'usuário'},
            </p>
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
              Sua conta de acesso ao sistema AgroIkemba foi criada com sucesso. Use as credenciais abaixo para fazer login:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Senha temporária:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
            </div>
            
            <p style="color: #dc2626; font-size: 14px; margin-bottom: 30px;">
              <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere sua senha no primeiro acesso.
            </p>
            
            <div style="text-align: center;">
              <a href="https://jhkxcplfempenoczcoep.supabase.co" 
                 style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;">
                Acessar Sistema
              </a>
            </div>
            
            <p style="color: #4a5568; font-size: 14px; margin-top: 30px;">
              Se você tiver alguma dúvida, entre em contato conosco.
            </p>
            <p style="color: #4a5568; font-size: 14px;">
              Atenciosamente,<br>Equipe AgroIkemba
            </p>
          </div>
        </div>
      `;
    } else {
      throw new Error('Tipo de email inválido');
    }

    console.log("Sending email to:", email);
    
    const emailResponse = await resend.emails.send({
      from: "AgroIkemba <noreply@resend.dev>", // Usando dominio resend padrão
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

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