
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Shield, 
  Warehouse, 
  Clock, 
  Info, 
  CreditCard, 
  BarChart, 
  Check as CheckIcon, 
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

// Mock cart data
const CART_ITEMS = [
  {
    id: 1,
    name: 'Glifosato Premium 480',
    manufacturer: 'AgroTech',
    quantity: 5,
    packageSize: '20L',
    price: 85.90,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    name: 'Mancozeb Plus',
    manufacturer: 'FarmChem',
    quantity: 10,
    packageSize: '25kg',
    price: 45.50,
    image: '/placeholder.svg'
  }
];

// Mock delivery addresses
const ADDRESSES = [
  {
    id: 1,
    name: 'Fazenda Esperança',
    street: 'Rodovia BR-153, km 45',
    city: 'Campinas',
    state: 'SP',
    zipCode: '13083-970',
    isDefault: true
  },
  {
    id: 2,
    name: 'Depósito Central',
    street: 'Av. Industrial, 1500',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04547-005',
    isDefault: false
  }
];

// Mock shipping options
const SHIPPING_OPTIONS = [
  {
    id: 'shipping-1',
    carrier: 'LogExpress',
    price: 450.00,
    days: '3-5',
    type: 'CIF'
  },
  {
    id: 'shipping-2',
    carrier: 'AgroTransporte',
    price: 380.00,
    days: '5-7',
    type: 'CIF'
  },
  {
    id: 'shipping-3',
    carrier: 'RapidLog',
    price: 520.00,
    days: '2-3',
    type: 'CIF'
  }
];

// Mock storage facilities
const STORAGE_FACILITIES = [
  {
    id: 'storage-1',
    name: 'Armazém Central Campinas',
    location: 'Campinas, SP',
    pricePerDay: 25.00,
  },
  {
    id: 'storage-2',
    name: 'Armazém São Paulo Norte',
    location: 'Guarulhos, SP',
    pricePerDay: 30.00,
  }
];

// Storage period options
const STORAGE_PERIODS = [
  { id: 'period-1', days: 7, label: '1 semana' },
  { id: 'period-2', days: 15, label: '15 dias' },
  { id: 'period-3', days: 30, label: '1 mês' }
];

// Mock payment methods
const PAYMENT_METHODS = [
  { id: 'invoice', name: 'Boleto Faturado', icon: File },
  { id: 'credit', name: 'Crédito Ikemba', icon: BarChart },
  { id: 'transfer', name: 'Transferência / PIX', icon: CreditCard }
];

