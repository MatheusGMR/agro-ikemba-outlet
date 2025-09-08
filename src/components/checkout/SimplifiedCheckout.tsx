import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Smartphone, 
  ArrowLeftRight, 
  Package, 
  Calculator,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutItem {
  id: string;
  name: string;
  volume: number;
  price: number;
  total: number;
}

interface SimplifiedCheckoutProps {
  items: CheckoutItem[];
  onOrderComplete: (orderData: any) => void;
}

const PAYMENT_METHODS = [
  { 
    id: 'boleto', 
    name: 'Boleto Bancário', 
    description: 'Pagamento em até 7 dias corridos',
    icon: FileText,
    color: 'text-blue-600'
  },
  { 
    id: 'pix', 
    name: 'PIX', 
    description: 'Pagamento instantâneo',
    icon: Smartphone,
    color: 'text-green-600'
  },
  { 
    id: 'ted', 
    name: 'TED/Transferência', 
    description: 'Transferência bancária',
    icon: ArrowLeftRight,
    color: 'text-purple-600'
  }
];

const LOGISTICS_OPTIONS = [
  {
    id: 'pickup',
    name: 'Retirada no Local',
    description: 'Retirar produtos em nosso estoque',
    price: 0
  },
  {
    id: 'delivery_quote',
    name: 'Solicitar Cotação de Entrega',
    description: 'Receba orçamento personalizado para entrega',
    price: null // null indicates quote needed
  }
];

export function SimplifiedCheckout({ items, onOrderComplete }: SimplifiedCheckoutProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'logistics' | 'payment' | 'confirmation'>('logistics');
  const [selectedLogistics, setSelectedLogistics] = useState<string>('pickup');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const logisticsCost = selectedLogistics === 'pickup' ? 0 : 0; // Quote-based has no immediate cost
  const total = subtotal + logisticsCost;

  const handleLogisticsNext = () => {
    if (selectedLogistics === 'delivery_quote') {
      // Here we would open a form to collect delivery details for quote
      alert('Funcionalidade de cotação de entrega será implementada em breve');
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            volume: item.volume,
            price: item.price,
            total: item.total
          })),
          total_amount: total,
          payment_method: PAYMENT_METHODS.find(p => p.id === selectedPayment)?.name || 'Não especificado',
          logistics_option: LOGISTICS_OPTIONS.find(l => l.id === selectedLogistics)?.name || 'Retirada',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Get user data for email (tolerant to missing profile)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, phone, company')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.warn('User profile lookup warning (proceeding with auth data):', userError);
      }

      const safeUser = {
        name: userData?.name || user.email?.split('@')[0] || 'Cliente',
        email: userData?.email || user.email || '',
        phone: userData?.phone || '',
        company: userData?.company || ''
      };

      // Send order confirmation
      const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
        body: {
          orderData: {
            order_number: orderData.order_number,
            total_amount: orderData.total_amount,
            payment_method: orderData.payment_method,
            logistics_option: orderData.logistics_option,
            items: orderData.items
          },
          userData: safeUser
        }
      });

      if (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Continue with success even if email fails
      }

      console.log('Order created successfully:', orderData.order_number);
      setCurrentStep('confirmation');
      setShowConfirmation(true);
      onOrderComplete({ orderNumber: orderData.order_number });
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderLogisticsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Logística de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedLogistics} onValueChange={setSelectedLogistics}>
          {LOGISTICS_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={option.id} className="font-medium cursor-pointer">
                  {option.name}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                <div className="mt-2">
                  {option.price === 0 && <Badge variant="secondary">Gratuito</Badge>}
                  {option.price === null && <Badge variant="outline">Sob Cotação</Badge>}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex justify-end">
          <Button onClick={handleLogisticsNext} disabled={!selectedLogistics}>
            Continuar para Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
          {PAYMENT_METHODS.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                <IconComponent className={`w-5 h-5 mt-1 ${method.color}`} />
                <div className="flex-1">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  
                  {method.id === 'boleto' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      ⚠️ Compra efetivada mediante pagamento do boleto
                    </div>
                  )}
                  
                  {(method.id === 'pix' || method.id === 'ted') && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                      ✅ Compra efetivada mediante confirmação do pagamento
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('logistics')}>
            Voltar
          </Button>
          <Button onClick={handlePaymentComplete} disabled={!selectedPayment || isProcessing}>
            {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfirmation = () => (
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Pedido Realizado!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              Seu pedido foi registrado com sucesso
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total do Pedido:</span>
              <span className="font-semibold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Forma de Pagamento:</span>
              <span>{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}</span>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="text-green-800 dark:text-green-200 font-medium mb-2">
              📱 Próximos Passos
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Entraremos em contato via <strong>WhatsApp em alguns minutos</strong> para 
              tratar os detalhes do pagamento e entrega.
            </div>
          </div>
          
          <Button 
            onClick={() => {
              const whatsappUrl = `https://wa.me/5543984064141?text=${encodeURIComponent(
                'Olá! Acabei de fazer um pedido e gostaria de saber mais detalhes.'
              )}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="w-full"
          >
            💬 Falar no WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.volume.toLocaleString('pt-BR')}L × R$ {item.price.toFixed(2)}
                </div>
              </div>
              <div className="font-semibold">
                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total:</span>
            <span className="text-primary">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'logistics' && renderLogisticsStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {renderConfirmation()}
    </div>
  );
}