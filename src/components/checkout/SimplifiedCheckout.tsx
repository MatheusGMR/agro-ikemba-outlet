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
  CheckCircle,
  Download
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState<'logistics' | 'payment' | 'confirmation'>('logistics');
  const [selectedLogistics, setSelectedLogistics] = useState<string>('pickup');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);

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

  const handlePaymentComplete = () => {
    const orderData = {
      items,
      logistics: selectedLogistics,
      paymentMethod: selectedPayment,
      total,
      orderNumber: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Generate appropriate document
    const docType = selectedPayment === 'boleto' ? 'Boleto Bancário' : 
                   selectedPayment === 'pix' ? 'Instruções PIX' : 'Instruções TED';
    
    setGeneratedDocument(docType);
    setCurrentStep('confirmation');
    setShowConfirmation(true);
    
    onOrderComplete(orderData);
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
          <Button onClick={handlePaymentComplete} disabled={!selectedPayment}>
            Finalizar Pedido
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
            Pedido Realizado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              Documento Gerado: {generatedDocument}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedPayment === 'boleto' 
                ? 'Seu boleto foi gerado e está sendo aberto em uma nova aba.'
                : 'Suas instruções de pagamento estão sendo abertas em uma nova aba.'}
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
          
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 text-center">
            <strong>Importante:</strong> Os produtos serão liberados somente após a confirmação do pagamento.
          </div>
          
          <Button 
            onClick={() => window.open('#', '_blank')} 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Salvar Documento PDF
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