import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PersonJuridicaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (hasActivePJ: boolean, confirmed?: boolean) => void;
}

export function PersonJuridicaPopup({ isOpen, onClose, onResponse }: PersonJuridicaPopupProps) {
  const handleAindaNao = () => {
    onResponse(false, false);
    onClose();
  };

  const handleSim = () => {
    onResponse(true, true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirmação de Pessoa Jurídica
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Você tem alguma pessoa jurídica (ex. MEI) aberta em seu nome?
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleAindaNao}
              className="w-full"
            >
              Ainda não
            </Button>
            
            <Button
              onClick={handleSim}
              className="w-full"
            >
              Sim
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Para participar do programa, é necessário ter CNPJ ativo (MEI ou empresa).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}