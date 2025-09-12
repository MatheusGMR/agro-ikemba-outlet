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
    let cancelled = false;
    const email = user?.email?.trim() || '';
    const uid = user?.id || '';

    console.log('🔍 UserApproval: Starting check for user:', email, 'User ID:', uid);

    if (!email || !uid) {
      console.log('🚫 UserApproval: No user email or ID, setting as not approved');
      setIsApproved(false);
      setIsPending(false);
      setUserRecord(null);
      setIsLoading(false);
      return;
    }

    const CACHE_TTL_MS = 2 * 60 * 1000; // Reduced to 2 minutes for faster updates
    const cacheKey = `approval:${uid}:${email.toLowerCase()}`;

    const readCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.ts || (Date.now() - parsed.ts) > CACHE_TTL_MS) return null;
        return parsed;
      } catch (e) {
        console.warn('⚠️ UserApproval: Failed to read cache', e);
        return null;
      }
    };

    const writeCache = (payload: any) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ...payload, ts: Date.now() }));
      } catch (e) {
        console.warn('⚠️ UserApproval: Failed to write cache', e);
      }
    };

    const clearCache = () => {
      try {
        localStorage.removeItem(cacheKey);
        console.log('🧹 UserApproval: Cache cleared for', email);
      } catch (e) {
        console.warn('⚠️ UserApproval: Failed to clear cache', e);
      }
    };

    const cached = readCache();
    if (cached && !cached.isPending) {
      // Only use cache for approved/not approved status, always refresh if pending
      console.log('💾 UserApproval: Using cached status', cached);
      setIsApproved(!!cached.isApproved);
      setIsPending(!!cached.isPending);
      setUserRecord(cached.userRecord ?? null);
      setIsLoading(false);
    } else {
      // If pending or no cache, always check fresh
      setIsLoading(true);
    }

    const checkApprovalStatus = async () => {
      try {
        console.log('📡 UserApproval: Querying database (case-insensitive) for user:', email);
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', email)
          .maybeSingle();

        if (cancelled) return;

        console.log('📊 UserApproval: Database query result:', { userData, error });

        if (error) {
          console.error('❌ UserApproval: Database error:', error);
          // Clear cache on error and reset to safe state
          clearCache();
          setIsApproved(false);
          setIsPending(false);
          setUserRecord(null);
          setIsLoading(false);
          return;
        }

        if (userData) {
          console.log('✅ UserApproval: User found with status:', userData.status);
          setUserRecord(userData);
          const approved = userData.status === 'approved';
          const pending = userData.status === 'pending';
          setIsApproved(approved);
          setIsPending(pending);
          writeCache({ isApproved: approved, isPending: pending, userRecord: userData });
          console.log('🎯 UserApproval: Final state - Approved:', approved, 'Pending:', pending);
        } else {
          // User exists in auth but not in users table - allow browsing (not pending by default)
          console.log('⚠️ UserApproval: User exists in auth but not in users table');
          setUserRecord(null);
          setIsApproved(false);
          setIsPending(false);
          writeCache({ isApproved: false, isPending: false, userRecord: null });
        }
      } catch (error) {
        console.error('💥 UserApproval: Exception in approval check:', error);
        // Do not set pending on exception
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          console.log('🏁 UserApproval: Check completed, loading set to false');
        }
      }
    };

    checkApprovalStatus();
    return () => { cancelled = true; };
  }, [user?.email, user?.id, session]);

  return {
    isApproved,
    isPending,
    isLoading,
    userRecord
  };
}