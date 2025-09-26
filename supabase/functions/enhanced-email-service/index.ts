import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailServiceRequest {
  type: 'test' | 'config_check' | 'delivery_status';
  email?: string;
  test_data?: {
    recipient: string;
    subject?: string;
    content?: string;
  };
}

interface EmailConfig {
  apiKey: string;
  fromDomain: string;
  fallbackFrom: string;
  isValid: boolean;
  errors: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== ENHANCED EMAIL SERVICE ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const requestData: EmailServiceRequest = await req.json();
    console.log("Request data:", JSON.stringify(requestData, null, 2));

    // Check email configuration
    const emailConfig = await checkEmailConfiguration();
    console.log("Email config status:", emailConfig);

    if (!emailConfig.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email configuration invalid",
          details: emailConfig.errors,
          config: {
            hasApiKey: !!emailConfig.apiKey,
            fromDomain: emailConfig.fromDomain,
            fallbackFrom: emailConfig.fallbackFrom
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const resend = new Resend(emailConfig.apiKey);

    switch (requestData.type) {
      case 'config_check':
        return await handleConfigCheck(emailConfig);
        
      case 'test':
        return await handleTestEmail(resend, requestData.test_data, emailConfig);
        
      case 'delivery_status':
        return await handleDeliveryStatus(resend, requestData.email);
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid request type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
  } catch (error: any) {
    console.error("=== EMAIL SERVICE ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

async function checkEmailConfiguration(): Promise<EmailConfig> {
  console.log("=== CHECKING EMAIL CONFIGURATION ===");
  
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromDomain = Deno.env.get("RESEND_FROM") || "noreply@agroikemba.com.br";
  const fallbackFrom = "onboarding@resend.dev";
  
  const errors: string[] = [];
  
  if (!apiKey) {
    errors.push("RESEND_API_KEY not configured");
  } else {
    console.log("✅ RESEND_API_KEY found");
    // Mask the key for logging
    console.log("API Key preview:", `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  }
  
  // Validate email format for RESEND_FROM
  if (fromDomain && fromDomain.startsWith('re_') && fromDomain.length > 20) {
    errors.push('RESEND_FROM appears to be an API key - should be an email address like noreply@agroikemba.com.br');
    console.warn('🚨 RESEND_FROM is set to an API key instead of email address');
  } else if (fromDomain && !fromDomain.includes('@')) {
    errors.push('RESEND_FROM must be a valid email address format');
  }

  // Check if using testing domain
  if (fromDomain === 'onboarding@resend.dev') {
    errors.push('Using Resend testing domain - verify your domain at resend.com/domains for production');
  }
  
  console.log("From domain:", fromDomain);
  console.log("Fallback from:", fallbackFrom);
  
  return {
    apiKey: apiKey || "",
    fromDomain,
    fallbackFrom,
    isValid: errors.length === 0,
    errors
  };
}

async function handleConfigCheck(config: EmailConfig): Promise<Response> {
  console.log("=== CONFIG CHECK ===");
  
  return new Response(
    JSON.stringify({
      success: true,
      config: {
        hasApiKey: !!config.apiKey,
        fromDomain: config.fromDomain,
        fallbackFrom: config.fallbackFrom,
        isValid: config.isValid,
        errors: config.errors,
        timestamp: new Date().toISOString()
      }
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    }
  );
}

async function handleTestEmail(
  resend: any, 
  testData: any,
  config: EmailConfig
): Promise<Response> {
  console.log("=== SENDING TEST EMAIL ===");
  
  if (!testData?.recipient) {
    return new Response(
      JSON.stringify({ error: "Recipient email required for test" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Determine the from address based on configuration validation
  let fromAddress = config.fromDomain;
  
  // If fromDomain is invalid (API key), use fallback
  if (config.fromDomain && config.fromDomain.startsWith('re_') && config.fromDomain.length > 20) {
    console.warn('🚨 RESEND_FROM is an API key, using fallback address');
    fromAddress = config.fallbackFrom;
  }

  const emailData = {
    from: fromAddress,
    to: [testData.recipient],
    subject: testData.subject || "🧪 Test Email - AgroIkemba Enhanced Service",
    html: testData.content || generateTestEmailContent()
  };

  console.log("Test email data:", JSON.stringify(emailData, null, 2));

  try {
    // Try with determined domain first
    console.log("Attempting to send with domain:", fromAddress);
    let result = await resend.emails.send(emailData);
    
    if (result.error && fromAddress !== config.fallbackFrom) {
      console.warn("Primary domain failed:", result.error);
      console.log("Trying fallback domain...");
      
      // Try with fallback domain
      const fallbackEmailData = {
        ...emailData,
        from: config.fallbackFrom
      };
      
      const fallbackResult = await resend.emails.send(fallbackEmailData);
      
      if (fallbackResult.error) {
        console.error('Test email failed with fallback:', fallbackResult.error);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Test email failed on both primary and fallback domains',
            error: fallbackResult.error,
            primaryError: result.error,
            suggestion: 'Please verify your domain at resend.com/domains and update RESEND_FROM to a valid email address'
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test email sent successfully using fallback domain',
          data: fallbackResult.data,
          warning: 'Primary domain failed, used fallback domain (onboarding@resend.dev)',
          primaryError: result.error,
          recommendation: 'Verify your domain and update RESEND_FROM for production use',
          usedDomain: config.fallbackFrom,
          isProduction: false
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email send result:", result);

    if (result.error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Test email failed',
          error: result.error,
          suggestion: 'Check your domain verification status at resend.com/domains'
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test email sent successfully",
        emailId: result.data?.id,
        data: result.data,
        usedDomain: fromAddress,
        isProduction: fromAddress !== config.fallbackFrom,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Test email exception:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Test email failed with exception',
        error: error.message,
        suggestion: 'Check your RESEND_API_KEY and domain configuration'
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

async function handleDeliveryStatus(resend: any, emailId?: string): Promise<Response> {
  console.log("=== CHECKING DELIVERY STATUS ===");
  
  if (!emailId) {
    return new Response(
      JSON.stringify({ error: "Email ID required for status check" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Note: Resend API might not have this endpoint, this is a placeholder
    console.log("Checking status for email ID:", emailId);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Delivery status check not implemented in Resend API",
        emailId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to check delivery status",
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
}

function generateTestEmailContent(): string {
  const now = new Date();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🧪 Enhanced Email Service Test</h1>
        <p style="color: #f0fdf4; margin: 10px 0 0 0;">AgroIkemba Email System</p>
      </div>
      
      <div style="padding: 30px 0; text-align: center;">
        <h2 style="color: #1a202c;">✅ System Working Perfectly!</h2>
        <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
          This test email confirms that the enhanced email service is functioning correctly.
        </p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 0; font-weight: bold; color: #22c55e;">Test Details:</p>
          <p style="margin: 5px 0 0 0; color: #2d3748;">
            📅 Sent: ${now.toLocaleString('pt-BR')}<br>
            🔧 Service: Enhanced Email Service v1.0<br>
            🎯 Status: All systems operational
          </p>
        </div>
        
        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #f56565;">
          <p style="margin: 0; color: #c53030; font-size: 14px;">
            <strong>Note:</strong> This is an automated test email. If you received this unexpectedly, please contact support.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
        AgroIkemba Enhanced Email Service - ${now.getFullYear()}
      </div>
    </div>
  `;
}

serve(handler);