-- Create WhatsApp conversations table for state management
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  user_id UUID,
  current_menu TEXT DEFAULT 'main',
  conversation_state JSONB DEFAULT '{}',
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot analytics table
CREATE TABLE public.chatbot_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  user_id UUID,
  message_type TEXT NOT NULL,
  menu_option TEXT,
  user_message TEXT,
  bot_response TEXT,
  session_id TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for whatsapp_conversations
CREATE POLICY "Public access to whatsapp conversations" 
ON public.whatsapp_conversations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for chatbot_analytics
CREATE POLICY "Public access to chatbot analytics" 
ON public.chatbot_analytics 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_whatsapp_conversations_updated_at
BEFORE UPDATE ON public.whatsapp_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_conversations_phone ON public.whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_conversations_active ON public.whatsapp_conversations(session_active, last_interaction);
CREATE INDEX idx_chatbot_analytics_phone ON public.chatbot_analytics(phone_number);
CREATE INDEX idx_chatbot_analytics_created ON public.chatbot_analytics(created_at);