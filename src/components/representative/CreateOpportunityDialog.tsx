import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import { useRepClients } from '@/hooks/useRepresentative';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import ProductLocationSelector from './ProductLocationSelector';
import { PDFGenerator } from '@/utils/pdfGenerator';
import { RepresentativeService } from '@/services/representativeService';
import type { RepClient } from '@/types/representative';
import type { GroupedProduct } from '@/types/inventory';
import { MapPin, Package, DollarSign, FileText, Plus, Minus, Info, CheckCircle, Copy, Loader2 } from 'lucide-react';

interface CreateOpportunityDialogProps {
  onClose: () => void;
}

interface LocationSelection {
  city: string;
  state: string;
  quantity: number;
  available_volume: number;
}

interface OpportunityProduct {
  sku: string;
  name: string;
  preco_unitario: number;
  commission_unit: number;
  available_locations: string[];
  selectedLocations: LocationSelection[];
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

  const [responsibleData, setResponsibleData] = useState({
    name: '',
    cpf: '',
    position: '',
    email: '',
    phone: ''
  });

  const [selectedClient, setSelectedClient] = useState<RepClient | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OpportunityProduct[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'products' | 'conditions' | 'responsible' | 'review'>('basic');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedProductForLocation, setSelectedProductForLocation] = useState<GroupedProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposalResult, setProposalResult] = useState<{
    proposal_number: string;
    proposal_url: string;
    public_link: string;
  } | null>(null);

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
    setSelectedProductForLocation(product);
    setShowLocationSelector(true);
  };

  const handleLocationSelection = (locations: any[]) => {
    if (!selectedProductForLocation) return;

    const product = selectedProductForLocation;
    const existingIndex = selectedProducts.findIndex(p => p.sku === product.sku);
    
    if (existingIndex >= 0) {
      // Update existing product
      setSelectedProducts(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { 
              ...item, 
              selectedLocations: locations.map(loc => ({
                city: loc.city,
                state: loc.state,
                quantity: loc.quantity,
                available_volume: loc.available_volume
              }))
            }
          : item
      ));
    } else {
      // Add new product
      const availableLocations = [...new Set(
        product.all_items.map(item => `${item.city}, ${item.state}`)
      )];

      let closestLocation = '';
      if (selectedClient && selectedClient.city && selectedClient.state) {
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
        preco_unitario: product.main_item.preco_unitario,
        commission_unit: product.main_item.commission_unit,
        available_locations: availableLocations,
        selectedLocations: locations.map(loc => ({
          city: loc.city,
          state: loc.state,
          quantity: loc.quantity,
          available_volume: loc.available_volume
        })),
        closest_location: closestLocation
      };
      
      setSelectedProducts(prev => [...prev, newProduct]);
    }
    
    setSelectedProductForLocation(null);
  };

  const removeProduct = (sku: string) => {
    setSelectedProducts(prev => prev.filter(p => p.sku !== sku));
  };

  const updateProductQuantity = (sku: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(sku);
      return;
    }
    
    setSelectedProducts(prev => prev.map(item => {
      if (item.sku !== sku) return item;
      
      // Update first location quantity
      const updatedLocations = [...item.selectedLocations];
      if (updatedLocations.length > 0) {
        updatedLocations[0] = { ...updatedLocations[0], quantity: newQuantity };
      }
      
      return { ...item, selectedLocations: updatedLocations };
    }));
  };

  const calculateTotals = useMemo(() => {
    const totalValue = selectedProducts.reduce((sum, item) => {
      const itemTotal = item.selectedLocations.reduce((itemSum, loc) => 
        itemSum + (loc.quantity * item.preco_unitario), 0);
      return sum + itemTotal;
    }, 0);
    
    const totalCommission = selectedProducts.reduce((sum, item) => {
      const itemCommission = item.selectedLocations.reduce((itemSum, loc) => 
        itemSum + (loc.quantity * item.commission_unit), 0);
      return sum + itemCommission;
    }, 0);
    
    return { totalValue, totalCommission };
  }, [selectedProducts]);

  const generatePDF = async () => {
    if (!selectedClient) return null;

    try {
      const proposalData = {
        proposal_number: `PROP-${Date.now()}`,
        validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        payment_terms: formData.payment_method === 'vista' ? 'À Vista' : 'Crédito',
        delivery_terms: formData.delivery_method === 'entrega' ? 'Com Entrega' : 'Retirada',
        observations: formData.description
      };

      await PDFGenerator.downloadProposalPDF({
        proposal: proposalData as any,
        client: selectedClient,
        products: selectedProducts,
        totals: {
          total_value: calculateTotals.totalValue,
          total_commission: calculateTotals.totalCommission
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canProceed()) return;

    // Navigate through steps
    if (currentStep === 'basic') {
      setCurrentStep('products');
    } else if (currentStep === 'products') {
      setCurrentStep('conditions');
    } else if (currentStep === 'conditions') {
      setCurrentStep('responsible');
    } else if (currentStep === 'responsible') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      // Final submission
      setIsSubmitting(true);
      
      try {
        if (!representative?.id || !selectedClient) {
          throw new Error('Dados do representante ou cliente não encontrados');
        }

        const { totalValue, totalCommission } = calculateTotals;

        // 1. Create opportunity
        const opportunityData = {
          representative_id: representative.id,
          client_id: formData.client_id,
          title: formData.title || 'Oportunidade sem título',
          description: formData.description,
          estimated_value: totalValue,
          estimated_commission: totalCommission,
          probability: parseInt(formData.probability),
          stage: 'proposta_apresentada' as const,
          status: 'active' as const
        };

        const opportunity = await RepresentativeService.createOpportunity(opportunityData);
        console.log('Oportunidade criada:', opportunity.id);

        // 2. Add opportunity items
        for (const product of selectedProducts) {
          for (const location of product.selectedLocations) {
            await RepresentativeService.addOpportunityItem({
              opportunity_id: opportunity.id,
              product_sku: product.sku,
              product_name: product.name,
              quantity: location.quantity,
              unit_price: product.preco_unitario,
              total_price: location.quantity * product.preco_unitario,
              commission_unit: product.commission_unit,
              total_commission: location.quantity * product.commission_unit
            });
          }
        }

        // 3. Create proposal
        const validityDate = new Date();
        validityDate.setDate(validityDate.getDate() + 30); // 30 days validity

        const proposalData = {
          opportunity_id: opportunity.id,
          total_value: totalValue,
          total_commission: totalCommission,
          shipping_cost: 0,
          payment_terms: formData.payment_method,
          delivery_terms: formData.delivery_method,
          validity_date: validityDate.toISOString().split('T')[0],
          observations: formData.description,
          status: 'draft' as const
        };

        const proposal = await RepresentativeService.createProposal(proposalData);
        console.log('Proposta criada:', proposal.id);

        // 4. Send proposal link
        const sendData = {
          proposal_id: proposal.id,
          responsible_name: responsibleData.name,
          responsible_cpf: responsibleData.cpf,
          responsible_position: responsibleData.position,
          responsible_email: responsibleData.email,
          responsible_phone: responsibleData.phone,
          client_email: selectedClient.email,
          client_phone: selectedClient.phone,
          send_method: 'both' as const // Send via both email and whatsapp if available
        };

        const result = await RepresentativeService.sendProposalLink(sendData);
        
        if (result.success) {
          setProposalResult({
            proposal_number: result.proposal_number!,
            proposal_url: result.proposal_url!,
            public_link: result.public_link!
          });
          setShowSuccessModal(true);
        } else {
          throw new Error('Erro ao enviar proposta: ' + result.error);
        }

      } catch (error: any) {
        console.error('Erro ao criar oportunidade:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar oportunidade",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return formData.client_id && formData.probability;
      case 'products':
        return selectedProducts.length > 0 && selectedProducts.every(p => 
          p.selectedLocations.length > 0 && p.selectedLocations.every(l => l.quantity > 0)
        );
      case 'conditions':
        return formData.payment_method && formData.delivery_method;
      case 'responsible':
        return responsibleData.name && responsibleData.cpf && responsibleData.position;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderBasicStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título da Oportunidade</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Proposta para safra de soja 2024"
        />
      </div>

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
                  {item.selectedLocations && item.selectedLocations.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {item.selectedLocations.map((loc, locIndex) => (
                        <div key={locIndex} className="flex items-center gap-1 text-xs text-green-600">
                          <MapPin className="h-3 w-3" />
                          {loc.city}, {loc.state}: {loc.quantity.toLocaleString()}L
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    R$ {item.preco_unitario.toFixed(2)} • Comissão: R$ {item.commission_unit.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(item.sku)}
                  >
                    <Minus className="h-3 w-3" />
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
                  <div className="font-medium text-sm">{product.active_ingredient || product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.manufacturer} • {product.total_volume.toFixed(0)}L disponível
                  </div>
                  <div className="text-xs text-green-600">
                    R$ {product.main_item.preco_unitario.toFixed(2)} • {product.locations_count} local(is)
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
    </div>
  );

  const renderResponsibleStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Dados do Responsável pela Aprovação</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Informe os dados da pessoa responsável por aprovar esta proposta na empresa cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsible_name">Nome Completo *</Label>
          <Input
            id="responsible_name"
            value={responsibleData.name}
            onChange={(e) => setResponsibleData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome completo do responsável"
            required
          />
        </div>

        <div>
          <Label htmlFor="responsible_cpf">CPF *</Label>
          <Input
            id="responsible_cpf"
            value={responsibleData.cpf}
            onChange={(e) => setResponsibleData(prev => ({ ...prev, cpf: e.target.value }))}
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div>
          <Label htmlFor="responsible_position">Cargo/Função *</Label>
          <Input
            id="responsible_position"
            value={responsibleData.position}
            onChange={(e) => setResponsibleData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="Ex: Gerente, Diretor, Proprietário"
            required
          />
        </div>

        <div>
          <Label htmlFor="responsible_email">Email</Label>
          <Input
            id="responsible_email"
            type="email"
            value={responsibleData.email}
            onChange={(e) => setResponsibleData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@empresa.com"
          />
        </div>

        <div>
          <Label htmlFor="responsible_phone">Telefone/WhatsApp</Label>
          <Input
            id="responsible_phone"
            value={responsibleData.phone}
            onChange={(e) => setResponsibleData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Como funciona o processo de aprovação:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Um link único será enviado para o responsável</li>
                <li>• Ele poderá revisar todos os detalhes da proposta</li>
                <li>• A aprovação será feita de forma digital e segura</li>
                <li>• Você será notificado sobre o status da proposta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resumo da Proposta</h3>
        <Button type="button" variant="outline" size="sm" onClick={generatePDF}>
          <FileText className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Título:</strong> {formData.title}</div>
          <div><strong>Cliente:</strong> {selectedClient?.company_name}</div>
          <div><strong>Responsável:</strong> {responsibleData.name} ({responsibleData.position})</div>
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
          {selectedProducts.map(item => {
            const totalQuantity = item.selectedLocations.reduce((sum, loc) => sum + loc.quantity, 0);
            const totalPrice = totalQuantity * item.preco_unitario;
            const totalCommission = totalQuantity * item.commission_unit;
            
            return (
              <div key={item.sku} className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">{totalQuantity.toLocaleString()}L x R$ {item.preco_unitario.toFixed(2)}</div>
                  {item.selectedLocations.map((loc, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      {loc.city}, {loc.state}: {loc.quantity.toLocaleString()}L
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div>R$ {totalPrice.toFixed(2)}</div>
                  <div className="text-xs text-green-600">Com. R$ {totalCommission.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>R$ {calculateTotals.totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Comissão Total</span>
            <span>R$ {calculateTotals.totalCommission.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between text-sm">
        {['Básico', 'Produtos', 'Condições', 'Responsável', 'Resumo'].map((step, index) => {
          const stepKeys = ['basic', 'products', 'conditions', 'responsible', 'review'];
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
              <span className="hidden sm:inline">{step}</span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Step Content */}
      {currentStep === 'basic' && renderBasicStep()}
      {currentStep === 'products' && renderProductsStep()}
      {currentStep === 'conditions' && renderConditionsStep()}
      {currentStep === 'responsible' && renderResponsibleStep()}
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
              const steps = ['basic', 'products', 'conditions', 'responsible', 'review'];
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
          disabled={!canProceed() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            currentStep === 'review' ? 'Enviar Proposta' : 'Próximo'
          )}
        </Button>
      </div>

      {/* Product Location Selector Dialog */}
      {selectedProductForLocation && (
        <ProductLocationSelector
          open={showLocationSelector}
          onOpenChange={setShowLocationSelector}
          product={selectedProductForLocation}
          client={selectedClient}
          onConfirm={handleLocationSelection}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && proposalResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                Proposta Enviada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Proposta <strong>{proposalResult.proposal_number}</strong> enviada com sucesso!
                </p>
                <p className="text-sm">
                  O cliente receberá um link para revisar e aprovar a proposta.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground mb-1">Link da Proposta:</p>
                <p className="text-sm font-mono break-all">{proposalResult.proposal_url}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(proposalResult.proposal_url);
                    toast({ title: "Link copiado!" });
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar Link
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </form>
  );
}