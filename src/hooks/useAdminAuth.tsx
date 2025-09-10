
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Separate function to check admin status with a given session
  const checkAdminStatus = async (session: any) => {
    console.log('🔍 checkAdminStatus: Verificando se usuário é admin...', { userId: session?.user?.id });
    
    try {
      if (!session?.user) {
        console.log('❌ checkAdminStatus: Nenhuma sessão/usuário fornecido');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if user is admin (using the new safe SELECT policy)
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id);

      console.log('🔍 checkAdminStatus: Resultado da consulta admin_users:', { 
        adminData, 
        adminError,
        userId: session.user.id,
        hasAdminData: !!adminData && adminData.length > 0 
      });

      if (adminError) {
        console.error('❌ checkAdminStatus: Erro na consulta admin_users:', adminError);
        setIsAuthenticated(false);
      } else if (!adminData || adminData.length === 0) {
        console.log('❌ checkAdminStatus: Usuário não encontrado na tabela admin_users');
        setIsAuthenticated(false);
      } else {
        console.log('✅ checkAdminStatus: Usuário é admin! Dados:', adminData[0]);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ checkAdminStatus: Erro inesperado:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy function for manual checks (kept for compatibility)
  const checkAuthStatus = async () => {
    console.log('🔍 checkAuthStatus: Verificação manual solicitada...');
    setIsLoading(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ checkAuthStatus: Erro ao obter sessão:', sessionError);
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (session) {
        setUser(session.user);
        await checkAdminStatus(session);
      } else {
        console.log('❌ checkAuthStatus: Nenhuma sessão encontrada');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ checkAuthStatus: Erro inesperado:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 useAdminAuth: Configurando listeners de autenticação...');
    
    // Set up auth state listener FIRST (non-async to prevent deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 useAdminAuth: Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('📤 useAdminAuth: User signed out or no session');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || (event === 'TOKEN_REFRESHED' && session)) {
        console.log('📥 useAdminAuth: User signed in or token refreshed, deferring admin check...');
        setUser(session.user);
        setIsLoading(true);
        
        // Defer admin check to prevent deadlock
        setTimeout(() => {
          checkAdminStatus(session);
        }, 0);
      }
    });

    // THEN check for existing session
    console.log('🔍 useAdminAuth: Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ useAdminAuth: Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      if (session) {
        console.log('✅ useAdminAuth: Found existing session, checking admin status...');
        setUser(session.user);
        setTimeout(() => {
          checkAdminStatus(session);
        }, 0);
      } else {
        console.log('ℹ️ useAdminAuth: No existing session found');
        setIsLoading(false);
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
