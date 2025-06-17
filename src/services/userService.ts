
import { supabase } from '@/integrations/supabase/client';
import { PendingUser } from '@/types/admin';

export interface UserData {
  name: string;
  email: string;
  tipo: string;
  conheceu?: string;
  cnpj?: string;
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

      console.log('Usuários encontrados:', data?.length || 0);
      return { success: true, users: data || [] };
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      return { success: false, error: 'Erro inesperado ao buscar dados' };
    }
  },

  // Atualizar status do usuário
  async updateUserStatus(userId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Atualizando status do usuário ${userId} para: ${status}`);
      
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return { success: false, error: error.message };
      }

      console.log('Status atualizado com sucesso');
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
