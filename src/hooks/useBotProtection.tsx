import { useState, useCallback } from 'react';

export interface HoneypotData {
  businessEmail?: string; // Hidden field - humans won't see it
  companyWebsite?: string; // Hidden field - humans won't see it
  marketingConsent?: boolean; // Hidden field - humans won't see it
}

export interface BotProtectionResult {
  isBot: boolean;
  reason?: string;
}

export const useBotProtection = () => {
  const [honeypotData, setHoneypotData] = useState<HoneypotData>({});
  const [formStartTime] = useState(Date.now());

  const updateHoneypot = useCallback((field: keyof HoneypotData, value: any) => {
    setHoneypotData(prev => ({ ...prev, [field]: value }));
  }, []);

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

    console.log('🛡️ Bot protection passed - user appears to be human');
    return { isBot: false };
  }, [honeypotData, formStartTime]);

  return {
    honeypotData,
    updateHoneypot,
    validateBotProtection,
    formStartTime,
  };
};