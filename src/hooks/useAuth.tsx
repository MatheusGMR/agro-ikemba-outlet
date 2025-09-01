import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { RepresentativeService } from '@/services/representativeService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isRepresentative: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepresentative, setIsRepresentative] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is a representative
          try {
            const representative = await RepresentativeService.getCurrentRepresentative();
            console.log('Representative found:', !!representative);
            setIsRepresentative(!!representative);
          } catch (error) {
            console.error('Error checking representative status:', error);
            setIsRepresentative(false);
          }
        } else {
          setIsRepresentative(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const representative = await RepresentativeService.getCurrentRepresentative();
          console.log('Initial representative check:', !!representative);
          setIsRepresentative(!!representative);
        } catch (error) {
          console.error('Error checking initial representative status:', error);
          setIsRepresentative(false);
        }
      } else {
        setIsRepresentative(false);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      toast.success('Login realizado com sucesso!');
    }

    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erro ao fazer logout. Tentando novamente...');
        // Force cleanup even if logout fails
      }
      
      // Clear all states
      setUser(null);
      setSession(null);
      setIsRepresentative(false);
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      toast.success('Logout realizado com sucesso!');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.error('Erro inesperado durante logout');
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signIn,
      signOut,
      isRepresentative
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}