// Step component
const Step = ({ number, title, isActive, isCompleted }: { 
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}) => (
  <div className="flex items-center flex-1">
    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
      isActive ? 'bg-agro-green text-white' : 
      isCompleted ? 'bg-agro-green-light text-white' : 'bg-muted text-muted-foreground'
    }`}>
      {isCompleted ? <Check className="h-4 w-4" /> : number}
    </div>
    <div className="ml-2">
      <p className={`text-sm ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>{title}</p>
    </div>
    {number < 3 && (
      <div className={`flex-1 h-[1px] mx-4 ${isCompleted ? 'bg-agro-green-light' : 'bg-muted'}`} />
    )}
  </div>
);

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<number>(ADDRESSES[0].id);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [needsInsurance, setNeedsInsurance] = useState<boolean>(false);
  const [needsStorage, setNeedsStorage] = useState<boolean>(false);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedStoragePeriod, setSelectedStoragePeriod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  
  // Check if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive"
      });
      navigate('/products');
    }
  }, [items, navigate, toast]);
  
  // Calculate subtotal from cart items
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate shipping cost
  const shipping = selectedShipping 
    ? SHIPPING_OPTIONS.find(option => option.id === selectedShipping)?.price || 0 
    : 0;
  
  // Calculate insurance (2% of subtotal)
  const insurance = needsInsurance ? subtotal * 0.02 : 0;
  
  // Calculate storage cost
  const storage = needsStorage && selectedStorage && selectedStoragePeriod
    ? STORAGE_FACILITIES.find(facility => facility.id === selectedStorage)!.pricePerDay * 
      STORAGE_PERIODS.find(period => period.id === selectedStoragePeriod)!.days
    : 0;
  
  // Calculate total
  const total = subtotal + shipping + insurance + storage;
  
  // Handler for continuing to the next step
  const handleContinue = () => {
    if (currentStep === 1 && selectedShipping) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2 && selectedPaymentMethod && termsAccepted) {
      // Generate a random order number
      setOrderNumber(Math.random().toString(36).substring(2, 10).toUpperCase());
      setCurrentStep(3);
      setOrderComplete(true);
      // Clear cart after successful order
      clearCart();
      window.scrollTo(0, 0);
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido ${Math.random().toString(36).substring(2, 10).toUpperCase()} foi confirmado.`,
      });
    }
  };
  
  // Handler for going back to the previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Checkout header with steps */}
        <div className="bg-white border-b">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
              <Link to="/cart" className="text-sm text-agro-green hover:underline">
                Voltar ao Carrinho
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Step 
                number={1} 
                title="Entrega e Seguro" 
                isActive={currentStep === 1} 
                isCompleted={currentStep > 1}
              />
              <Step 
                number={2} 
                title="Pagamento" 
                isActive={currentStep === 2} 
                isCompleted={currentStep > 2}
              />
              <Step 
                number={3} 
                title="Confirmação" 
                isActive={currentStep === 3} 
                isCompleted={false}
              />
            </div>
          </div>
        </div>
        
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main checkout content */}
            <div className="flex-1">
              {/* Step 1: Shipping and Insurance */}
              {currentStep === 1 && (
                <div>
                  {/* Delivery Address Selection */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-agro-green" />
                      Endereço de Entrega
                    </h2>
                    
                    <div className="space-y-4">
                      <RadioGroup 
                        value={String(selectedAddress)}
                        onValueChange={(value) => setSelectedAddress(Number(value))}
                      >
                        {ADDRESSES.map((address) => (
                          <div 
                            key={address.id}
                            className="flex items-start border rounded-md p-4 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedAddress(address.id)}
                          >
                            <RadioGroupItem 
                              value={String(address.id)} 
                              id={`address-${address.id}`} 
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor={`address-${address.id}`} className="font-medium">
                                {address.name} {address.isDefault && <span className="text-xs bg-agro-green text-white px-2 py-0.5 rounded ml-2">Padrão</span>}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {address.street}, {address.city} - {address.state}, {address.zipCode}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      <Button variant="outline" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Novo Endereço
                      </Button>
                    </div>
                  </div>
                  
                  {/* Shipping Options */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Truck className="mr-2 h-5 w-5 text-agro-green" />
                      Opções de Frete
                    </h2>
                    
                    <div className="space-y-4">
                      <RadioGroup value={selectedShipping || ''} onValueChange={setSelectedShipping}>
                        {SHIPPING_OPTIONS.map((option) => (
                          <div 
                            key={option.id}
                            className="flex items-start border rounded-md p-4 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedShipping(option.id)}
                          >
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <Label htmlFor={option.id} className="font-medium">
                                  {option.carrier}
                                </Label>
                                <p className="font-semibold">R$ {option.price.toFixed(2)}</p>
                              </div>
                              <div className="flex justify-between mt-1">
                                <p className="text-sm text-muted-foreground">
                                  Entrega em {option.days} dias úteis
                                </p>
                                <p className="text-sm font-medium bg-agro-beige px-2 py-0.5 rounded">
                                  {option.type}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    {!selectedShipping && (
                      <p className="text-red-500 text-sm mt-2">
                        Por favor, selecione uma opção de frete para continuar.
                      </p>
                    )}
                  </div>
                  
                  {/* Insurance Option */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Shield className="h-6 w-6 text-agro-green" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-semibold">Seguro do Produto</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Proteja sua carga contra danos, roubo e extravios durante o transporte
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="insurance" 
                              checked={needsInsurance}
                              onCheckedChange={(checked) => setNeedsInsurance(checked === true)}
                            />
                            <Label htmlFor="insurance" className="ml-2">
                              R$ {(subtotal * 0.02).toFixed(2)}
                            </Label>
                          </div>
                        </div>
                        
                        {needsInsurance && (
                          <div className="mt-4 p-3 bg-muted rounded-md flex items-start gap-2">
                            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-sm">
                              O seguro cobre 100% do valor dos produtos e frete em caso de danos, roubo ou extravios durante o transporte.
                              <a href="#" className="text-agro-green ml-1 hover:underline">
                                Ver termos e condições do seguro
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Storage Option */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Warehouse className="h-6 w-6 text-agro-green" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-semibold">Armazenagem Temporária</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Precisa armazenar os produtos antes da entrega final?
                            </p>
                          </div>
                          <div>
                            <Checkbox 
                              id="storage" 
                              checked={needsStorage}
                              onCheckedChange={(checked) => {
                                setNeedsStorage(checked === true);
                                if (checked !== true) {
                                  setSelectedStorage(null);
                                  setSelectedStoragePeriod(null);
                                }
                              }}
                            />
                            <Label htmlFor="storage" className="ml-2">
                              Sim, preciso
                            </Label>
                          </div>
                        </div>
                        
                        {needsStorage && (
                          <div className="mt-4">
                            <div className="mb-4">
                              <h3 className="font-medium mb-2 flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                Período de Armazenagem
                              </h3>
                              <RadioGroup 
                                value={selectedStoragePeriod || ''} 
                                onValueChange={setSelectedStoragePeriod}
                                className="flex flex-wrap gap-2"
                              >
                                {STORAGE_PERIODS.map((period) => (
                                  <div key={period.id} className="flex items-center">
                                    <RadioGroupItem 
                                      value={period.id} 
                                      id={period.id} 
                                      className="sr-only" 
                                    />
                                    <Label 
                                      htmlFor={period.id}
                                      className={`px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                                        selectedStoragePeriod === period.id 
                                          ? 'bg-agro-green text-white border-agro-green' 
                                          : 'hover:bg-muted'
                                      }`}
                                    >
                                      {period.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            
                            <h3 className="font-medium mb-2">Armazéns Disponíveis</h3>
                            <RadioGroup 
                              value={selectedStorage || ''} 
                              onValueChange={setSelectedStorage}
                            >
                              {STORAGE_FACILITIES.map((facility) => (
                                <div 
                                  key={facility.id}
                                  className="flex items-start border rounded-md p-4 mb-2 hover:bg-muted/50 cursor-pointer"
                                  onClick={() => setSelectedStorage(facility.id)}
                                >
                                  <RadioGroupItem value={facility.id} id={facility.id} className="mt-1" />
                                  <div className="ml-3 flex-1">
                                    <div className="flex justify-between">
                                      <Label htmlFor={facility.id} className="font-medium">
                                        {facility.name}
                                      </Label>
                                      <p className="font-semibold">
                                        R$ {facility.pricePerDay.toFixed(2)}<span className="font-normal">/dia</span>
                                      </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {facility.location}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                            
                            {needsStorage && (!selectedStorage || !selectedStoragePeriod) && (
                              <p className="text-amber-600 text-sm mt-2 flex items-center">
                                <Info className="h-4 w-4 mr-1" />
                                Por favor, selecione um armazém e período para continuar com armazenagem.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div>
                  {/* Payment Summary */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Resumo do Pagamento</h2>
                    
                    <div className="border-t border-b py-4 space-y-2">
                      <div className="flex justify-between">
                        <p>Subtotal dos Produtos</p>
                        <p>R$ {subtotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Frete</p>
                        <p>R$ {shipping.toFixed(2)}</p>
                      </div>
                      {needsInsurance && (
                        <div className="flex justify-between">
                          <p>Seguro</p>
                          <p>R$ {insurance.toFixed(2)}</p>
                        </div>
                      )}
                      {needsStorage && selectedStorage && selectedStoragePeriod && (
                        <div className="flex justify-between">
                          <p>Armazenagem</p>
                          <p>R$ {storage.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <p className="font-semibold text-lg">Total</p>
                      <p className="font-bold text-2xl">R$ {total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Payment Methods */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
                    
                    <RadioGroup value={selectedPaymentMethod || ''} onValueChange={setSelectedPaymentMethod}>
                      <div className="space-y-4">
                        {PAYMENT_METHODS.map((method) => (
                          <div 
                            key={method.id}
                            className="flex items-start border rounded-md p-4 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                            <div className="ml-3 flex-1">
                              <Label htmlFor={method.id} className="font-medium flex items-center">
                                <method.icon className="mr-2 h-5 w-5" />
                                {method.name}
                              </Label>
                              
                              {selectedPaymentMethod === method.id && (
                                <div className="mt-4">
                                  {method.id === 'invoice' && (
                                    <div>
                                      <div className="bg-muted rounded-md p-3 mb-4">
                                        <p className="text-sm font-medium">Limite disponível: R$ 50.000,00</p>
                                      </div>
                                      <div className="mb-4">
                                        <Label htmlFor="payment-term" className="mb-2 block">
                                          Prazo de Pagamento
                                        </Label>
                                        <select 
                                          id="payment-term" 
                                          className="w-full border rounded-md p-2"
                                        >
                                          <option value="30">30 dias</option>
                                          <option value="45">45 dias</option>
                                          <option value="60">60 dias</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {method.id === 'credit' && (
                                    <div>
                                      <div className="bg-muted rounded-md p-3 mb-4">
                                        <p className="text-sm font-medium">
                                          Financiamento direto com a Ikemba. Taxa de juros: 1.5% a.m.
                                        </p>
                                      </div>
                                      <div className="mb-4">
                                        <Label htmlFor="credit-term" className="mb-2 block">
                                          Prazo de Pagamento
                                        </Label>
                                        <select 
                                          id="credit-term" 
                                          className="w-full border rounded-md p-2"
                                        >
                                          <option value="3">3x parcelas</option>
                                          <option value="6">6x parcelas</option>
                                          <option value="12">12x parcelas</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {method.id === 'transfer' && (
                                    <div>
                                      <div className="bg-muted rounded-md p-3 mb-4">
                                        <h4 className="font-medium mb-1">Dados Bancários</h4>
                                        <p className="text-sm">Banco Ikemba (999)</p>
                                        <p className="text-sm">Agência: 0001 / Conta: 12345-6</p>
                                        <p className="text-sm">CNPJ: 12.345.678/0001-90</p>
                                        <p className="text-sm">PIX: pix@agroikemba.com</p>
                                      </div>
                                      <div className="mb-4">
                                        <Label htmlFor="receipt" className="mb-2 block">
                                          Anexar Comprovante
                                        </Label>
                                        <Input id="receipt" type="file" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    
                    {!selectedPaymentMethod && (
                      <p className="text-red-500 text-sm mt-2">
                        Por favor, selecione uma forma de pagamento para continuar.
                      </p>
                    )}
                  </div>
                  
                  {/* Terms and Conditions */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <Checkbox 
                        id="terms" 
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      />
                      <Label htmlFor="terms" className="ml-3 text-sm">
                        Li e aceito os <a href="#" className="text-agro-green hover:underline">Termos e Condições da Compra</a> e a 
                        <a href="#" className="text-agro-green hover:underline ml-1">Política de Privacidade</a>.
                      </Label>
                    </div>
                    
                    {!termsAccepted && (
                      <p className="text-red-500 text-sm mt-2">
                        Você precisa aceitar os termos para finalizar a compra.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-agro-green/20 flex items-center justify-center">
                      <CheckIcon className="h-10 w-10 text-agro-green" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Pedido Realizado com Sucesso!</h2>
                  <p className="text-lg mb-6 text-muted-foreground">
                    Seu pedido foi confirmado e está em processamento.
                  </p>
                  
                  <div className="bg-muted rounded-md p-4 max-w-sm mx-auto mb-8">
                    <p className="text-sm text-muted-foreground">Número do pedido</p>
                    <p className="text-lg font-semibold">{orderNumber}</p>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <div className="border-b pb-4">
                      <h3 className="font-medium mb-2">Resumo do Pedido</h3>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">R$ {total.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Entrega</p>
                        <p className="font-medium">{SHIPPING_OPTIONS.find(option => option.id === selectedShipping)?.carrier}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Próximos Passos</h3>
                      <ol className="text-sm space-y-1 text-left list-decimal pl-5">
                        <li>Você receberá um e-mail de confirmação com os detalhes do pedido.</li>
                        <li>Nossa equipe processará seu pedido em até 24 horas úteis.</li>
                        <li>A entrega será realizada conforme o prazo informado.</li>
                        <li>Você pode acompanhar o status do pedido no seu painel.</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link to="/dashboard">Ver Meus Pedidos</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/products">Continuar Comprando</Link>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Navigation buttons for steps 1-2 */}
              {currentStep < 3 && (
                <div className="flex justify-between mt-6">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link to="/cart">Voltar ao Carrinho</Link>
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleContinue}
                    disabled={
                      (currentStep === 1 && !selectedShipping) || 
                      (currentStep === 2 && (!selectedPaymentMethod || !termsAccepted)) ||
                      (needsStorage && (!selectedStorage || !selectedStoragePeriod))
                    }
                  >
                    {currentStep === 2 ? 'Finalizar Compra' : 'Continuar para Pagamento'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Order Summary Sidebar */}
            {currentStep < 3 && (
              <div className="w-full lg:w-96">
                <div className="bg-white border rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-contain border rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1">{item.manufacturer}</p>
                          <div className="flex justify-between">
                            <p className="text-sm">{item.quantity} x {item.packageSize}</p>
                            <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>R$ {subtotal.toFixed(2)}</p>
                    </div>
                    
                    {selectedShipping && (
                      <div className="flex justify-between">
                        <p>Frete</p>
                        <p>R$ {shipping.toFixed(2)}</p>
                      </div>
                    )}
                    
                    {needsInsurance && (
                      <div className="flex justify-between">
                        <p>Seguro</p>
                        <p>R$ {insurance.toFixed(2)}</p>
                      </div>
                    )}
                    
                    {needsStorage && selectedStorage && selectedStoragePeriod && (
                      <div className="flex justify-between">
                        <p>Armazenagem</p>
                        <p>R$ {storage.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Total</p>
                      <p className="text-xl font-bold">R$ {total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Missing Plus icon component for the Button
const Plus = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Missing Minus icon component for quantity control
const Minus = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
  </svg>
);

export default Checkout;
