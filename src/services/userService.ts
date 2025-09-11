
import { supabase } from '@/integrations/supabase/client';
import { PendingUser } from '@/types/admin';

export interface UserData {
  name: string;
  email: string;
  tipo: string;
  conheceu?: string;
  cnpj?: string;
  phone?: string;
  company?: string;
}

export const userService = {
  // Adicionar novo usuário
  async addUser(userData: UserData): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      console.log('Adicionando usuário ao Supabase:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          tipo: userData.tipo,
          conheceu: userData.conheceu,
          cnpj: userData.cnpj,
          phone: userData.phone,
          company: userData.company,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir usuário:', error);
        return { success: false, error: error.message };
      }

      console.log('Usuário inserido com sucesso:', data);
      return { success: true, user: data };
    } catch (error) {
      console.error('Erro inesperado ao adicionar usuário:', error);
      return { success: false, error: 'Erro inesperado ao salvar dados' };
    }
  },

  // Buscar todos os usuários
  async getUsers(): Promise<{ success: boolean; users?: PendingUser[]; error?: string }> {
    try {
      console.log('Buscando usuários do Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return { success: false, error: error.message };
      }

      // Mapear os dados do Supabase para o tipo PendingUser
      const mappedUsers: PendingUser[] = (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        tipo: user.tipo,
        conheceu: user.conheceu,
        cnpj: user.cnpj,
        phone: user.phone,
        company: user.company,
        createdAt: user.created_at,
        status: user.status as 'pending' | 'approved' | 'rejected'
      }));

      console.log('Usuários encontrados:', mappedUsers.length);
      return { success: true, users: mappedUsers };
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      return { success: false, error: 'Erro inesperado ao buscar dados' };
    }
  },

  // Atualizar status do usuário
  async updateUserStatus(userId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Atualizando status do usuário ${userId} para: ${status}`);
      
      // Primeiro, buscar os dados do usuário para envio do WhatsApp
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('name, email, phone, company, cnpj')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados do usuário:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // Atualizar o status no banco
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return { success: false, error: error.message };
      }

      console.log('Status atualizado com sucesso');

      // Se aprovado, criar/garantir conta de autenticação automaticamente
      if (status === 'approved') {
        try {
          console.log('Invocando criação de conta auth para usuário aprovado:', userId);
          const { data: batchResult, error: batchError } = await supabase.functions.invoke('create-auth-users-batch', {
            body: {
              userIds: [userId],
              createAll: false,
            },
          });

          if (batchError) {
            console.warn('Aviso: Erro ao criar conta auth em lote:', batchError);
          } else {
            console.log('Resultado da criação de conta auth:', batchResult?.summary || batchResult);
          }
        } catch (batchInvokeError) {
          console.warn('Aviso: Erro inesperado ao invocar criação de conta auth:', batchInvokeError);
        }
      }

       // Tentar enviar WhatsApp (não crítico)
      try {
        // Usar telefone do campo phone ou extrair do campo CNPJ (dados migrados)
        let phoneNumber = userData.phone || '';
        if (!phoneNumber && userData.cnpj && userData.cnpj.includes('Tel:')) {
          const telMatch = userData.cnpj.match(/Tel:\s*(.+?)(?:\s|$)/);
          if (telMatch) {
            phoneNumber = telMatch[1].trim();
          }
        }

        if (phoneNumber) {
          console.log('Tentando enviar WhatsApp para:', phoneNumber);
          const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              to: phoneNumber,
              name: userData.name,
              status: status
            }
          });

          if (whatsappError) {
            console.warn('Aviso: Erro ao enviar WhatsApp:', whatsappError);
          } else if (whatsappResponse?.success) {
            console.log('WhatsApp enviado com sucesso');
          } else {
            console.warn('Aviso: Falha no envio do WhatsApp:', whatsappResponse);
          }
        } else {
          console.log('Telefone não encontrado, WhatsApp não enviado');
        }
      } catch (whatsappError) {
        console.warn('Aviso: Erro inesperado no envio do WhatsApp:', whatsappError);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao atualizar status:', error);
      return { success: false, error: 'Erro inesperado ao atualizar dados' };
    }
  },

  // Verificar se email já existe
  async checkEmailExists(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao verificar email:', error);
        return { exists: false, error: error.message };
      }

      return { exists: !!data };
    } catch (error) {
      console.error('Erro inesperado ao verificar email:', error);
      return { exists: false, error: 'Erro inesperado' };
    }
  }
};
