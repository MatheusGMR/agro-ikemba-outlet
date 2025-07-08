
import { useState, useEffect } from 'react';

export interface AdminSession {
  email: string;
  isAdmin: boolean;
  loginTime: number;
  verified: boolean;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = () => {
    console.log('Verificando status de autenticação...');
    try {
      const adminSession = localStorage.getItem('adminSession');
      const userSession = localStorage.getItem('user');
      
      console.log('AdminSession encontrada:', adminSession);
      console.log('UserSession encontrada:', userSession);
      
      if (adminSession && userSession) {
        const session: AdminSession = JSON.parse(adminSession);
        const user = JSON.parse(userSession);
        
        console.log('Sessão parseada:', session);
        console.log('Usuário parseado:', user);
        
        // Verificar se a sessão ainda é válida (24 horas)
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
        
        console.log('Idade da sessão (ms):', sessionAge);
        console.log('Idade máxima (ms):', maxAge);
        
        if (sessionAge < maxAge && 
            session.isAdmin && 
            session.email === 'admin@agroikemba.com' &&
            user.isAdmin) {
          console.log('Sessão válida, autenticando...');
          setIsAuthenticated(true);
        } else {
          console.log('Sessão inválida ou expirada, fazendo logout...');
          logout();
        }
      } else {
        console.log('Nenhuma sessão encontrada');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    }
    setIsLoading(false);
  };

  const logout = () => {
    console.log('Fazendo logout e limpando storage...');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    checkAuthStatus
  };
};
