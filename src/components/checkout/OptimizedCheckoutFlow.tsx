// Removed PDFGenerator import - now using Edge Functions
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Package, 
  FileText, 
  Smartphone, 
  ArrowLeftRight, 
  CheckCircle,
  Download,
  AlertTriangle,
  Eye,
  TrendingUp,
  Edit3,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import { BANK_DETAILS } from '@/constants/bankDetails';

interface OptimizedCheckoutFlowProps {
  cartItems: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    manufacturer: string;
  }>;
  onOrderComplete?: (orderData: any) => void;
}

const PAYMENT_METHODS = [
  { 
    id: 'boleto', 
    name: 'Boleto Bancário', 
    description: 'Pagamento em até 7 dias corridos',
    icon: FileText,
    warning: 'Compra efetivada mediante pagamento do boleto'
  },
  { 
    id: 'pix', 
    name: 'PIX', 
    description: 'Pagamento instantâneo',
    icon: Smartphone,
    warning: 'Compra efetivada mediante confirmação do pagamento'
  },
  { 
    id: 'ted', 
    name: 'TED/Transferência', 
    description: 'Transferência bancária',
    icon: ArrowLeftRight,
    warning: 'Compra efetivada mediante confirmação do pagamento'
  }
];

const LOGISTICS_OPTIONS = [
  {
    id: 'pickup',
    name: 'Retirada no Local',
    description: 'Retire seus produtos em nosso estoque - ÚNICA OPÇÃO DISPONÍVEL',
    price: 0,
    isOnlyOption: true
  }
];

const ADDITIONAL_SERVICES = [
  {
    id: 'delivery_quote',
    name: 'Solicitar Cotação com Transportadoras Parceiras',
    description: 'Ajudamos você a conseguir orçamentos de entrega com nossos parceiros (resposta em até 90 minutos)',
    requiresInfo: true,
    isService: true
  }
];

