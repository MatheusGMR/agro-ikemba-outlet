import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRepClients, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import { useState, useMemo } from 'react';
import { RepClient } from '@/types/representative';
import { GroupedProduct } from '@/types/inventory';
import { Plus, Minus, MapPin, Package, CreditCard, Truck, FileDown } from 'lucide-react';

interface CreateOpportunityDialogProps {
  onClose: () => void;
}

interface OpportunityProduct {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  commission_unit: number;
  available_locations: string[];
  closest_location?: string;
}

export default function CreateOpportunityDialog({ onClose }: CreateOpportunityDialogProps) {
  const { data: representative } = useCurrentRepresentative();
  const { data: clients = [] } = useRepClients(representative?.id || '');
  const { data: products = [] } = useGroupedProductsForSales();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    probability: '50',
    payment_method: '',
    delivery_method: ''
  });

  const [selectedClient, setSelectedClient] = useState<RepClient | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OpportunityProduct[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'products' | 'conditions' | 'review'>('basic');

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, client_id: clientId }));
    
    // Recalculate product proximities when client changes
    if (client && selectedProducts.length > 0) {
      updateProductProximities(client);
    }
  };

  const updateProductProximities = (client: RepClient) => {
    if (!client.city || !client.state) return;

    setSelectedProducts(prev => prev.map(item => {
      const product = products.find(p => p.sku === item.sku);
      if (!product) return item;

      // Find closest location based on same city/state
      const sameStateLocations = product.all_items.filter(
        inv => inv.state === client.state
      );
      
      const sameCityLocations = sameStateLocations.filter(
        inv => inv.city === client.city
      );

      let closestLocation = '';
      if (sameCityLocations.length > 0) {
        closestLocation = `${sameCityLocations[0].city}, ${sameCityLocations[0].state}`;
      } else if (sameStateLocations.length > 0) {
        closestLocation = `${sameStateLocations[0].city}, ${sameStateLocations[0].state}`;
      } else if (product.all_items.length > 0) {
        closestLocation = `${product.all_items[0].city}, ${product.all_items[0].state}`;
      }

      return {
        ...item,
        closest_location: closestLocation
      };
    }));
  };

  const addProduct = (product: GroupedProduct) => {
    const existingIndex = selectedProducts.findIndex(p => p.sku === product.sku);
    
    if (existingIndex >= 0) {
      // Update quantity
      setSelectedProducts(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new product
      const locations = [...new Set(
        product.all_items.map(item => `${item.city}, ${item.state}`)
      )];
      
      let closestLocation = '';
      if (selectedClient && selectedClient.city && selectedClient.state) {
        // Logic for finding closest location (same as updateProductProximities)
        const sameStateItems = product.all_items.filter(
          inv => inv.state === selectedClient.state
        );
        
        const sameCityItems = sameStateItems.filter(
          inv => inv.city === selectedClient.city
        );

        if (sameCityItems.length > 0) {
          closestLocation = `${sameCityItems[0].city}, ${sameCityItems[0].state}`;
        } else if (sameStateItems.length > 0) {
          closestLocation = `${sameStateItems[0].city}, ${sameStateItems[0].state}`;
        } else if (product.all_items.length > 0) {
          closestLocation = `${product.all_items[0].city}, ${product.all_items[0].state}`;
        }
      }

      const newProduct: OpportunityProduct = {
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unit_price: product.main_item.client_price,
        commission_unit: product.main_item.commission_unit,
        available_locations: locations,
        closest_location: closestLocation
      };
      
      setSelectedProducts(prev => [...prev, newProduct]);
    }
  };

  const removeProduct = (sku: string) => {
    setSelectedProducts(prev => prev.filter(p => p.sku !== sku));
  };

  const updateProductQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(sku);
      return;
    }
    
    setSelectedProducts(prev => prev.map(item => 
      item.sku === sku ? { ...item, quantity } : item
    ));
  };

  const calculateTotals = useMemo(() => {
    const total_value = selectedProducts.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );
    const total_commission = selectedProducts.reduce(
      (sum, item) => sum + (item.quantity * item.commission_unit), 0
    );
    
    return { total_value, total_commission };
  }, [selectedProducts]);

  const generatePDF = () => {
    console.log('Generating PDF with data:', {
      client: selectedClient,
      products: selectedProducts,
      payment: formData.payment_method,
      delivery: formData.delivery_method,
      totals: calculateTotals
    });
    // TODO: Implement PDF generation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'review') {
      console.log('Creating opportunity:', {
        ...formData,
        products: selectedProducts,
        totals: calculateTotals
      });
      generatePDF();
      onClose();
    } else {
      // Move to next step
      const steps = ['basic', 'products', 'conditions', 'review'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1] as any);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return formData.client_id;
      case 'products':
        return selectedProducts.length > 0;
      case 'conditions':
        return formData.payment_method && formData.delivery_method;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderBasicStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="client">Cliente</Label>
        <Select value={formData.client_id} onValueChange={handleClientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Empresa:</span>
                <p className="font-medium">{selectedClient.company_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contato:</span>
                <p className="font-medium">{selectedClient.contact_name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cidade:</span>
                <p className="font-medium">{selectedClient.city || 'Não informado'}, {selectedClient.state || ''}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <p className="font-medium">{selectedClient.phone || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <Label htmlFor="probability">Probabilidade (%)</Label>
        <Input
          id="probability"
          type="number"
          min="0"
          max="100"
          value={formData.probability}
          onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva os detalhes da oportunidade..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderProductsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Selecionar Produtos</h3>
        <Badge variant="secondary">
          {selectedProducts.length} produto(s)
        </Badge>
      </div>

      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Produtos Selecionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProducts.map((item, index) => (
              <div key={item.sku} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                  {item.closest_location && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      Mais próximo: {item.closest_location}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    R$ {item.unit_price.toFixed(2)} • Comissão: R$ {item.commission_unit.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateProductQuantity(item.sku, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateProductQuantity(item.sku, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="max-h-64 overflow-y-auto space-y-2">
        <h4 className="font-medium text-sm">Produtos Disponíveis</h4>
        {products.map(product => (
          <Card key={product.sku} className="cursor-pointer hover:bg-muted/50" onClick={() => addProduct(product)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.manufacturer} • {product.total_volume.toFixed(0)}L disponível
                  </div>
                  <div className="text-xs text-green-600">
                    R$ {product.main_item.client_price.toFixed(2)} • {product.locations_count} local(is)
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConditionsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Condições Comerciais</h3>

      <div>
        <Label htmlFor="payment">Forma de Pagamento</Label>
        <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vista">À Vista</SelectItem>
            <SelectItem value="credito">Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="delivery">Método de Entrega</Label>
        <Select value={formData.delivery_method} onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_method: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o método de entrega" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entrega">Entrega</SelectItem>
            <SelectItem value="retirada">Retirada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.payment_method && formData.delivery_method && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Pagamento: <strong>{formData.payment_method === 'vista' ? 'À Vista' : 'Crédito'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Truck className="h-4 w-4" />
              <span>Entrega: <strong>{formData.delivery_method === 'entrega' ? 'Com Entrega' : 'Retirada'}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resumo da Oportunidade</h3>
        <Button type="button" variant="outline" size="sm" onClick={generatePDF}>
          <FileDown className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Cliente:</strong> {selectedClient?.company_name}</div>
          <div><strong>Probabilidade:</strong> {formData.probability}%</div>
          <div><strong>Pagamento:</strong> {formData.payment_method === 'vista' ? 'À Vista' : 'Crédito'}</div>
          <div><strong>Entrega:</strong> {formData.delivery_method === 'entrega' ? 'Com Entrega' : 'Retirada'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Produtos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedProducts.map(item => (
            <div key={item.sku} className="flex justify-between text-sm">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-muted-foreground">{item.quantity} x R$ {item.unit_price.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div>R$ {(item.quantity * item.unit_price).toFixed(2)}</div>
                <div className="text-xs text-green-600">Com. R$ {(item.quantity * item.commission_unit).toFixed(2)}</div>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>R$ {calculateTotals.total_value.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Comissão Total</span>
            <span>R$ {calculateTotals.total_commission.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between text-sm">
        {['Básico', 'Produtos', 'Condições', 'Resumo'].map((step, index) => {
          const stepKeys = ['basic', 'products', 'conditions', 'review'];
          const isActive = stepKeys[index] === currentStep;
          const isCompleted = stepKeys.indexOf(currentStep) > index;
          
          return (
            <div key={step} className={`flex items-center gap-2 ${
              isActive ? 'text-primary font-medium' : 
              isCompleted ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isActive ? 'bg-primary text-primary-foreground' :
                isCompleted ? 'bg-green-600 text-white' : 'bg-muted'
              }`}>
                {index + 1}
              </div>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Step Content */}
      {currentStep === 'basic' && renderBasicStep()}
      {currentStep === 'products' && renderProductsStep()}
      {currentStep === 'conditions' && renderConditionsStep()}
      {currentStep === 'review' && renderReviewStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (currentStep === 'basic') {
              onClose();
            } else {
              const steps = ['basic', 'products', 'conditions', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1] as any);
              }
            }
          }}
        >
          {currentStep === 'basic' ? 'Cancelar' : 'Voltar'}
        </Button>
        
        <Button 
          type="submit" 
          disabled={!canProceed()}
        >
          {currentStep === 'review' ? 'Enviar Oportunidade' : 'Próximo'}
        </Button>
      </div>
    </form>
  );
}