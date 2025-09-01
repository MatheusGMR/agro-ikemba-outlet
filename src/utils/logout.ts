import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Centralized logout utility that handles all authentication types
 * and ensures complete cleanup of sessions and localStorage
 */
export const hardLogout = async (): Promise<void> => {
  console.info('🔄 Starting hardLogout process...');
  
  try {
    // 1. Sign out from Supabase (this handles the main auth)
    console.info('📤 Signing out from Supabase...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('⚠️ Supabase signOut error:', error);
    }
    
    // 2. Clear all authentication-related localStorage keys
    console.info('🧹 Clearing localStorage...');
    const keysToRemove = [
      'user',
      'adminSession', 
      // Supabase keys (they start with 'sb-')
      ...Object.keys(localStorage).filter(key => key.startsWith('sb-'))
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.info(`🗑️ Removed: ${key}`);
    });
    
    // 3. Also clear sessionStorage for completeness
    const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
      key.startsWith('sb-') || key === 'user' || key === 'adminSession'
    );
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.info(`🗑️ Removed from session: ${key}`);
    });
    
    console.info('✅ Logout cleanup completed');
    toast.success('Logout realizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    toast.error('Erro durante logout, mas você foi desconectado');
  } finally {
    // 4. Force navigation to home - use replace to prevent back button issues
    console.info('🏠 Redirecting to home...');
    window.location.replace('/');
  }
};