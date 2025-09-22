import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProductInputCard } from '@/components/ui/product-input-card';
import { Plus, ArrowRight, Package2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductInputStepProps {
  products: string[];
  onProductsChange: (products: string[]) => void;
  onNext: () => void;
  className?: string;
}

export function ProductInputStep({ products, onProductsChange, onNext, className }: ProductInputStepProps) {
  const [currentProduct, setCurrentProduct] = useState('');

  const addProduct = () => {
    const trimmedProduct = currentProduct.trim();
    
    if (!trimmedProduct) {
      toast.error('Digite o nome do produto');
      return;
    }
    
    if (products.includes(trimmedProduct)) {
      toast.error('Este produto já foi adicionado');
      return;
    }
    
    onProductsChange([...products, trimmedProduct]);
    setCurrentProduct('');
    toast.success(`Produto "${trimmedProduct}" adicionado!`);
  };

  const removeProduct = (productToRemove: string) => {
    onProductsChange(products.filter(p => p !== productToRemove));
    toast.success('Produto removido');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProduct();
    }
  };

  const canProceed = products.length > 0;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Input para novo produto */}
        <div className="space-y-3">
          <Label htmlFor="new-product" className="text-base font-medium">
            Adicione os produtos que você comercializa *
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-product"
              value={currentProduct}
              onChange={(e) => setCurrentProduct(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Glifosato, 2,4D, Atrazina..."
              className="flex-1"
            />
            <Button 
              onClick={addProduct}
              className="shrink-0"
              disabled={!currentProduct.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Digite um produto por vez e clique em "Adicionar" ou pressione Enter
          </p>
        </div>

        {/* Lista de produtos adicionados */}
        {products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Produtos Adicionados ({products.length})
              </Label>
              <div className="text-sm text-muted-foreground">
                {products.length} produto{products.length !== 1 ? 's' : ''} adicionado{products.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {products.map((product, index) => (
                <ProductInputCard
                  key={`${product}-${index}`}
                  product={product}
                  onRemove={() => removeProduct(product)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {products.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <Package2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum produto adicionado ainda
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Comece digitando o nome de um produto acima
            </p>
          </div>
        )}

        {/* Botão para continuar */}
        {canProceed && (
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={onNext}
              className="gap-2"
              size="lg"
            >
              Continuar para Volumes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}