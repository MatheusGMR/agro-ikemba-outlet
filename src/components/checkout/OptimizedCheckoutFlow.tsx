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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutAnalytics } from '@/hooks/useAnalytics';
import { PDFGenerator } from '@/utils/pdfGenerator';
import { DynamicPriceCard } from '@/components/inventory/DynamicPriceCard';

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
    description: 'Retire seus produtos em nosso estoque',
    price: 0
  },
  {
    id: 'delivery_quote',
    name: 'Solicitar Cotação de Entrega',
    description: 'Receba orçamento personalizado para entrega',
    requiresInfo: true
  }
];

export function OptimizedCheckoutFlow({ cartItems, onOrderComplete }: OptimizedCheckoutFlowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackCheckoutStep, trackConversion } = useCheckoutAnalytics();
  
  const [currentStep, setCurrentStep] = useState<'volume_selection' | 'logistics' | 'payment' | 'confirmation'>('volume_selection');
  const [hasOptimizedVolumes, setHasOptimizedVolumes] = useState(false);
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, { volume: number; price: number }>>({});
  const [selectedLogistics, setSelectedLogistics] = useState<string>('pickup');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

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
    trackCheckoutStep(currentStep, 'enter_step');
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
    if (selectedLogistics === 'delivery_quote' && !deliveryInfo.trim()) {
      toast({
        title: "Informações necessárias",
        description: "Por favor, informe os detalhes para cotação de entrega.",
        variant: "destructive"
      });
      return;
    }
    
    trackCheckoutStep('logistics', 'complete', { 
      logistics_type: selectedLogistics,
      delivery_info: deliveryInfo 
    });
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async () => {
    const orderNum = `ORD-${Date.now()}`;
    
    const finalOrderData = {
      orderNumber: orderNum,
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
      logistics: selectedLogistics,
      deliveryInfo,
      paymentMethod: selectedPayment,
      total,
      createdAt: new Date().toISOString()
    };

    try {
      // Generate PDF document (simplified for now)
      const docType = selectedPayment === 'boleto' ? 'Boleto Bancário' : 
                     selectedPayment === 'pix' ? 'Instruções PIX' : 'Instruções TED';
      
      // Simulate PDF generation - in production, implement actual PDF generation
      console.log('Generating PDF:', docType, finalOrderData);

      
      setGeneratedDocument(docType);
      setOrderData(finalOrderData);
      setCurrentStep('confirmation');
      setShowConfirmation(true);

      // Track conversion
      trackConversion('purchase', total);
      trackCheckoutStep('confirmation', 'complete', { order_number: orderNum });
      
      onOrderComplete?.(finalOrderData);

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Pedido ${orderNum} foi criado e o documento foi gerado.`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro na geração do documento",
        description: "Ocorreu um erro ao gerar o documento. Tente novamente.",
        variant: "destructive"
      });
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
        <CardContent className="space-y-4">
          <RadioGroup value={selectedLogistics} onValueChange={setSelectedLogistics}>
          {LOGISTICS_OPTIONS.map((option) => (
            <div key={option.id} className="space-y-3">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                    {option.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  {option.price === 0 && <Badge variant="secondary" className="mt-2">Gratuito</Badge>}
                </div>
              </div>
              
              {option.requiresInfo && selectedLogistics === option.id && (
                <div className="ml-7 p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="delivery-info" className="text-sm font-medium">
                    Informações para Cotação
                  </Label>
                  <Textarea
                    id="delivery-info"
                    placeholder="Informe o endereço de entrega, CEP, e outras informações relevantes..."
                    value={deliveryInfo}
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
        
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('volume_selection')}
            >
              Voltar aos Volumes
            </Button>
            <Button onClick={handleLogisticsNext}>
              Continuar para Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>
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
        <Button variant="outline" onClick={() => setCurrentStep('logistics')}>
          Voltar
        </Button>
        <Button onClick={handlePaymentComplete} disabled={!selectedPayment} size="lg">
          Finalizar Pedido
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
              <span>{LOGISTICS_OPTIONS.find(l => l.id === selectedLogistics)?.name}</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 text-center">
            <strong>Importante:</strong> Os produtos serão liberados somente após a confirmação do pagamento.
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => window.open('#', '_blank')} 
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Salvar PDF
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
      {currentStep === 'payment' && renderPaymentStep()}
      {renderConfirmation()}
    </div>
  );
}
