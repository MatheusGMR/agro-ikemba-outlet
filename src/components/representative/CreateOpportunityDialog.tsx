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
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { operationQueue } from '@/utils/offlineStorage';
import ProductLocationSelector from './ProductLocationSelector';
import { OverpriceSelector } from './OverpriceSelector';
import { PDFGenerator } from '@/utils/pdfGenerator';
import { RepresentativeService } from '@/services/representativeService';
import type { RepClient } from '@/types/representative';
import type { GroupedProduct } from '@/types/inventory';
import { MapPin, Package, DollarSign, FileText, Plus, Minus, Info, CheckCircle, Copy, Loader2, User, WifiOff, TrendingDown, TrendingUp } from 'lucide-react';

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
  preco_afiliado: number;
  preco_unitario: number;
  preco_base?: number;
  overprice_percentage: number;
  overprice_amount: number;
  preco_final: number;
  commission_unit: number;
  overprice_commission: number;
  available_locations: string[];
  selectedLocations: LocationSelection[];
  closest_location?: string;
}

export default function CreateOpportunityDialog({ onClose }: CreateOpportunityDialogProps) {
  const { data: representative } = useCurrentRepresentative();
  const { data: clients = [] } = useRepClients(representative?.id || '');
  const { data: products = [], isLoading: loadingProducts } = useGroupedProductsForSales();
  const { isOnline } = useNetworkStatus();
  
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

  const [contactMode, setContactMode] = useState<'existing' | 'new'>('existing');
  const [updateClientContact, setUpdateClientContact] = useState(false);

  const [selectedClient, setSelectedClient] = useState<RepClient | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OpportunityProduct[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'products' | 'conditions' | 'responsible' | 'review'>('basic');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedProductForLocation, setSelectedProductForLocation] = useState<GroupedProduct | null>(null);
  const [showOverpriceSelector, setShowOverpriceSelector] = useState(false);
  const [pendingProductData, setPendingProductData] = useState<{
    product: GroupedProduct;
    locations: LocationSelection[];
  } | null>(null);
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

    // Reset responsible data and contact mode when client changes
    if (client) {
      populateFromClientContact(client);
    } else {
      setResponsibleData({ name: '', cpf: '', position: '', email: '', phone: '' });
      setContactMode('new');
    }
  };

  const populateFromClientContact = (client: RepClient) => {
    const hasContact = client.contact_name && (client.email || client.phone);
    
    if (hasContact) {
      setResponsibleData({
        name: client.contact_name || '',
        cpf: '',
        position: client.contact_function || '',
        email: client.email || '',
        phone: client.phone || client.whatsapp || ''
      });
      setContactMode('existing');
    } else {
      setContactMode('new');
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
    const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0);
    
    // Store data and open overprice selector
    setPendingProductData({
      product,
      locations: locations.map(loc => ({
        city: loc.city,
        state: loc.state,
        quantity: loc.quantity,
        available_volume: loc.available_volume
      }))
    });
    
    setShowLocationSelector(false);
    setShowOverpriceSelector(true);
  };

  const handleOverpriceConfirm = (overpriceData: { percentage: number; amount: number }) => {
    if (!pendingProductData) return;

    const { product, locations } = pendingProductData;
    const existingIndex = selectedProducts.findIndex(p => p.sku === product.sku);
    
    const precoAfiliado = product.main_item.preco_afiliado || product.main_item.base_price;
    const precoFinal = precoAfiliado + overpriceData.amount;
    
    if (existingIndex >= 0) {
      // Update existing product
      setSelectedProducts(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { 
              ...item,
              preco_afiliado: precoAfiliado,
              preco_unitario: precoAfiliado,
              preco_final: precoFinal,
              overprice_percentage: overpriceData.percentage,
              overprice_amount: overpriceData.amount,
              overprice_commission: overpriceData.amount,
              selectedLocations: locations
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
        preco_afiliado: precoAfiliado,
        preco_unitario: precoAfiliado,
        preco_base: product.main_item.base_price,
        overprice_percentage: overpriceData.percentage,
        overprice_amount: overpriceData.amount,
        preco_final: precoFinal,
        commission_unit: product.main_item.commission_unit ?? 0,
        overprice_commission: overpriceData.amount,
        available_locations: availableLocations,
        selectedLocations: locations,
        closest_location: closestLocation
      };
      
      setSelectedProducts(prev => [...prev, newProduct]);
    }
    
    setShowOverpriceSelector(false);
    setPendingProductData(null);
    setShowLocationSelector(false);
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
        itemSum + (loc.quantity * item.preco_final), 0);
      return sum + itemTotal;
    }, 0);
    
    const totalCommission = selectedProducts.reduce((sum, item) => {
      const itemCommission = item.selectedLocations.reduce((itemSum, loc) => 
        itemSum + (loc.quantity * item.commission_unit), 0);
      return sum + itemCommission;
    }, 0);
    
    const totalOverpriceGain = selectedProducts.reduce((sum, item) => {
      const itemOverprice = item.selectedLocations.reduce((itemSum, loc) => 
        itemSum + (loc.quantity * item.overprice_amount), 0);
      return sum + itemOverprice;
    }, 0);
    
    const totalGain = totalCommission + totalOverpriceGain;
    
    return { 
      totalValue, 
      totalCommission,
      totalOverpriceGain,
      totalGain
    };
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

        // Generate intelligent title based on context
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        let period = '';
        if (month >= 10 || month <= 3) {
          period = `Safra ${month >= 10 ? year : year-1}/${month >= 10 ? year+1 : year}`;
        } else {
          period = `${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
        }
        
        let autoTitle = '';
        if (selectedProducts.length === 1) {
          autoTitle = `${selectedProducts[0].name} - ${period}`;
        } else if (selectedProducts.length > 1) {
          const categories = [...new Set(selectedProducts.map(p => 
            p.name.includes('HERBICIDA') ? 'Herbicidas' :
            p.name.includes('FUNGICIDA') ? 'Fungicidas' :
            p.name.includes('INSETICIDA') ? 'Inseticidas' :
            'Insumos'
          ))];
          autoTitle = `${categories.join(' + ')} - ${period}`;
        } else {
          autoTitle = `Proposta - ${period}`;
        }

        // If offline, save to queue
        if (!isOnline) {
          const items = selectedProducts.flatMap(product =>
            product.selectedLocations.map(location => ({
              product_sku: product.sku,
              product_name: product.name,
              quantity: location.quantity,
              unit_price: product.preco_final,
              total_price: location.quantity * product.preco_final,
              commission_unit: product.commission_unit,
              total_commission: location.quantity * product.commission_unit,
              overprice_percentage: product.overprice_percentage,
              overprice_amount: product.overprice_amount
            }))
          );

          await operationQueue.add({
            type: 'opportunity',
            data: {
              representative_id: representative.id,
              client_id: formData.client_id,
              title: autoTitle,
              description: formData.description,
              stage: 'proposta_apresentada',
              estimated_value: totalValue,
              estimated_commission: totalCommission,
              items
            }
          });

          toast({
            title: "Salvo para envio posterior",
            description: "A oportunidade será enviada automaticamente quando você estiver online.",
          });

          // Reset form
          setCurrentStep('basic');
          setFormData({
            title: '',
            description: '',
            client_id: '',
            probability: '50',
            payment_method: '',
            delivery_method: ''
          });
          setSelectedProducts([]);
          setSelectedClient(null);
          setResponsibleData({ name: '', cpf: '', position: '', email: '', phone: '' });
          setContactMode('existing');
          setUpdateClientContact(false);
          setIsSubmitting(false);
          onClose();
          return;
        }
          
        // Online flow - create opportunity
        const opportunityData = {
          representative_id: representative.id,
          client_id: formData.client_id,
          title: autoTitle,
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
              unit_price: product.preco_final,
              total_price: location.quantity * product.preco_final,
              commission_unit: product.commission_unit,
              total_commission: location.quantity * product.commission_unit,
              overprice_percentage: product.overprice_percentage,
              overprice_amount: product.overprice_amount
            });
          }
        }

        // 3. Create proposal with inventory reservations
        const validityDate = new Date();
        validityDate.setDate(validityDate.getDate() + 30); // 30 days validity

        // Flatten products with locations into items
        const items = selectedProducts.flatMap(product =>
          product.selectedLocations.map(loc => ({
            product_sku: product.sku,
            product_name: product.name,
            quantity: loc.quantity,
            city: loc.city,
            state: loc.state,
            unit_price: product.preco_final,
            total_price: loc.quantity * product.preco_final,
            commission_unit: product.commission_unit,
            total_commission: loc.quantity * product.commission_unit,
            overprice_percentage: product.overprice_percentage,
            overprice_amount: product.overprice_amount
          }))
        );

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

        // Create proposal with automatic inventory reservations
        const proposal = await RepresentativeService.createProposalWithReservation(
          proposalData,
          items
        );
        console.log('Proposta criada com reservas:', proposal.id);

        // 4. Atualizar contato do cliente se necessário
        if (contactMode === 'new' && updateClientContact && selectedClient) {
          try {
            await RepresentativeService.updateClientContact(selectedClient.id, {
              contact_name: responsibleData.name,
              contact_function: responsibleData.position,
              email: responsibleData.email,
              phone: responsibleData.phone,
              whatsapp: responsibleData.phone
            });
          } catch (error) {
            console.warn('Erro ao atualizar contato do cliente:', error);
          }
        }

        // 5. Send proposal link
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
          // Reset form after successful creation
          setCurrentStep('basic');
          setFormData({
            title: '',
            description: '',
            client_id: '',
            probability: '50',
            payment_method: '',
            delivery_method: ''
          });
          setSelectedProducts([]);
          setSelectedClient(null);
          setResponsibleData({ name: '', cpf: '', position: '', email: '', phone: '' });
          setContactMode('existing');
          setUpdateClientContact(false);
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
                    R$ {product.main_item.base_price.toFixed(2)} • {product.locations_count} local(is)
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

  const renderResponsibleStep = () => {
    const hasExistingContact = selectedClient && selectedClient.contact_name && (selectedClient.email || selectedClient.phone);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Dados do Responsável pela Aprovação</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Informe os dados da pessoa responsável por aprovar esta proposta na empresa cliente.
          </p>
        </div>

        {hasExistingContact && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 mb-2">Contato Principal Cadastrado</p>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Nome:</strong> {selectedClient.contact_name}</p>
                    <p><strong>Função:</strong> {selectedClient.contact_function || 'Não informado'}</p>
                    <p><strong>Email:</strong> {selectedClient.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {selectedClient.phone || selectedClient.whatsapp || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <Label>Selecione uma opção:</Label>
            <div className="space-y-2 mt-2">
              {hasExistingContact && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing"
                    name="contactMode"
                    value="existing"
                    checked={contactMode === 'existing'}
                    onChange={() => {
                      setContactMode('existing');
                      populateFromClientContact(selectedClient!);
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="existing" className="text-sm font-normal cursor-pointer">
                    Usar contato principal cadastrado
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new"
                  name="contactMode"
                  value="new"
                  checked={contactMode === 'new'}
                  onChange={() => {
                    setContactMode('new');
                    setResponsibleData({ name: '', cpf: '', position: '', email: '', phone: '' });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="new" className="text-sm font-normal cursor-pointer">
                  {hasExistingContact ? 'Informar outro responsável/aprovador' : 'Informar responsável/aprovador'}
                </Label>
              </div>
            </div>
          </div>

          {contactMode === 'new' && hasExistingContact && (
            <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <input
                type="checkbox"
                id="updateClient"
                checked={updateClientContact}
                onChange={(e) => setUpdateClientContact(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="updateClient" className="text-sm font-normal cursor-pointer text-yellow-800">
                Atualizar dados do cliente com este novo contato
              </Label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="responsible_name">Nome Completo *</Label>
            <Input
              id="responsible_name"
              value={responsibleData.name}
              onChange={(e) => setResponsibleData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo do responsável"
              disabled={Boolean(contactMode === 'existing' && hasExistingContact)}
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
              disabled={Boolean(contactMode === 'existing' && hasExistingContact && !!selectedClient?.contact_function)}
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
              disabled={Boolean(contactMode === 'existing' && hasExistingContact)}
            />
          </div>

          <div>
            <Label htmlFor="responsible_phone">Telefone/WhatsApp</Label>
            <Input
              id="responsible_phone"
              value={responsibleData.phone}
              onChange={(e) => setResponsibleData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              disabled={Boolean(contactMode === 'existing' && hasExistingContact)}
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
  };

  const renderReviewStep = () => {
    // Calculate total savings
    const totalSavings = selectedProducts.reduce((sum, item) => {
      if (!item.preco_base || item.preco_unitario >= item.preco_base) return sum;
      const totalQuantity = item.selectedLocations.reduce((qSum, loc) => qSum + loc.quantity, 0);
      return sum + ((item.preco_base - item.preco_unitario) * totalQuantity);
    }, 0);

    const hasSavings = totalSavings > 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Resumo da Proposta</h3>
          <Button type="button" variant="outline" size="sm" onClick={generatePDF}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        </div>

        {/* Savings Card - destacado em verde */}
        {hasSavings && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingDown className="h-5 w-5" />
                Economia Total com Preço Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {totalSavings.toFixed(2)}
              </div>
              <p className="text-sm text-green-700 mt-1">
                Economize comparado ao preço médio de mercado
              </p>
            </CardContent>
          </Card>
        )}

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
              const totalPrice = totalQuantity * item.preco_final;
              const totalCommission = totalQuantity * item.commission_unit;
              const itemOverpriceGain = totalQuantity * item.overprice_amount;
              const itemTotalGain = totalCommission + itemOverpriceGain;
              
              // Calculate savings for this product
              const itemSavings = item.preco_base && item.preco_final < item.preco_base
                ? (item.preco_base - item.preco_final) * totalQuantity
                : 0;
              const savingsPercentage = item.preco_base && item.preco_final < item.preco_base
                ? ((item.preco_base - item.preco_final) / item.preco_base) * 100
                : 0;
              
              return (
                <Card key={item.sku} className="border-2 border-green-100 bg-gradient-to-br from-white to-green-50/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Nome e Info do Produto */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-primary">{item.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {totalQuantity.toLocaleString()}L • {item.selectedLocations.length} {item.selectedLocations.length > 1 ? 'localidades' : 'localidade'}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Seu Ganho
                        </Badge>
                      </div>

                      {/* Preços */}
                      <div className="bg-white/60 p-3 rounded-md border space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preço afiliado:</span>
                          <span className="font-medium">R$ {item.preco_afiliado.toFixed(2)}/L</span>
                        </div>
                        {item.overprice_amount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>+ Margem ({item.overprice_percentage.toFixed(1)}%):</span>
                            <span className="font-semibold">R$ {item.overprice_amount.toFixed(2)}/L</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Preço final ao cliente:</span>
                          <span className="text-primary">R$ {item.preco_final.toFixed(2)}/L</span>
                        </div>
                      </div>

                      {/* Localidades */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        {item.selectedLocations.map((loc, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {loc.city}, {loc.state}: {loc.quantity.toLocaleString()}L
                          </div>
                        ))}
                      </div>

                      {/* Ganhos do Representante */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-md border border-green-200 space-y-2">
                        <div className="text-xs font-semibold text-green-800 mb-2">💰 Seu Ganho neste Produto:</div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Comissão (1,5%):</span>
                            <span className="font-semibold text-green-800">R$ {totalCommission.toFixed(2)}</span>
                          </div>
                          {itemOverpriceGain > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Ganho Margem (100%):</span>
                              <span className="font-semibold text-green-800">R$ {itemOverpriceGain.toFixed(2)}</span>
                            </div>
                          )}
                          <Separator className="bg-green-300" />
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-bold text-green-800">GANHO TOTAL:</span>
                            <span className="text-xl font-bold text-green-600">
                              R$ {itemTotalGain.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cliente economiza */}
                      {itemSavings > 0 && (
                        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                          <Info className="h-3 w-3 inline mr-1" />
                          Cliente economiza R$ {itemSavings.toFixed(2)} ({savingsPercentage.toFixed(1)}%) vs. mercado
                        </div>
                      )}

                      {/* Valor Total do Produto */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium text-muted-foreground">Valor Total Produto:</span>
                        <span className="text-lg font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Valor Total</span>
              <span>R$ {calculateTotals.totalValue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Ganhos - Grande Destaque */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-green-400 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <div className="text-sm font-medium opacity-90 uppercase tracking-wide">
                  Potencial de Ganho Total
                </div>
              </div>
              
              <div className="text-5xl font-bold drop-shadow-md">
                R$ {calculateTotals.totalGain.toFixed(2)}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="text-xs opacity-90 mb-1">Comissão Fixa (1,5%)</div>
                  <div className="text-xl font-bold">R$ {calculateTotals.totalCommission.toFixed(2)}</div>
                </div>
                {calculateTotals.totalOverpriceGain > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-xs opacity-90 mb-1">Ganho Margem (100%)</div>
                    <div className="text-xl font-bold">R$ {calculateTotals.totalOverpriceGain.toFixed(2)}</div>
                  </div>
                )}
              </div>

              <div className="text-xs opacity-90 pt-2 border-t border-white/30">
                💡 Você ganha 1,5% de comissão fixa + 100% da margem aplicada
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Modo offline: As oportunidades serão enviadas automaticamente quando você estiver online
          </span>
        </div>
      )}

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

      {/* Overprice Selector Dialog */}
      {pendingProductData && (
        <OverpriceSelector
          open={showOverpriceSelector}
          onClose={() => {
            setShowOverpriceSelector(false);
            setPendingProductData(null);
          }}
          onConfirm={handleOverpriceConfirm}
          productName={pendingProductData.product.name}
          precoAfiliado={pendingProductData.product.main_item.preco_afiliado || pendingProductData.product.main_item.base_price}
          precoBase={pendingProductData.product.main_item.base_price}
          estimatedVolume={pendingProductData.locations.reduce((sum, loc) => sum + loc.quantity, 0)}
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