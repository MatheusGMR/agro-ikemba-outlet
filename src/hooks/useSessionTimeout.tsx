import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

interface SessionTimeoutState {
  isWarningOpen: boolean;
  timeRemaining: number;
  extendSession: () => void;
  closeWarning: () => void;
}

export function useSessionTimeout({
  timeoutMinutes = 120, // 2 hours
  warningMinutes = 5
}: UseSessionTimeoutOptions = {}): SessionTimeoutState {
  const { signOut, user } = useAuth();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startCountdown = useCallback(() => {
    const warningTime = warningMinutes * 60; // Convert to seconds
    setTimeRemaining(warningTime);
    
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          signOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes, signOut]);

  const resetTimeout = useCallback(() => {
    if (!user) return;
    
    clearAllTimeouts();
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);

    // Set warning timeout
    const warningTimeout = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarningOpen(true);
      startCountdown();
    }, warningTimeout);

    // Set logout timeout
    const logoutTimeout = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      signOut();
    }, logoutTimeout);
  }, [user, timeoutMinutes, warningMinutes, clearAllTimeouts, startCountdown, signOut]);

  const extendSession = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  const closeWarning = useCallback(() => {
    setIsWarningOpen(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if enough time has passed since last activity (avoid excessive resets)
      if (now - lastActivityRef.current > 60000) { // 1 minute threshold
        resetTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearAllTimeouts();
    };
  }, [user, resetTimeout, clearAllTimeouts]);

  return {
    isWarningOpen,
    timeRemaining,
    extendSession,
    closeWarning
  };
}