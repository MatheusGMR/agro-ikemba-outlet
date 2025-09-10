import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Mail, Send, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  error?: string;
  details?: string;
  config?: {
    usedFrom: string;
    fallbackUsed: boolean;
  };
  timestamp: string;
}

export default function EmailTestingPanel() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<EmailConfig | null>(null);
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

      setConfig(data.config);
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

          {config && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Configuration Status:</span>
                <Badge variant={config.isValid ? "default" : "destructive"}>
                  {config.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>API Key Status:</Label>
                  <Badge variant={config.hasApiKey ? "default" : "destructive"} className="ml-2">
                    {config.hasApiKey ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div>
                  <Label>Primary Domain:</Label>
                  <span className="ml-2 font-mono text-xs">{config.fromDomain}</span>
                </div>
                <div>
                  <Label>Fallback Domain:</Label>
                  <span className="ml-2 font-mono text-xs">{config.fallbackFrom}</span>
                </div>
                <div>
                  <Label>Last Check:</Label>
                  <span className="ml-2 text-xs">
                    {new Date(config.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {config.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Configuration Issues:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {config.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
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
            <div className="mt-4">
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Status:</strong> {testResult.success ? 'Success' : 'Failed'}
                    </div>
                    {testResult.message && (
                      <div><strong>Message:</strong> {testResult.message}</div>
                    )}
                    {testResult.error && (
                      <div><strong>Error:</strong> {testResult.error}</div>
                    )}
                    {testResult.details && (
                      <div><strong>Details:</strong> {testResult.details}</div>
                    )}
                    {testResult.emailId && (
                      <div><strong>Email ID:</strong> <code className="text-xs">{testResult.emailId}</code></div>
                    )}
                    {testResult.config && (
                      <div className="text-sm">
                        <strong>Delivery Info:</strong> 
                        <br />
                        • From: {testResult.config.usedFrom}
                        {testResult.config.fallbackUsed && ' (fallback used)'}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Sent: {new Date(testResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Email Testing Tips:</strong>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Check both inbox and spam folders for test emails</li>
            <li>Verify domain authentication in Resend dashboard</li>
            <li>Test with different email providers (Gmail, Outlook, etc.)</li>
            <li>Monitor logs for detailed error information</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}