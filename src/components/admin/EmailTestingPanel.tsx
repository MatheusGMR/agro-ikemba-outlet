import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Mail, Send, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailConfig {
  hasApiKey: boolean;
  fromDomain: string;
  fallbackFrom: string;
  isValid: boolean;
  errors: string[];
  timestamp: string;
}

interface TestResult {
  success: boolean;
  message?: string;
  emailId?: string;
  error?: any;
  details?: string;
  data?: any;
  warning?: string;
  recommendation?: string;
  suggestion?: string;
  primaryError?: any;
  usedDomain?: string;
  isProduction?: boolean;
  timestamp: string;
}

export default function EmailTestingPanel() {
  const [loading, setLoading] = useState(false);
  const [configuration, setConfiguration] = useState<EmailConfig | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');

  const checkConfiguration = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-email-service', {
        body: { type: 'config_check' }
      });

      if (error) throw error;

      setConfiguration(data.config);
      toast.success('Email configuration checked successfully');
    } catch (error: any) {
      console.error('Config check failed:', error);
      toast.error(`Configuration check failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setLoading(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-email-service', {
        body: {
          type: 'test',
          test_data: {
            recipient: testEmail,
            subject: customSubject || undefined,
            content: customContent || undefined
          }
        }
      });

      if (error) throw error;

      setTestResult(data);
      
      if (data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error(`Test email failed: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Test email failed:', error);
      const errorResult: TestResult = {
        success: false,
        error: 'Network or service error',
        details: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResult(errorResult);
      toast.error(`Test email failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendToMatheus = () => {
    setTestEmail('matheus.roldan@metasix.com.br');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email System Configuration
          </CardTitle>
          <CardDescription>
            Check and verify email service configuration and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={checkConfiguration} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Checking...' : 'Check Email Configuration'}
          </Button>

          {configuration && (
            <Alert className={configuration.isValid ? "border-green-500" : "border-red-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {configuration.isValid ? "✅ Configuration Valid" : "❌ Configuration Issues Found"}
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <p><strong>API Key:</strong> {configuration.hasApiKey ? 'Configured ✅' : 'Missing ❌'}</p>
                  <p><strong>From Domain:</strong> {configuration.fromDomain || 'Not set'}</p>
                  <p><strong>Fallback Domain:</strong> {configuration.fallbackFrom}</p>
                  
                  {/* Domain Status Indicators */}
                  {configuration.fromDomain && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="font-medium mb-2">Domain Status:</p>
                      {configuration.fromDomain === 'onboarding@resend.dev' ? (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Testing Mode - Limited to verified email addresses</span>
                        </div>
                      ) : configuration.fromDomain.includes('@agroikemba.com.br') ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Custom Domain - Requires verification at resend.com/domains</span>
                        </div>
                      ) : configuration.fromDomain.startsWith('re_') ? (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>ERROR: API Key detected instead of email address</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Valid Email Format Detected</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {configuration.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <p className="font-medium text-red-800 mb-2">Issues Found:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {configuration.errors.map((error, index) => (
                          <li key={index} className="text-red-600 text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!configuration.isValid && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="font-medium text-blue-800 mb-2">Next Steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                        <li>Go to <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a></li>
                        <li>Add and verify your domain (agroikemba.com.br)</li>
                        <li>Update RESEND_FROM secret to: noreply@agroikemba.com.br</li>
                        <li>Test email sending with the updated configuration</li>
                      </ol>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Testing
          </CardTitle>
          <CardDescription>
            Send test emails to verify delivery and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="test-email"
                type="email"
                placeholder="Enter email address to test"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={sendToMatheus}
                disabled={loading}
              >
                Use Matheus
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-subject">Custom Subject (Optional)</Label>
            <Input
              id="custom-subject"
              placeholder="Leave empty for default test subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-content">Custom Content (Optional)</Label>
            <Textarea
              id="custom-content"
              placeholder="Leave empty for default test content"
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !testEmail}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>

          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {testResult.success ? "✅ Email Sent Successfully" : "❌ Email Send Failed"}
              </AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-3">
                  <p>{testResult.message}</p>
                  
                  {testResult.success && testResult.data && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="font-medium text-green-800 mb-1">Success Details:</p>
                      <p className="text-sm text-green-700">Email ID: {testResult.data.id || testResult.emailId}</p>
                      {testResult.usedDomain && (
                        <p className="text-sm text-green-700">Sent from: {testResult.usedDomain}</p>
                      )}
                      {testResult.isProduction === false && (
                        <div className="mt-2 text-amber-700 text-sm">
                          ⚠️ Sent using testing domain - verify your domain for production use
                        </div>
                      )}
                    </div>
                  )}
                  
                  {testResult.warning && (
                    <div className="p-3 bg-amber-50 rounded-md">
                      <p className="font-medium text-amber-800 mb-1">Warning:</p>
                      <p className="text-sm text-amber-700">{testResult.warning}</p>
                      {testResult.recommendation && (
                        <p className="text-sm text-amber-600 mt-1">{testResult.recommendation}</p>
                      )}
                    </div>
                  )}
                  
                  {testResult.error && (
                    <div className="p-3 bg-red-50 rounded-md">
                      <p className="font-medium text-red-800 mb-1">Error Details:</p>
                      <p className="text-sm text-red-600">{typeof testResult.error === 'string' ? testResult.error : JSON.stringify(testResult.error)}</p>
                      {testResult.suggestion && (
                        <p className="text-sm text-red-600 mt-2">{testResult.suggestion}</p>
                      )}
                    </div>
                  )}
                  
                  {testResult.primaryError && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium text-gray-800 mb-1">Primary Domain Error:</p>
                      <p className="text-sm text-gray-600">{JSON.stringify(testResult.primaryError)}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Sent: {new Date(testResult.timestamp).toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email Testing Tips:</strong>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Check both inbox and spam folders for test emails</li>
              <li>Verify domain authentication in Resend dashboard at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a></li>
              <li>Test with different email providers (Gmail, Outlook, etc.)</li>
              <li>Monitor logs for detailed error information</li>
              <li>Update RESEND_FROM secret if using API key format instead of email</li>
            </ul>
          </AlertDescription>
        </Alert>
    </div>
  );
}