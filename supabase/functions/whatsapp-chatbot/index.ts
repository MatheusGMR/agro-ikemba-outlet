import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ConversationState {
  currentMenu: string;
  searchQuery?: string;
  selectedProduct?: string;
  userPreferences?: any;
  lastProductSearch?: string[];
}

const MAIN_MENU = {
  text: `🌱 *Bem-vindo à AgroIkemba!*

Sou seu assistente virtual. Como posso ajudá-lo hoje?

📱 *Menu Principal:*
1️⃣ 🔍 Buscar Produtos
2️⃣ 💰 Consultar Preços
3️⃣ 📍 Disponibilidade por Região
4️⃣ 👨‍💼 Falar com Representante
5️⃣ ℹ️ Sobre a AgroIkemba
6️⃣ 📞 Contatos e Suporte

*Digite o número da opção desejada ou escreva sua dúvida.*`,
  buttons: [
    { id: 'search', title: '🔍 Buscar Produtos' },
    { id: 'prices', title: '💰 Consultar Preços' },
    { id: 'locations', title: '📍 Por Região' }
  ]
};

const sendWhatsAppMessage = async (phoneNumber: string, message: any) => {
  const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID');

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    throw new Error('WhatsApp credentials not configured');
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      ...message
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Erro na API do WhatsApp:', data);
    throw new Error('Failed to send WhatsApp message');
  }

  return data;
};

const getConversationState = async (phoneNumber: string): Promise<ConversationState> => {
  const { data, error } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('session_active', true)
    .order('last_interaction', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar estado da conversa:', error);
  }

  if (data) {
    return {
      currentMenu: data.current_menu || 'main',
      ...data.conversation_state
    };
  }

  return { currentMenu: 'main' };
};

const updateConversationState = async (phoneNumber: string, state: ConversationState) => {
  const { error } = await supabase
    .from('whatsapp_conversations')
    .upsert({
      phone_number: phoneNumber,
      current_menu: state.currentMenu,
      conversation_state: state,
      last_interaction: new Date().toISOString(),
      session_active: true
    }, {
      onConflict: 'phone_number'
    });

  if (error) {
    console.error('Erro ao atualizar estado da conversa:', error);
  }
};

const searchProducts = async (query: string) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('product_sku, product_name, manufacturer, active_ingredient, preco_unitario, state, city')
    .or(`product_name.ilike.%${query}%, manufacturer.ilike.%${query}%, active_ingredient.ilike.%${query}%`)
    .limit(5);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
};

const getProductsByRegion = async (state: string) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('product_sku, product_name, manufacturer, state, city, volume_available')
    .eq('state', state.toUpperCase())
    .limit(10);

  if (error) {
    console.error('Erro ao buscar produtos por região:', error);
    return [];
  }

  return data || [];
};

