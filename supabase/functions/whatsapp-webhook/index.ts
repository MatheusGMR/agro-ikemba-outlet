import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para mascarar tokens nos logs (não expor o valor completo)
const mask = (t?: string) => {
  if (!t) return 'undefined';
  const trimmed = t.trim();
  if (trimmed.length <= 8) return '***';
  return `${trimmed.slice(0,4)}...${trimmed.slice(-4)}`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== WEBHOOK RECEBIDO ===');
  console.log('Método:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  const urlObj = new URL(req.url);
  const pathname = urlObj.pathname || '';
  if (req.method === 'GET' && pathname.endsWith('/health')) {
    return new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain', ...corsHeaders } });
  }

  // Debug endpoint to check env availability (masked)
  if (req.method === 'GET' && pathname.endsWith('/debug-env')) {
    const raw = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? '';
    const verify = raw.trim();
    const supaUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supaKeyRaw = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supaKey = supaKeyRaw.trim();
    const payload = {
      verifyTokenMasked: mask(verify),
      isSet: verify.length > 0,
      supabaseUrlPresent: supaUrl.length > 0,
      supabaseServiceRoleMasked: mask(supaKey),
      timestamp: new Date().toISOString(),
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const RAW_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? '';
    const VERIFY_TOKEN = RAW_VERIFY_TOKEN.trim();
    console.log('VERIFY_TOKEN (masked):', mask(VERIFY_TOKEN));
    
    // Webhook verification (GET request)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const tokenRaw = url.searchParams.get('hub.verify_token') || '';
      const token = tokenRaw.trim();
      const challenge = url.searchParams.get('hub.challenge') || '';

      console.log('Verificação webhook:', { mode, token_masked: mask(token), env_token_masked: mask(VERIFY_TOKEN), challenge });

      if (mode === 'subscribe') {
        if (VERIFY_TOKEN && token === VERIFY_TOKEN) {
          console.log('Webhook verificado com sucesso');
          return new Response(challenge, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
        } else if (!VERIFY_TOKEN) {
          console.warn('ATENÇÃO: WHATSAPP_VERIFY_TOKEN não definido. Bypass TEMPORÁRIO de verificação habilitado.');
          return new Response(challenge, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
        } else {
          console.log('Falha na verificação do webhook');
          return new Response('Forbidden', { status: 403, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
        }
      }
    }

    // Process incoming messages (POST request)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      // Verify webhook signature
      const signature = req.headers.get('x-hub-signature-256');
      if (!signature) {
        console.log('Assinatura ausente');
        return new Response('Unauthorized', { status: 401 });
      }

      // Process WhatsApp webhook
      const entries = body.entry || [];
      
      for (const entry of entries) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const value = change.value;
            const messages = value.messages || [];
            const contacts = value.contacts || [];
            
            for (const message of messages) {
              const phoneNumber = message.from;
              const messageId = message.id;
              const messageType = message.type;
              const timestamp = parseInt(message.timestamp) * 1000;
              
              console.log('Processando mensagem:', {
                phoneNumber,
                messageId,
                messageType,
                timestamp: new Date(timestamp).toISOString()
              });

              // Get contact info
              const contact = contacts.find((c: any) => c.wa_id === phoneNumber);
              const contactName = contact?.profile?.name || 'Usuário';

              // Process different message types
              let messageText = '';
              let userChoice = '';

              if (messageType === 'text') {
                messageText = message.text?.body || '';
                userChoice = messageText.trim();
              } else if (messageType === 'interactive') {
                if (message.interactive?.type === 'button_reply') {
                  userChoice = message.interactive.button_reply.id;
                  messageText = message.interactive.button_reply.title;
                } else if (message.interactive?.type === 'list_reply') {
                  userChoice = message.interactive.list_reply.id;
                  messageText = message.interactive.list_reply.title;
                }
              }

              // Log analytics
              await supabase.from('chatbot_analytics').insert({
                phone_number: phoneNumber,
                message_type: messageType,
                user_message: messageText,
                session_id: messageId
              });

              // Call chatbot processing
              try {
                const { data, error } = await supabase.functions.invoke('whatsapp-chatbot', {
                  body: {
                    phoneNumber,
                    messageText,
                    userChoice,
                    contactName,
                    messageType,
                    messageId
                  }
                });

                if (error) {
                  console.error('Erro ao chamar chatbot:', error);
                } else {
                  console.log('Chatbot processado:', data);
                }
              } catch (error) {
                console.error('Erro inesperado ao chamar chatbot:', error);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

console.log('WhatsApp Webhook function initialized');
serve(handler);