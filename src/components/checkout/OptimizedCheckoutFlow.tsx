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
import { 
  Package, 
  FileText, 
  Smartphone, 
  ArrowLeftRight, 
  CheckCircle,
  Download,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import DynamicPriceCard from '@/components/inventory/DynamicPriceCard';
import jsPDF from 'jspdf';

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
  
  const [currentStep, setCurrentStep] = useState<'volume_selection' | 'logistics' | 'review' | 'payment' | 'confirmation'>('volume_selection');
  const [hasOptimizedVolumes, setHasOptimizedVolumes] = useState(false);
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, { volume: number; price: number }>>({});
  const [selectedLogistics, setSelectedLogistics] = useState<string>('pickup');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [deliveryQuoteRequested, setDeliveryQuoteRequested] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if items are already optimized and set initial step
  useEffect(() => {
    // Check if any items in the cart were marked as optimized from the product page
    const hasOptimizedItems = cartItems.some(item => {
      // Check for volumes >= 1000L which indicates optimization was done
      return item.quantity >= 1000;
    });
    
    setHasOptimizedVolumes(hasOptimizedItems);
    
    // If items appear to be optimized, start at logistics step
    if (hasOptimizedItems) {
      setCurrentStep('logistics');
      // Initialize selected volumes with current cart data
      const initialVolumes = cartItems.reduce((acc, item) => {
        acc[item.id] = { volume: item.quantity, price: item.price };
        return acc;
      }, {} as Record<string, { volume: number; price: number }>);
      setSelectedVolumes(initialVolumes);
    }
  }, [cartItems]);

  // Track step entries
  useEffect(() => {
    const analyticsStep = currentStep === 'review' ? 'payment' : currentStep;
    trackCheckoutStep(analyticsStep as any, 'enter_step');
  }, [currentStep, trackCheckoutStep]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
    return sum + (volumeData.volume * volumeData.price);
  }, 0);

  const total = subtotal; // No additional fees in optimized flow

  const handleVolumeOptimization = (itemId: string, volume: number, price: number) => {
    setSelectedVolumes(prev => ({
      ...prev,
      [itemId]: { volume, price }
    }));
  };

  const handleLogisticsNext = () => {
    if (deliveryQuoteRequested && !deliveryInfo.trim()) {
      toast({
        title: "Informações necessárias",
        description: "Por favor, informe os detalhes para cotação de entrega.",
        variant: "destructive"
      });
      return;
    }
    
    trackCheckoutStep('logistics', 'complete', { 
      logistics_type: 'pickup',
      delivery_quote_requested: deliveryQuoteRequested,
      delivery_info: deliveryInfo 
    });
    setCurrentStep('review');
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
    
    // Bank details (mock data)
    pdf.text('DADOS BANCÁRIOS:', 20, 90);
    pdf.text('Banco: 341 - Itaú Unibanco', 20, 100);
    pdf.text('Agência: 1234', 20, 110);
    pdf.text('Conta: 12345-6', 20, 120);
    pdf.text('Favorecido: AgroIkemba Ltda', 20, 130);
    
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

  const handlePaymentComplete = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para finalizar o pedido.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const finalOrderData = {
        orderNumber: `ORD-${Date.now()}`,
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

      // Save order to database
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: finalOrderData.items,
          total_amount: total,
          payment_method: selectedPayment,
          logistics_option: 'pickup',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error saving order:', orderError);
        throw new Error('Erro ao salvar pedido no banco de dados');
      }

      console.log('Order saved successfully:', orderResult);

      // Generate PDF
      let docUrl = '';
      let docType = '';
      
      if (selectedPayment === 'boleto') {
        docType = 'Boleto Bancário';
        docUrl = await generateBoletoPDF(finalOrderData);
        
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
      } else {
        docType = selectedPayment === 'pix' ? 'Instruções PIX' : 'Instruções TED';
      }
      
      setGeneratedDocument(docType);
      setDocumentUrl(docUrl);
      setOrderData({ ...finalOrderData, orderNumber: orderResult.order_number });
      setCurrentStep('confirmation');
      setShowConfirmation(true);

      // Clear cart
      clearCart();

      // Track conversion
      trackConversion('purchase', total);
      
      onOrderComplete?.(finalOrderData);

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Pedido ${orderResult.order_number} foi criado e salvo no banco de dados.`,
      });

    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Erro ao processar pedido",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderVolumeStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Otimização de Volume e Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ajuste os volumes para obter os melhores preços. Volume mínimo: 1.000L por produto.
          </p>
        </CardContent>
      </Card>

      {cartItems.map((item) => (
        <DynamicPriceCard
          key={item.id}
          inventoryItems={[{
            id: item.id,
            product_sku: item.sku,
            product_name: item.name,
            manufacturer: item.manufacturer,
            client_price: item.price,
            volume_available: 50000, // Mock available volume
            // ... other required fields with mock data
            active_ingredient: '',
            mapa_number: '',
            packaging: '1000L',
            unit: 'L',
            state: 'SP',
            city: 'Campinas',
            expiry_date: '2024-12-31',
            price_tier: 'Preço Banda maior',
            base_price: item.price,
            commission_unit: 0,
            net_commission: 0,
            commission_percentage: 0,
            rep_percentage: 0,
            supplier_net: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]}
          onVolumeChange={(volume, price, savings) => {
            handleVolumeOptimization(item.id, volume, price);
          }}
          minVolume={1000}
        />
      ))}

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep('logistics')} size="lg">
          Continuar para Logística
        </Button>
      </div>
    </div>
  );

  const renderLogisticsStep = () => (
    <div className="space-y-6">
      {/* Show optimized volumes summary if starting from logistics */}
      {hasOptimizedVolumes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Volumes Otimizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seus volumes foram otimizados na página do produto para obter os melhores preços.
            </p>
            <div className="space-y-2">
              {cartItems.map((item) => {
                const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {volumeData.volume.toLocaleString('pt-BR')}L × R$ {volumeData.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setCurrentStep('volume_selection')}
            >
              Ajustar Volumes
            </Button>
          </CardContent>
        </Card>
      )}
      
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
                      Ele apenas ajuda você a conseguir orçamentos para futura entrega por transportadoras.
                    </div>
                  </div>
                </div>
                
                {deliveryQuoteRequested && (
                  <div className="ml-7 p-3 bg-muted/50 rounded-lg">
                    <Label htmlFor="delivery-info" className="text-sm font-medium">
                      Informações para Cotação de Entrega
                    </Label>
                    <Textarea
                      id="delivery-info"
                      placeholder="Informe o endereço completo de entrega, CEP, e outras informações relevantes para a cotação..."
                      value={deliveryInfo}
                      onChange={(e) => setDeliveryInfo(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      ⏱️ Prazo para resposta: até 90 minutos durante horário comercial
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('volume_selection')}
            >
              Voltar aos Volumes
            </Button>
            <Button onClick={handleLogisticsNext}>
              Revisar Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Revisão do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Revise todos os detalhes do seu pedido antes de prosseguir para o pagamento.
          </p>
        </CardContent>
      </Card>

      {/* Items Review */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Selecionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item) => {
              const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
              return (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {item.sku} | Fabricante: {item.manufacturer}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Volume: {volumeData.volume.toLocaleString('pt-BR')}L × R$ {volumeData.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    R$ {(volumeData.volume * volumeData.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
            
            <Separator />
            
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logistics Review */}
      <Card>
        <CardHeader>
          <CardTitle>Logística</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Opção de Entrega:</span>
              <span className="font-medium">Retirada no Local (Gratuito)</span>
            </div>
            {deliveryQuoteRequested && (
              <>
                <div className="flex justify-between">
                  <span>Cotação de Entrega:</span>
                  <span className="font-medium text-blue-600">Solicitada</span>
                </div>
                {deliveryInfo && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                    <strong>Informações para cotação:</strong>
                    <p className="mt-1">{deliveryInfo}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('logistics')}>
          Voltar à Logística
        </Button>
        <Button onClick={() => setCurrentStep('payment')} size="lg">
          Continuar para Pagamento
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item) => {
              const volumeData = selectedVolumes[item.id] || { volume: item.quantity, price: item.price };
              return (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {volumeData.volume.toLocaleString('pt-BR')}L × R$ {volumeData.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    R$ {(volumeData.volume * volumeData.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
            
            <Separator />
            
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            <div className="space-y-4">
              {PAYMENT_METHODS.map((method) => {
                const IconComponent = method.icon;
                return (
                  <div key={method.id} className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                      <IconComponent className="w-5 h-5 mt-1 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    
                    {selectedPayment === method.id && (
                      <div className="ml-7 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 font-medium">Importante:</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">{method.warning}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('review')}>
          Voltar à Revisão
        </Button>
        <Button 
          onClick={handlePaymentComplete} 
          disabled={!selectedPayment || isProcessing} 
          size="lg"
        >
          {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Pedido Realizado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              Pedido: {orderData?.orderNumber}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Documento gerado: <strong>{generatedDocument}</strong>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total do Pedido:</span>
              <span className="font-semibold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Forma de Pagamento:</span>
              <span>{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Logística:</span>
              <span>Retirada no Local</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 text-center">
            <strong>Importante:</strong> Os produtos serão liberados somente após a confirmação do pagamento.
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => documentUrl ? window.open(documentUrl, '_blank') : undefined} 
              variant="outline"
              size="sm"
              disabled={!documentUrl}
            >
              <Download className="w-4 h-4 mr-2" />
              {documentUrl ? 'Baixar PDF' : 'PDF N/D'}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              size="sm"
            >
              Ver Pedidos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {currentStep === 'volume_selection' && renderVolumeStep()}
      {currentStep === 'logistics' && renderLogisticsStep()}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {renderConfirmation()}
    </div>
  );
}
