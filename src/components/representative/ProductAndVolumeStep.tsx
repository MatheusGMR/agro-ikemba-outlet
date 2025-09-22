import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Package, AlertCircle, Check } from 'lucide-react';
import { validateVolume } from '@/utils/validators';
import { toast } from 'sonner';

interface ProductVolumeData {
  volume: string;
  observacoes: string;
}

interface ProductAndVolumeStepProps {
  products: string[];
  volumeData: Record<string, ProductVolumeData>;
  onProductsChange: (products: string[]) => void;
  onVolumeDataChange: (data: Record<string, ProductVolumeData>) => void;
  className?: string;
}

export function ProductAndVolumeStep({ 
  products, 
  volumeData, 
  onProductsChange, 
  onVolumeDataChange, 
  className 
}: ProductAndVolumeStepProps) {
  const [newProduct, setNewProduct] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const addProduct = () => {
    const trimmedProduct = newProduct.trim();
    
    if (!trimmedProduct) {
      toast.error('Digite o nome do produto');
      return;
    }
    
    if (products.includes(trimmedProduct)) {
      toast.error('Este produto já foi adicionado');
      return;
    }
    
    // Adicionar produto e criar dados de volume em branco
    const newProducts = [...products, trimmedProduct];
    const newVolumeData = {
      ...volumeData,
      [trimmedProduct]: { volume: '', observacoes: '' }
    };
    
    onProductsChange(newProducts);
    onVolumeDataChange(newVolumeData);
    setNewProduct('');
    setExpandedProduct(trimmedProduct); // Expandir automaticamente
    toast.success(`Produto "${trimmedProduct}" adicionado!`);
  };

  const removeProduct = (productToRemove: string) => {
    const newProducts = products.filter(p => p !== productToRemove);
    const newVolumeData = { ...volumeData };
    delete newVolumeData[productToRemove];
    
    onProductsChange(newProducts);
    onVolumeDataChange(newVolumeData);
    
    if (expandedProduct === productToRemove) {
      setExpandedProduct(null);
    }
    
    toast.success('Produto removido');
  };

  const updateProductVolume = (product: string, field: keyof ProductVolumeData, value: string) => {
    const newVolumeData = {
      ...volumeData,
      [product]: {
        ...volumeData[product],
        [field]: value
      }
    };
    onVolumeDataChange(newVolumeData);
  };

  const getProductStatus = (product: string) => {
    const data = volumeData[product];
    if (!data?.volume.trim()) return 'empty';
    if (!validateVolume(data.volume)) return 'error';
    return 'valid';
  };

  const validProducts = products.filter(p => getProductStatus(p) === 'valid');
  const hasValidProducts = validProducts.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Input para novo produto */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Adicionar Produtos</h3>
                <p className="text-sm text-muted-foreground">
                  Digite os produtos que você comercializa e configure os volumes
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Glifosato, 2,4D, Atrazina..."
                className="flex-1"
              />
              <Button 
                onClick={addProduct}
                disabled={!newProduct.trim()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de produtos com volumes */}
        {products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Produtos e Volumes ({products.length})
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={hasValidProducts ? "default" : "secondary"}>
                  {validProducts.length}/{products.length} com volume
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {products.map((product) => {
                const status = getProductStatus(product);
                const data = volumeData[product] || { volume: '', observacoes: '' };
                const isExpanded = expandedProduct === product;
                const hasError = status === 'error';
                
                return (
                  <Card key={product} className={`transition-all ${hasError ? 'border-red-200' : status === 'valid' ? 'border-green-200' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status === 'valid' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-muted'}`}>
                            <Package className={`w-4 h-4 ${status === 'valid' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{product}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {status === 'valid' && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <Check className="w-3 h-3" />
                                  Volume: {data.volume}
                                </div>
                              )}
                              {status === 'error' && (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  Volume inválido
                                </div>
                              )}
                              {status === 'empty' && (
                                <span className="text-xs text-muted-foreground">
                                  Volume não configurado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedProduct(isExpanded ? null : product)}
                            className="text-xs"
                          >
                            {isExpanded ? 'Ocultar' : 'Configurar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(product)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0 space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label htmlFor={`volume-${product}`}>Volume Aproximado Anual *</Label>
                          <Input
                            id={`volume-${product}`}
                            value={data.volume}
                            onChange={(e) => updateProductVolume(product, 'volume', e.target.value)}
                            placeholder="Ex: 30.000, 50000, 25,5"
                            className={hasError ? 'border-red-500' : status === 'valid' ? 'border-green-500' : ''}
                          />
                          {hasError && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                              <AlertCircle className="w-4 h-4" />
                              Volume deve ser um número válido (ex: 30000, 30.000, 30,5)
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Use unidades como L (litros), Kg (quilogramas), ou números absolutos
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`obs-${product}`}>Observações (opcional)</Label>
                          <Textarea
                            id={`obs-${product}`}
                            value={data.observacoes}
                            onChange={(e) => updateProductVolume(product, 'observacoes', e.target.value)}
                            placeholder="Informações adicionais sobre este produto..."
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {products.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Nenhum produto adicionado ainda
            </p>
            <p className="text-sm text-muted-foreground">
              Comece digitando o nome de um produto acima
            </p>
          </div>
        )}

        {/* Resumo */}
        {products.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{products.length}</div>
                  <div className="text-sm text-muted-foreground">Produtos Adicionados</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${hasValidProducts ? 'text-green-600' : 'text-amber-600'}`}>
                    {validProducts.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Com Volume Configurado</div>
                </div>
              </div>
              
              {!hasValidProducts && products.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Configure o volume para pelo menos um produto para continuar
                  </span>
                </div>
              )}
              
              {hasValidProducts && (
                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Produtos configurados! Você pode continuar para o próximo passo.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}