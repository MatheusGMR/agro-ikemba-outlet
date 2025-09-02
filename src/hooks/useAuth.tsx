import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { RepresentativeService } from '@/services/representativeService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.debug('[Auth] onAuthStateChange', { event, hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        // Invalidate representative cache on any auth change
        // Invalidate representative-related caches
        queryClient.invalidateQueries({ queryKey: ['representative'] });
        queryClient.invalidateQueries({ queryKey: ['representative', 'current'] });
        
        if (session?.user) {
          // Check if user is a representative (defer Supabase calls)
          setTimeout(() => {
            RepresentativeService.getCurrentRepresentative()
              .then((rep) => setIsRepresentative(!!rep))
              .catch(() => setIsRepresentative(false));
          }, 0);
        } else {
          setIsRepresentative(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session (do not set loading to false here; wait for onAuthStateChange INITIAL_SESSION)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsRepresentative(false);
      queryClient.removeQueries({ queryKey: ['representative'] });
      toast.success('Logout realizado com sucesso!');
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
    // Graceful fallback to avoid crashes if a component renders outside AuthProvider
    console.warn('[Auth] useAuth called without AuthProvider. Returning fallback context.');
    return {
      user: null,
      session: null,
      isLoading: true,
      signIn: async () => ({ error: new Error('AuthProvider not mounted') }),
      signOut: async () => {},
      isRepresentative: false,
    } as AuthContextType;
  }
  return context;
}