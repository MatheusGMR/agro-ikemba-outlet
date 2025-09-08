import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { ProgressiveForm, ProgressiveFormStep } from '@/components/ui/progressive-form';
import jsPDF from 'jspdf';
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

  // Create order with retry mechanism to handle race conditions
  const createOrderWithRetry = async (finalOrderData: any, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Creating order attempt ${attempt}/${maxRetries}`);
        
        // Generate order number using database function
        const { data: orderNumber, error: rpcError } = await supabase
          .rpc('generate_order_number');

        if (rpcError) {
          console.error('❌ Error generating order number:', rpcError);
          throw rpcError;
        }

        console.log('📋 Generated order number:', orderNumber);

        // Insert order with generated number
        const orderToInsert = {
          user_id: user?.id,
          order_number: orderNumber,
          items: finalOrderData.items,
          total_amount: finalOrderData.total,
          payment_method: finalOrderData.paymentMethod,
          logistics_option: 'pickup',
          status: 'pending'
        };

        const { data: orderData, error: insertError } = await supabase
          .from('orders')
          .insert(orderToInsert)
          .select()
          .single();

        if (!insertError) {
          console.log('✅ Order created successfully:', orderData);
          return orderData;
        }

        // Handle duplicate key constraint violation (23505)
        if (insertError.code === '23505' && attempt < maxRetries) {
          console.warn(`⚠️ Duplicate order number detected, retrying... (attempt ${attempt})`);
          // Wait with jitter to reduce collision probability
          await wait(200 + Math.random() * 300);
          continue;
        }

        // If it's not a duplicate or we've exhausted retries, throw the error
        throw insertError;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error('❌ Failed to create order after all retries:', error);
          throw error;
        }
        console.warn(`⚠️ Order creation failed, attempt ${attempt}:`, error);
        await wait(200 + Math.random() * 300);
      }
    }
  };

  const generateBoletoPDF = async (orderData: any): Promise<string> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Header
    pdf.setFontSize(20);
    pdf.text('BOLETO BANCÁRIO', pageWidth / 2, 30, { align: 'center' });
    
    // Order info
    pdf.setFontSize(12);
    pdf.text(`Pedido: ${orderData.orderNumber}`, 20, 50);
    pdf.text(`Data: ${new Date(orderData.createdAt).toLocaleDateString('pt-BR')}`, 20, 60);
    pdf.text(`Total: R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 70);
    
    // Bank details
    pdf.text('DADOS BANCÁRIOS:', 20, 90);
    pdf.text(`Banco: ${BANK_DETAILS.bank}`, 20, 100);
    pdf.text(`Agência: ${BANK_DETAILS.agency}`, 20, 110);
    pdf.text(`Conta: ${BANK_DETAILS.account}`, 20, 120);
    pdf.text(`Favorecido: ${BANK_DETAILS.beneficiary}`, 20, 130);
    
    // Payment instructions
    pdf.text('INSTRUÇÕES DE PAGAMENTO:', 20, 150);
    pdf.text('• Pagamento até 7 dias corridos após a emissão', 20, 160);
    pdf.text('• Após o pagamento, envie o comprovante via WhatsApp', 20, 170);
    pdf.text('• Produtos liberados após confirmação do pagamento', 20, 180);
    
    // Items
    pdf.text('ITENS DO PEDIDO:', 20, 200);
    let yPos = 210;
    orderData.items.forEach((item: any) => {
      pdf.text(`${item.name} - ${item.volume.toLocaleString('pt-BR')}L x R$ ${item.price.toFixed(2)} = R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos);
      yPos += 10;
    });
    
    const pdfBlob = pdf.output('blob');
    return URL.createObjectURL(pdfBlob);
  };

  const generatePixInstructions = (orderData: any) => {
    const pixContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1976d2; text-align: center;">Instruções de Pagamento PIX</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Pedido: ${orderData.orderNumber}</h3>
          <p><strong>Total:</strong> R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p><strong>Data:</strong> ${new Date(orderData.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados para PIX:</h3>
          <p><strong>Banco:</strong> ${BANK_DETAILS.bank}</p>
          <p><strong>Favorecido:</strong> ${BANK_DETAILS.beneficiary}</p>
          <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
          <p><strong>Chave PIX:</strong> agro@ikemba.com.br</p>
        </div>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Instruções:</h3>
          <ul>
            <li>Faça o PIX no valor exato de R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li>Após o pagamento, envie o comprovante via WhatsApp</li>
            <li>Produtos liberados após confirmação do pagamento</li>
            <li>Prazo para pagamento: 24 horas</li>
          </ul>
        </div>
      </div>
    `;
    return `data:text/html;charset=utf-8,${encodeURIComponent(pixContent)}`;
  };

  const generateTedInstructions = (orderData: any) => {
    const tedContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1976d2; text-align: center;">Instruções de Transferência TED</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Pedido: ${orderData.orderNumber}</h3>
          <p><strong>Total:</strong> R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p><strong>Data:</strong> ${new Date(orderData.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados Bancários:</h3>
          <p><strong>Banco:</strong> ${BANK_DETAILS.bank}</p>
          <p><strong>Agência:</strong> ${BANK_DETAILS.agency}</p>
          <p><strong>Conta:</strong> ${BANK_DETAILS.account}</p>
          <p><strong>Favorecido:</strong> ${BANK_DETAILS.beneficiary}</p>
          <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
        </div>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Instruções:</h3>
          <ul>
            <li>Faça a transferência no valor exato de R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li>Após a transferência, envie o comprovante via WhatsApp</li>
            <li>Produtos liberados após confirmação do pagamento</li>
            <li>Prazo para pagamento: 2 dias úteis</li>
          </ul>
        </div>
      </div>
    `;
    return `data:text/html;charset=utf-8,${encodeURIComponent(tedContent)}`;
  };

  const handlePaymentComplete = async () => {
    // Enhanced user authentication validation
    if (!user?.id || typeof user.id !== 'string') {
      console.error('Authentication error: Invalid user', { user });
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para finalizar o pedido. Redirecionando...",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Enhanced payment method validation
    if (!selectedPayment) {
      toast({
        title: "Forma de pagamento necessária",
        description: "Por favor, selecione uma forma de pagamento.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    console.log('Starting order processing for user:', user.id, 'payment method:', selectedPayment);
    
    try {
      const finalOrderData = {
        items: cartItems.map(item => {
          const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
          return {
            id: item.id,
            name: item.name,
            sku: item.sku,
            volume: volumeData.volume,
            price: volumeData.price,
            total: volumeData.volume * volumeData.price
          };
        }),
        logistics: 'pickup',
        deliveryQuoteRequested,
        deliveryInfo,
        paymentMethod: selectedPayment,
        total,
        createdAt: new Date().toISOString()
      };

      console.log('📦 Order data prepared:', finalOrderData);

      // Create order with retry mechanism to handle duplicate order numbers
      const orderResult = await createOrderWithRetry(finalOrderData);
      
      console.log('✅ Order saved successfully:', orderResult);

      // Generate payment-specific content
      let docUrl = '';
      let docType = '';
      
      if (selectedPayment === 'boleto') {
        try {
          docType = 'Boleto Bancário';
          const enrichedOrderData = { 
            ...finalOrderData, 
            orderNumber: orderResult.order_number, 
            createdAt: orderResult.created_at 
          };
          docUrl = await generateBoletoPDF(enrichedOrderData);
          
          // Upload PDF to Supabase Storage
          const pdfResponse = await fetch(docUrl);
          const pdfBlob = await pdfResponse.blob();
          const fileName = `boleto-${orderResult.order_number}-${Date.now()}.pdf`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media-assets')
            .upload(`order-docs/${fileName}`, pdfBlob, {
              contentType: 'application/pdf',
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error('Error uploading PDF:', uploadError);
          } else {
            // Save document record
            const { error: docError } = await supabase
              .from('order_documents')
              .insert({
                user_id: user.id,
                order_id: orderResult.order_number,
                document_type: 'boleto',
                document_url: `${supabase.storage.from('media-assets').getPublicUrl(`order-docs/${fileName}`).data.publicUrl}`
              });

            if (docError) {
              console.error('Error saving document record:', docError);
            }
          }
        } catch (pdfError) {
          console.error('Error generating boleto PDF:', pdfError);
          toast({
            title: "Aviso",
            description: "Pedido salvo, mas houve erro ao gerar o boleto. Entre em contato conosco.",
            variant: "destructive"
          });
        }
      } else if (selectedPayment === 'pix') {
        docType = 'Instruções PIX';
        docUrl = generatePixInstructions(finalOrderData);
      } else if (selectedPayment === 'ted') {
        docType = 'Instruções TED';
        docUrl = generateTedInstructions(finalOrderData);
      }
      
      setGeneratedDocument(docType);
      setDocumentUrl(docUrl);
      setOrderData({ ...finalOrderData, orderNumber: orderResult.order_number });
      setShowConfirmation(true);

      // Track conversion
      trackConversion('purchase', total);
      
      onOrderComplete?.(finalOrderData);

      // Payment-specific success messages
      let successMessage = '';
      if (selectedPayment === 'boleto') {
        successMessage = `Pedido ${orderResult.order_number} criado! Faça o download do boleto para pagamento.`;
      } else if (selectedPayment === 'pix') {
        successMessage = `Pedido ${orderResult.order_number} criado! Veja as instruções PIX para pagamento.`;
      } else if (selectedPayment === 'ted') {
        successMessage = `Pedido ${orderResult.order_number} criado! Veja as instruções de transferência para pagamento.`;
      }

      toast({
        title: "Pedido realizado com sucesso!",
        description: successMessage,
      });

    } catch (error) {
      console.error('❌ Error processing order:', error);
      
      // Enhanced error handling with specific messages
      let errorTitle = "Erro ao processar pedido";
      let errorDescription = "Tente novamente - erro temporário do sistema";
      
      if (error instanceof Error) {
        if (error.message.includes('autenticação') || error.message.includes('auth')) {
          errorTitle = "Erro de autenticação";
          errorDescription = "Sessão expirada. Faça login novamente.";
          navigate('/login');
          return;
        } else if ((error as any).code === '23505') {
          errorTitle = "Erro temporário";
          errorDescription = "Sistema ocupado, tente novamente em alguns segundos.";
        } else if (error.message.includes('generate_order_number')) {
          errorTitle = "Erro do sistema";
          errorDescription = "Erro ao gerar número do pedido. Tente novamente.";
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorTitle = "Erro de conexão";
          errorDescription = "Verifique sua conexão e tente novamente.";
        } else if (error.message.includes('banco de dados')) {
          errorTitle = "Erro no banco de dados";
          errorDescription = "Problema ao salvar o pedido. Tente novamente em alguns segundos.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Pedido Realizado com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {orderData && (
              <div className="text-center py-4">
                <div className="text-lg font-semibold">
                  Pedido: {orderData.orderNumber}
                </div>
                <div className="text-2xl font-bold text-primary mt-2">
                  R$ {orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Próximos Passos:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pedido registrado em nosso sistema</span>
                  </li>
                  
                  {selectedPayment === 'boleto' && (
                    <>
                      <li className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Faça o download do boleto e efetue o pagamento em até 7 dias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Smartphone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Envie o comprovante de pagamento via WhatsApp</span>
                      </li>
                    </>
                  )}
                  
                  {(selectedPayment === 'pix' || selectedPayment === 'ted') && (
                    <>
                      <li className="flex items-start gap-2">
                        <Smartphone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Entraremos em contato com as instruções de pagamento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Smartphone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Envie o comprovante de pagamento via WhatsApp</span>
                      </li>
                    </>
                  )}
                  
                  <li className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Agende a retirada dos produtos após confirmação do pagamento</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {deliveryQuoteRequested && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Cotação de Entrega Solicitada</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Você receberá orçamentos de transportadoras em até 90 minutos via WhatsApp.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {documentUrl && (
                <Button asChild className="flex-1">
                  <a href={documentUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download {generatedDocument}
                  </a>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => { clearCart(); navigate('/dashboard'); }}
                className="flex-1"
              >
                Ver Meus Pedidos
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => { clearCart(); navigate('/products'); }}
                className="flex-1"
              >
                Continuar Comprando
              </Button>
            </div>
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
        submitText="Finalizar Pedido"
        className="w-full"
      />
    </div>
  );
}