const processUserMessage = async (phoneNumber: string, messageText: string, userChoice: string, contactName: string) => {
  const startTime = Date.now();
  let botResponse = '';
  
  try {
    const currentState = await getConversationState(phoneNumber);
    
    // Determine user intent
    const lowerInput = (userChoice || messageText || '').toLowerCase().trim();
    
    console.log('Estado atual:', currentState.currentMenu, 'Input:', lowerInput);

    // Handle menu navigation
    if (lowerInput === '0' || lowerInput === 'menu' || lowerInput === 'voltar') {
      currentState.currentMenu = 'main';
      await updateConversationState(phoneNumber, currentState);
      
      await sendWhatsAppMessage(phoneNumber, {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: MAIN_MENU.text },
          action: {
            buttons: MAIN_MENU.buttons
          }
        }
      });
      
      botResponse = 'Menu principal exibido';
    }
    // Handle main menu options
    else if (currentState.currentMenu === 'main') {
      if (lowerInput === '1' || lowerInput === 'search' || lowerInput.includes('buscar') || lowerInput.includes('produto')) {
        currentState.currentMenu = 'search';
        await updateConversationState(phoneNumber, currentState);
        
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `🔍 *Busca de Produtos*

Digite o nome do produto, ingrediente ativo ou fabricante que você está procurando.

Exemplos:
• "Glifosato"
• "Syngenta"
• "Herbicida"

*Digite sua busca:*`
          }
        });
        
        botResponse = 'Menu de busca ativo';
      }
      else if (lowerInput === '2' || lowerInput === 'prices' || lowerInput.includes('preço')) {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `💰 *Consulta de Preços*

Para consultar preços, primeiro informe o produto que você deseja.

Digite o nome do produto ou use a opção 1 para buscar produtos disponíveis.

*Exemplo:* "Preço glifosato"`
          }
        });
        
        botResponse = 'Consulta de preços solicitada';
      }
      else if (lowerInput === '3' || lowerInput === 'locations' || lowerInput.includes('região')) {
        currentState.currentMenu = 'region';
        await updateConversationState(phoneNumber, currentState);
        
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `📍 *Consulta por Região*

Informe o estado para ver os produtos disponíveis em sua região.

Exemplos:
• SP (São Paulo)
• PR (Paraná)
• MT (Mato Grosso)
• RS (Rio Grande do Sul)

*Digite a sigla do seu estado:*`
          }
        });
        
        botResponse = 'Menu de região ativo';
      }
      else if (lowerInput === '4' || lowerInput.includes('representante')) {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `👨‍💼 *Falar com Representante*

Nossa equipe comercial entrará em contato com você em breve!

Para agilizar o atendimento, você pode também entrar em contato diretamente:

📧 Email: comercial@agroikemba.com
📱 WhatsApp: (11) 99999-9999

*Horário de atendimento:*
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

0️⃣ Voltar ao menu principal`
          }
        });
        
        botResponse = 'Representante solicitado';
      }
      else if (lowerInput === '5' || lowerInput.includes('sobre')) {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `ℹ️ *Sobre a AgroIkemba*

🌱 Somos especialistas em produtos pós-patente para o agronegócio.

✅ *Nossos diferenciais:*
• Produtos com registros válidos
• Preços competitivos
• Entrega em todo Brasil  
• Suporte técnico especializado
• Parceria com os melhores fabricantes

🎯 *Missão:* Democratizar o acesso a defensivos de qualidade com preços justos.

🌐 Site: https://agroikemba.com
📧 contato@agroikemba.com

0️⃣ Voltar ao menu principal`
          }
        });
        
        botResponse = 'Informações sobre a empresa enviadas';
      }
      else if (lowerInput === '6' || lowerInput.includes('contato') || lowerInput.includes('suporte')) {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `📞 *Contatos e Suporte*

📧 *Email:*
• Comercial: comercial@agroikemba.com
• Suporte: suporte@agroikemba.com
• Geral: contato@agroikemba.com

📱 *WhatsApp:*
• Vendas: (11) 99999-9999
• Suporte: (11) 88888-8888

🌐 *Site:* https://agroikemba.com

📍 *Endereço:*
Rua das Indústrias, 123
São Paulo - SP

*Horário de atendimento:*
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

0️⃣ Voltar ao menu principal`
          }
        });
        
        botResponse = 'Informações de contato enviadas';
      }
      else {
        // AI-powered response for unstructured queries
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `Olá ${contactName}! 👋

Entendi que você tem uma dúvida específica. Nossa equipe está aqui para ajudar!

Para um atendimento mais rápido, use nosso menu:

${MAIN_MENU.text}`
          }
        });
        
        botResponse = 'Resposta AI para consulta geral';
      }
    }
    // Handle product search
    else if (currentState.currentMenu === 'search') {
      const products = await searchProducts(lowerInput);
      
      if (products.length > 0) {
        let productList = `🔍 *Resultados da busca para "${lowerInput}":*\n\n`;
        
        products.forEach((product, index) => {
          productList += `${index + 1}️⃣ *${product.product_name}*\n`;
          productList += `🏭 ${product.manufacturer}\n`;
          if (product.active_ingredient) {
            productList += `🧪 ${product.active_ingredient}\n`;
          }
          productList += `💰 R$ ${product.preco_unitario?.toFixed(2) || 'Consulte'}\n`;
          productList += `📍 ${product.city}/${product.state}\n\n`;
        });
        
        productList += `Para mais informações sobre algum produto, digite o número correspondente.\n\n0️⃣ Voltar ao menu principal`;
        
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: { body: productList }
        });
        
        currentState.lastProductSearch = products.map(p => p.product_sku);
        await updateConversationState(phoneNumber, currentState);
        
        botResponse = `Encontrados ${products.length} produtos`;
      } else {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `❌ Nenhum produto encontrado para "${lowerInput}".

Tente buscar por:
• Nome do produto
• Ingrediente ativo
• Fabricante

Ou digite *0* para voltar ao menu principal.`
          }
        });
        
        botResponse = 'Nenhum produto encontrado';
      }
    }
    // Handle region search
    else if (currentState.currentMenu === 'region') {
      const products = await getProductsByRegion(lowerInput);
      
      if (products.length > 0) {
        let regionList = `📍 *Produtos disponíveis em ${lowerInput.toUpperCase()}:*\n\n`;
        
        products.slice(0, 5).forEach((product, index) => {
          regionList += `${index + 1}️⃣ *${product.product_name}*\n`;
          regionList += `🏭 ${product.manufacturer}\n`;
          regionList += `📦 ${product.volume_available} unidades\n`;
          regionList += `📍 ${product.city}/${product.state}\n\n`;
        });
        
        if (products.length > 5) {
          regionList += `... e mais ${products.length - 5} produtos disponíveis.\n\n`;
        }
        
        regionList += `Para mais informações, fale com nosso representante regional.\n\n0️⃣ Voltar ao menu principal`;
        
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: { body: regionList }
        });
        
        botResponse = `Encontrados ${products.length} produtos na região`;
      } else {
        await sendWhatsAppMessage(phoneNumber, {
          type: 'text',
          text: {
            body: `❌ Nenhum produto encontrado para o estado "${lowerInput}".

Estados disponíveis: SP, PR, MT, RS, GO, MG, BA

Digite a sigla correta ou *0* para voltar ao menu principal.`
          }
        });
        
        botResponse = 'Estado não encontrado';
      }
    }

    // Log analytics
    const responseTime = Date.now() - startTime;
    await supabase.from('chatbot_analytics').insert({
      phone_number: phoneNumber,
      message_type: 'bot_response',
      bot_response: botResponse,
      response_time_ms: responseTime
    });

    return botResponse;

  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    
    await sendWhatsAppMessage(phoneNumber, {
      type: 'text',  
      text: {
        body: `😔 Desculpe, ocorreu um erro temporário.

Por favor, tente novamente ou entre em contato conosco:
📧 suporte@agroikemba.com
📱 (11) 99999-9999

${MAIN_MENU.text}`
      }
    });
    
    return 'Erro interno';
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== CHATBOT INICIADO ===');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, messageText, userChoice, contactName, messageType, messageId } = await req.json();
    
    console.log('Processando:', {
      phoneNumber,
      messageText,
      userChoice,
      contactName,
      messageType
    });

    const result = await processUserMessage(phoneNumber, messageText, userChoice, contactName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        phoneNumber
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Erro no chatbot:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do chatbot' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

console.log('WhatsApp Chatbot function initialized');
serve(handler);