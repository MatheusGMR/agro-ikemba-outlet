import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderData: {
    order_number: string;
    total_amount: number;
    payment_method: string;
    logistics_option: string;
    items: any[];
  };
  userData: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
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
    const { orderData, userData }: OrderConfirmationRequest = await req.json();
    console.log("Processing order confirmation:", orderData.order_number);

    // Format products summary
    const productsSummary = orderData.items.map(item => 
      `• ${item.name} - ${item.quantity}L - R$ ${item.price.toFixed(2)}`
    ).join('\n');

    // Send email to company
    const companyEmailResponse = await resend.emails.send({
      from: "Pedidos AgroIkemba <onboarding@resend.dev>",
      to: ["matheus@agroikemba.com.br"],
      subject: `Novo Pedido: ${orderData.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Novo Pedido - ${orderData.order_number}</h1>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0f172a; margin-top: 0;">Dados do Cliente</h2>
            <p><strong>Nome:</strong> ${userData.name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Telefone:</strong> ${userData.phone}</p>
            ${userData.company ? `<p><strong>Empresa:</strong> ${userData.company}</p>` : ''}
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0f172a; margin-top: 0;">Detalhes do Pedido</h2>
            <p><strong>Número:</strong> ${orderData.order_number}</p>
            <p><strong>Total:</strong> R$ ${orderData.total_amount.toFixed(2)}</p>
            <p><strong>Pagamento:</strong> ${orderData.payment_method}</p>
            <p><strong>Logística:</strong> ${orderData.logistics_option}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0f172a; margin-top: 0;">Produtos</h2>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${productsSummary}</pre>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            Entre em contato com o cliente o mais breve possível via WhatsApp.
          </p>
        </div>
      `,
    });

    console.log("Company email sent:", companyEmailResponse);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "AgroIkemba <onboarding@resend.dev>",
      to: [userData.email],
      subject: `Pedido Confirmado: ${orderData.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Pedido Confirmado!</h1>
          
          <p>Olá ${userData.name},</p>
          
          <p>Seu pedido foi recebido com sucesso e está sendo processado.</p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0f172a; margin-top: 0;">Resumo do Pedido</h2>
            <p><strong>Número:</strong> ${orderData.order_number}</p>
            <p><strong>Total:</strong> R$ ${orderData.total_amount.toFixed(2)}</p>
            <p><strong>Pagamento:</strong> ${orderData.payment_method}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0f172a; margin-top: 0;">Produtos</h2>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${productsSummary}</pre>
          </div>

          <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Próximos Passos</h2>
            <p>Em alguns minutos, nossa equipe entrará em contato via WhatsApp para:</p>
            <ul>
              <li>Confirmar detalhes do pedido</li>
              <li>Finalizar forma de pagamento</li>
              <li>Coordenar logística e entrega</li>
            </ul>
            <p><strong>WhatsApp:</strong> (43) 98406-4141</p>
          </div>

          <p>Obrigado por escolher a AgroIkemba!</p>
          
          <p style="color: #64748b; font-size: 14px;">
            Este é um e-mail automático, não responda a esta mensagem.
          </p>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    // Send WhatsApp notification
    const whatsappMessage = `🌱 *Novo Pedido Recebido!*

*Pedido:* ${orderData.order_number}
*Cliente:* ${userData.name}
*Telefone:* ${userData.phone}
*Total:* R$ ${orderData.total_amount.toFixed(2)}

*Produtos:*
${productsSummary}

Entre em contato com o cliente o mais breve possível!`;

    try {
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v17.0/${Deno.env.get('WHATSAPP_PHONE_ID')}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '5543984064141', // Company WhatsApp
            type: 'text',
            text: {
              body: whatsappMessage
            }
          }),
        }
      );

      const whatsappResult = await whatsappResponse.json();
      console.log("WhatsApp sent:", whatsappResult);
    } catch (whatsappError) {
      console.error("WhatsApp error:", whatsappError);
      // Continue even if WhatsApp fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order confirmation sent successfully" 
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
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send order confirmation" 
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