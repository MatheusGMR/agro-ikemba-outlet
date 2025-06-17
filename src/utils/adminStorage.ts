
import { PendingUser } from '@/types/admin';

const STORAGE_KEY = 'pendingUsers';

export const getStoredUsers = (): PendingUser[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Erro ao recuperar usuários:', error);
    return [];
  }
};

export const addPendingUser = (userData: {
  name: string;
  email: string;
  tipo: string;
  conheceu?: string;
  cnpj?: string;
}): void => {
  try {
    const existingUsers = getStoredUsers();
    
    // Verificar se usuário já existe
    const userExists = existingUsers.some(user => user.email === userData.email);
    if (userExists) {
      console.log('Usuário já existe na lista de pendentes');
      return;
    }

    const newUser: PendingUser = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      tipo: userData.tipo,
      conheceu: userData.conheceu,
      createdAt: new Date().toISOString(),
      status: 'pending',
      cnpj: userData.cnpj
    };

    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    
    console.log('Usuário adicionado à lista de pendentes:', newUser);
    console.log('Total de usuários pendentes:', updatedUsers.length);
  } catch (error) {
    console.error('Erro ao adicionar usuário pendente:', error);
  }
};

export const updateUserStatus = (userId: string, status: 'approved' | 'rejected'): void => {
  try {
    const users = getStoredUsers();
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status } : user
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    console.log(`Status do usuário ${userId} atualizado para: ${status}`);
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
