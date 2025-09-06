import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecaptchaVerifyRequest {
  token: string;
}

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { token }: RecaptchaVerifyRequest = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing reCAPTCHA token' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get reCAPTCHA secret from environment
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'reCAPTCHA not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify token with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${token}`,
    });

    const verifyData: RecaptchaResponse = await verifyResponse.json();

    console.log('reCAPTCHA verification result:', {
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      hostname: verifyData.hostname,
      errors: verifyData['error-codes']
    });

    if (!verifyData.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'reCAPTCHA verification failed',
        errorCodes: verifyData['error-codes']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the score for client-side evaluation
    return new Response(JSON.stringify({
      success: true,
      score: verifyData.score,
      action: verifyData.action,
      timestamp: verifyData.challenge_ts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});