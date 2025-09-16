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

  const validateBotProtection = useCallback(async (): Promise<BotProtectionResult> => {
    // 1. Check honeypot fields - if any are filled, it's likely a bot
    if (honeypotData.businessEmail || honeypotData.companyWebsite || honeypotData.marketingConsent) {
      console.log('🛡️ Bot detected: Honeypot field filled', honeypotData);
      return { isBot: true, reason: 'honeypot' };
    }

    // 2. Check form completion time - too fast indicates bot
    const timeSpent = Date.now() - formStartTime;
    if (timeSpent < 10000) { // Less than 10 seconds
      console.log('🛡️ Bot detected: Form completed too quickly', { timeSpent });
      return { isBot: true, reason: 'too_fast' };
    }

    // 3. Execute reCAPTCHA v3
    if (!executeRecaptcha) {
      console.warn('⚠️ reCAPTCHA not available, skipping check');
      return { isBot: false, reason: 'recaptcha_unavailable' };
    }

    try {
      const token = await executeRecaptcha('registration');
      
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
        console.warn('⚠️ reCAPTCHA verification failed:', error);
        return { isBot: false, reason: 'recaptcha_error' };
      }

      const score = result?.score || 0;
      console.log('🛡️ reCAPTCHA score:', score);

      // Score below 0.5 indicates likely bot
      if (score < 0.5) {
        return { isBot: true, reason: 'recaptcha_low_score', recaptchaScore: score };
      }

      return { isBot: false, recaptchaScore: score };
    } catch (error) {
      console.warn('⚠️ reCAPTCHA error:', error);
      // Don't block registration on reCAPTCHA errors
      return { isBot: false, reason: 'recaptcha_error' };
    }
  }, [executeRecaptcha, honeypotData, formStartTime]);

  return {
    honeypotData,
    updateHoneypot,
    validateBotProtection,
    formStartTime
  };
};