export function OptimizedCheckoutFlow({ cartItems, onOrderComplete }: OptimizedCheckoutFlowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackCheckoutStep, trackConversion } = useCheckoutAnalytics();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, { volume: number; price: number; savings?: number }>>({});
  const [selectedLogistics, setSelectedLogistics] = useState<string>('pickup');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [deliveryQuoteRequested, setDeliveryQuoteRequested] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [boletoStatus, setBoletoStatus] = useState<'idle' | 'generating' | 'ready' | 'failed'>('idle');
  const [boletoData, setBoletoData] = useState<{url?: string, line?: string, barcode?: string} | null>(null);

  // Initialize with cart data
  useEffect(() => {
    // Initialize selected volumes with current cart data
    const initialVolumes = cartItems.reduce((acc, item) => {
      acc[item.id] = { 
        volume: item.quantity, 
        price: item.price,
        savings: 0 // Will be calculated based on optimizations
      };
      return acc;
    }, {} as Record<string, { volume: number; price: number; savings?: number }>);
    setSelectedVolumes(initialVolumes);
  }, [cartItems]);

  // Track step entries
  useEffect(() => {
    const stepNames = ['logistics', 'review', 'payment'];
    const analyticsStep = stepNames[currentStep - 1] || 'logistics';
    trackCheckoutStep(analyticsStep as any, 'enter_step');
  }, [currentStep, trackCheckoutStep]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
    return sum + (volumeData.volume * volumeData.price);
  }, 0);

  const total = subtotal; // No additional fees in optimized flow

  const handleVolumeOptimization = (itemId: string, volume: number, price: number, savings: number = 0) => {
    setSelectedVolumes(prev => ({
      ...prev,
      [itemId]: { volume, price, savings }
    }));
  };

  const getTotalSavings = () => {
    return Object.values(selectedVolumes).reduce((total, item) => total + (item.savings || 0), 0);
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const validateLogistics = () => {
    if (deliveryQuoteRequested && !deliveryInfo.trim()) {
      toast({
        title: "Informações necessárias",
        description: "Por favor, informe os detalhes para cotação de entrega.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateReview = () => {
    // All items must have valid volumes and prices
    return Object.keys(selectedVolumes).length === cartItems.length;
  };

  const validatePayment = () => {
    if (!selectedPayment) {
      // Only show the toast if we're actually on the payment step (step 3)
      if (currentStep === 3) {
        toast({
          title: "Forma de pagamento necessária",
          description: "Por favor, selecione uma forma de pagamento.",
          variant: "destructive"
        });
      }
      return false;
    }
    return true;
  };

  // Utility function to wait with jitter
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Utility function for processing steps
  const updateProcessingStep = (step: string) => {
    setProcessingStep(step);
    console.log(`📋 Processing step: ${step}`);
  };

  // Removed fake document generation - now handled by Edge Functions

  const handlePaymentComplete = async () => {
    console.log('Processing order with payment method:', selectedPayment);
    setIsProcessing(true);
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      updateProcessingStep('Salvando pedido...');

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: cartItems.map(item => {
            const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
            return {
              id: item.id,
              name: item.name,
              sku: item.sku,
              quantity: volumeData.volume,
              price: volumeData.price,
              total: volumeData.volume * volumeData.price
            };
          }),
          total_amount: total,
          payment_method: PAYMENT_METHODS.find(p => p.id === selectedPayment)?.name || 'Não especificado',
          logistics_option: selectedLogistics || 'pickup',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      updateProcessingStep('Processando confirmação...');

      // Use auth data directly to avoid extra DB query
      const safeUser = {
        name: user.email?.split('@')[0] || 'Cliente',
        email: user.email || '',
        phone: '',
        company: ''
      };

      // Send order confirmation (non-blocking - handled by Edge Function background tasks)
      supabase.functions.invoke('send-order-confirmation', {
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
      }).catch(error => {
        console.error('Error sending confirmation emails (non-blocking):', error);
      });

      console.log('Order created successfully:', orderData.order_number);
      setOrderData({ ...orderData, items: orderData.items });
      setShowConfirmation(true);
      trackConversion('purchase', total);
      onOrderComplete?.({ orderNumber: orderData.order_number });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Simplified volume editor for review step
  const renderVolumeEditor = (item: any) => {
    const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price, savings: 0 };
    const maxVolume = 50000; // Mock max available
    const basePrice = item.price;
    const minVolume = Math.max(1000, item.quantity);
    
    // Simple price calculation (linear interpolation for demo)
    const calculatePrice = (volume: number) => {
      const ratio = Math.min(volume / 10000, 1); // Max discount at 10,000L
      const discount = ratio * 0.15; // Up to 15% discount
      return basePrice * (1 - discount);
    };

    const handleVolumeChange = (newVolume: number[]) => {
      const volume = newVolume[0];
      const newPrice = calculatePrice(volume);
      const savings = (basePrice - newPrice) * volume;
      handleVolumeOptimization(item.id, volume, newPrice, savings);
    };

    return (
      <Card key={item.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-sm text-muted-foreground">{item.manufacturer}</p>
            </div>
            <Badge variant={volumeData.savings && volumeData.savings > 0 ? "default" : "secondary"}>
              {volumeData.savings && volumeData.savings > 0 ? 
                `Economia: R$ ${volumeData.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                'Sem otimização'
              }
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Volume: {volumeData.volume.toLocaleString('pt-BR')}L</Label>
              <Slider
                value={[volumeData.volume]}
                onValueChange={handleVolumeChange}
                min={minVolume}
                max={maxVolume}
                step={100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{minVolume.toLocaleString('pt-BR')}L</span>
                <span>{maxVolume.toLocaleString('pt-BR')}L</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">Preço por litro:</span>
                <div className="font-semibold">
                  R$ {volumeData.price.toFixed(2)}
                  {volumeData.savings && volumeData.savings > 0 && (
                    <span className="text-xs text-green-600 ml-2">
                      (antes: R$ {basePrice.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Total:</span>
                <div className="font-semibold">
                  R$ {(volumeData.volume * volumeData.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLogisticsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Logística de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main logistics option - Pickup only */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary">
                Opção de Entrega
              </Badge>
            </div>
            
            {LOGISTICS_OPTIONS.map((option) => (
              <div key={option.id} className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary rounded-full mt-1 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{option.name}</div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    <Badge variant="secondary" className="mt-2">Gratuito</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Additional service - Delivery quote */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Serviço Adicional (Opcional)</Badge>
            </div>
            
            {ADDITIONAL_SERVICES.map((service) => (
              <div key={service.id} className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    id={service.id}
                    checked={deliveryQuoteRequested}
                    onChange={(e) => setDeliveryQuoteRequested(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="font-medium cursor-pointer">
                      {service.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Importante:</strong> Este serviço não substitui a retirada no local.
                    </div>
                  </div>
                </div>
                
                {deliveryQuoteRequested && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="delivery-info" className="text-sm">
                      Informações para cotação (endereço, volume, etc.)
                    </Label>
                    <Textarea
                      id="delivery-info"
                      placeholder="Digite o endereço de entrega, volumes totais e outras informações relevantes..."
                      value={deliveryInfo}
                      onChange={(e) => setDeliveryInfo(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewStep = () => {
    const totalSavings = getTotalSavings();
    const originalTotal = getOriginalTotal();
    const savingsPercentage = originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Savings Summary Card */}
        {totalSavings > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Parabéns! Você está economizando</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-2xl font-bold text-green-600">
                      R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {savingsPercentage.toFixed(1)}% de desconto
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products with Inline Editing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Revisão e Otimização dos Produtos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajuste os volumes abaixo para otimizar ainda mais seus preços
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => renderVolumeEditor(item))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {totalSavings > 0 && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal original:</span>
                    <span className="line-through">R$ {originalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Economia conquistada:</span>
                    <span>-R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total do Pedido:</span>
                <span className="text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logistics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Logística</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de entrega:</span>
                <span>Retirada no Local</span>
              </div>
              {deliveryQuoteRequested && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cotação solicitada:</span>
                  <Badge variant="secondary">Sim</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            <div className="space-y-4">
              {PAYMENT_METHODS.map((method) => {
                const IconComponent = method.icon;
                return (
                  <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="flex items-center gap-2 font-medium cursor-pointer">
                        <IconComponent className="w-4 h-4" />
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <strong>Aviso:</strong> {method.warning}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Summary for payment step */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total a Pagar:</span>
              <span className="text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {getTotalSavings() > 0 && (
              <div className="text-sm text-green-600">
                Você economizou R$ {getTotalSavings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })} neste pedido!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Define steps for ProgressiveForm
  const steps: ProgressiveFormStep[] = [
    {
      id: 'logistics',
      title: 'Logística de Entrega',
      description: 'Configure como você deseja receber seus produtos',
      component: renderLogisticsStep(),
      validate: () => validateLogistics()
    },
    {
      id: 'review',
      title: 'Revisão e Otimização',
      description: 'Revise seu pedido e otimize volumes para melhores preços',
      component: renderReviewStep(),
      validate: () => validateReview()
    },
    {
      id: 'payment',
      title: 'Forma de Pagamento',
      description: 'Selecione como deseja pagar seu pedido',
      component: renderPaymentStep(),
      validate: () => validatePayment()
    }
  ];

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // Track analytics for each step
    const stepNames = ['logistics', 'review', 'payment'];
    const analyticsStep = stepNames[step - 1];
    if (analyticsStep) {
      trackCheckoutStep(analyticsStep as any, 'enter_step');
    }
  };

  const handleFormSubmit = () => {
    handlePaymentComplete();
  };

  // Show confirmation dialog
  if (showConfirmation) {
    return (
      <Dialog open={showConfirmation} onOpenChange={(open) => { 
        if (!open) { 
          clearCart(); 
          navigate('/products'); 
        } 
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Pedido Realizado!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Seu pedido foi registrado com sucesso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {orderData && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Pedido: {orderData.orderNumber}</span>
                  <div className="text-lg font-bold text-primary">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pagamento: {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-green-800 dark:text-green-200 font-medium mb-2">
                📱 Próximos Passos
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Entraremos em contato via <strong>WhatsApp em alguns minutos</strong> para 
                tratar os detalhes do pagamento e entrega.
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              💚 Obrigado por escolher a AgroIkemba!
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => {
                const whatsappUrl = `https://wa.me/5543984064141?text=${encodeURIComponent(
                  `Olá! Acabei de fazer um pedido (${orderData?.orderNumber}) e gostaria de saber mais detalhes.`
                )}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full"
              variant="default"
            >
              💬 Falar no WhatsApp
            </Button>
            
            <Button 
              onClick={() => {
                setShowConfirmation(false);
                clearCart();
                navigate('/products');
              }}
              className="w-full"
              variant="outline"
            >
              Continuar Comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProgressiveForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleFormSubmit}
        isSubmitting={isProcessing}
        submitText={
          isProcessing 
            ? (processingStep || 'Processando...') 
            : 'Finalizar Pedido'
        }
        className="w-full"
      />
    </div>
  );
}