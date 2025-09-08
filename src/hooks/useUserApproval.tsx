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
      console.log('🔍 UserApproval: Starting check for user:', user?.email, 'User ID:', user?.id);
      
      if (!user?.email || !user?.id) {
        console.log('🚫 UserApproval: No user email or ID, setting as not approved');
        setIsApproved(false);
        setIsPending(false);
        setUserRecord(null);
        setIsLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏰ UserApproval: Check timed out for user:', user.email);
        setIsApproved(false);
        setIsPending(true);
        setUserRecord(null);
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        console.log('📡 UserApproval: Querying database for user:', user.email);
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        clearTimeout(timeoutId);
        
        console.log('📊 UserApproval: Database query result:', { userData, error });

        if (error) {
          console.error('❌ UserApproval: Database error:', error);
          setIsApproved(false);
          setIsPending(false);
          setUserRecord(null);
        } else if (userData) {
          console.log('✅ UserApproval: User found with status:', userData.status);
          setUserRecord(userData);
          const approved = userData.status === 'approved';
          const pending = userData.status === 'pending';
          setIsApproved(approved);
          setIsPending(pending);
          console.log('🎯 UserApproval: Final state - Approved:', approved, 'Pending:', pending);
        } else {
          // User exists in auth but not in users table - consider pending
          console.log('⚠️ UserApproval: User exists in auth but not in users table');
          setUserRecord(null);
          setIsApproved(false);
          setIsPending(true);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('💥 UserApproval: Exception in approval check:', error);
        setIsApproved(false);
        setIsPending(false);
        setUserRecord(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 UserApproval: Check completed, loading set to false');
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