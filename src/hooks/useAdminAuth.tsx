
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuthStatus = async () => {
    console.log('🔍 checkAuthStatus: Iniciando verificação de autenticação admin...');
    
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 checkAuthStatus: Session obtida:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userId: session?.user?.id,
        sessionError 
      });
      
      if (sessionError) {
        console.error('❌ checkAuthStatus: Erro ao obter sessão:', sessionError);
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (!session?.user) {
        console.log('❌ checkAuthStatus: Nenhuma sessão/usuário encontrado');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('🔍 checkAuthStatus: Verificando se usuário é admin na tabela admin_users...');
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id);

      console.log('🔍 checkAuthStatus: Resultado da consulta admin_users:', { 
        adminData, 
        adminError,
        userId: session.user.id,
        hasAdminData: !!adminData && adminData.length > 0 
      });

      if (adminError) {
        console.error('❌ checkAuthStatus: Erro na consulta admin_users:', adminError);
        setIsAuthenticated(false);
        setUser(null);
      } else if (!adminData || adminData.length === 0) {
        console.log('❌ checkAuthStatus: Usuário não encontrado na tabela admin_users');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        console.log('✅ checkAuthStatus: Usuário é admin! Dados:', adminData[0]);
        setIsAuthenticated(true);
        setUser(session.user);
      }
    } catch (error) {
      console.error('❌ checkAuthStatus: Erro inesperado:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN') {
        await checkAuthStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, isLoading, user, checkAuthStatus, logout };
}
