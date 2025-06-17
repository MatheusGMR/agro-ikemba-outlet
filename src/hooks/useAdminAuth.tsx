
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
  }, []);

  const checkAuthStatus = () => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session: AdminSession = JSON.parse(adminSession);
        
        // Verificar se a sessão ainda é válida (24 horas)
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
        
        if (sessionAge < maxAge && session.isAdmin && session.email === 'admin@agroikemba.com') {
          setIsAuthenticated(true);
        } else {
          // Sessão expirada, limpar
          logout();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    }
    setIsLoading(false);
  };

  const logout = () => {
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
