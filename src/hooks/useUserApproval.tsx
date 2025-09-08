import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserApprovalStatus {
  isApproved: boolean;
  isPending: boolean;
  isLoading: boolean;
  userRecord: any | null;
}

export function useUserApproval(): UserApprovalStatus {
  const { user, session } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRecord, setUserRecord] = useState<any | null>(null);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user?.email || !user?.id) {
        setIsApproved(false);
        setIsPending(false);
        setUserRecord(null);
        setIsLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('User approval check timed out');
        setIsApproved(false);
        setIsPending(true);
        setUserRecord(null);
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) {
          console.error('Error checking user approval:', error);
          setIsApproved(false);
          setIsPending(false);
          setUserRecord(null);
        } else if (userData) {
          setUserRecord(userData);
          setIsApproved(userData.status === 'approved');
          setIsPending(userData.status === 'pending');
        } else {
          // User exists in auth but not in users table - consider pending
          setUserRecord(null);
          setIsApproved(false);
          setIsPending(true);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error in approval check:', error);
        setIsApproved(false);
        setIsPending(false);
        setUserRecord(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkApprovalStatus();
  }, [user?.email, user?.id, session]);

  return {
    isApproved,
    isPending,
    isLoading,
    userRecord
  };
}