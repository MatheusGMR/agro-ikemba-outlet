import { useState, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export interface HoneypotData {
  businessEmail?: string; // Hidden field - humans won't see it
  companyWebsite?: string; // Hidden field - humans won't see it
  marketingConsent?: boolean; // Hidden field - humans won't see it
}

export interface BotProtectionResult {
  isBot: boolean;
  reason?: string;
  recaptchaScore?: number;
}

export const useBotProtection = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [honeypotData, setHoneypotData] = useState<HoneypotData>({});
  const [formStartTime] = useState(Date.now());

  const updateHoneypot = useCallback((field: keyof HoneypotData, value: any) => {
    setHoneypotData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Test function to verify reCAPTCHA is working
  const testReCaptcha = useCallback(async (): Promise<{ working: boolean; error?: string; score?: number }> => {
    if (!executeRecaptcha) {
      return { working: false, error: 'reCAPTCHA not loaded' };
    }

    try {
      console.log('🧪 Testing reCAPTCHA functionality...');
      const token = await executeRecaptcha('test');
      
      if (!token) {
        return { working: false, error: 'Failed to generate token' };
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      const { data: result, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });

      if (error) {
        return { working: false, error: `Verification failed: ${error.message}` };
      }

      if (!result || typeof result.score !== 'number') {
        return { working: false, error: 'Invalid response from server' };
      }

      console.log('🧪 reCAPTCHA test successful. Score:', result.score);
      return { working: true, score: result.score };
    } catch (error) {
      console.error('🧪 reCAPTCHA test failed:', error);
      return { working: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [executeRecaptcha]);

  const validateBotProtection = useCallback(async (): Promise<BotProtectionResult> => {
    console.log('🛡️ Starting bot protection validation...');
    
    // 1. Check honeypot fields - if any are filled, it's likely a bot
    if (honeypotData.businessEmail || honeypotData.companyWebsite || honeypotData.marketingConsent) {
      console.log('🛡️ Bot detected: Honeypot field filled', honeypotData);
      return { isBot: true, reason: 'honeypot' };
    }

    // 2. Check form completion time - too fast indicates bot
    const timeSpent = Date.now() - formStartTime;
    if (timeSpent < 5000) { // Less than 5 seconds is definitely too fast
      console.log('🛡️ Bot detected: Form completed too quickly', { timeSpent });
      return { isBot: true, reason: 'too_fast' };
    }

    // 3. Execute reCAPTCHA v3
    if (!executeRecaptcha) {
      console.warn('⚠️ reCAPTCHA not available - this is a security risk!');
      // In production, you might want to block submission if reCAPTCHA is not available
      return { isBot: false, reason: 'recaptcha_unavailable' };
    }

    try {
      console.log('🛡️ Executing reCAPTCHA...');
      const token = await executeRecaptcha('registration');
      
      if (!token) {
        console.error('🛡️ Failed to get reCAPTCHA token');
        return { isBot: true, reason: 'recaptcha_token_failed' };
      }

      console.log('🛡️ reCAPTCHA token obtained, verifying with server...');
      
      // Verify token using Supabase Edge Function
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      const { data: result, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });

      if (error) {
        console.error('🛡️ reCAPTCHA verification failed:', error);
        // Be more strict - if verification fails, consider it suspicious
        return { isBot: true, reason: 'recaptcha_verification_failed' };
      }

      if (!result || typeof result.score !== 'number') {
        console.error('🛡️ Invalid reCAPTCHA response:', result);
        return { isBot: true, reason: 'recaptcha_invalid_response' };
      }

      const score = result.score;
      console.log('🛡️ reCAPTCHA verification successful. Score:', score);

      // Be more strict with scoring - scores below 0.7 are suspicious
      if (score < 0.3) {
        console.log('🛡️ Bot detected: Very low reCAPTCHA score');
        return { isBot: true, reason: 'recaptcha_very_low_score', recaptchaScore: score };
      }
      
      if (score < 0.5) {
        console.log('🛡️ Bot detected: Low reCAPTCHA score');
        return { isBot: true, reason: 'recaptcha_low_score', recaptchaScore: score };
      }

      console.log('🛡️ Bot protection passed - user appears to be human');
      return { isBot: false, recaptchaScore: score };
    } catch (error) {
      console.error('🛡️ reCAPTCHA validation error:', error);
      // In production, you might want to be more strict here
      return { isBot: true, reason: 'recaptcha_error' };
    }
  }, [executeRecaptcha, honeypotData, formStartTime]);

  return {
    honeypotData,
    updateHoneypot,
    validateBotProtection,
    testReCaptcha,
    formStartTime,
    isReCaptchaReady: !!executeRecaptcha
  };
};