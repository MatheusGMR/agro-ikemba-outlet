import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calculator, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimulationDialogProps {
  open: boolean;
  onClose: () => void;
  onConvertToProposal?: () => void;
}

export default function SimulationDialog({
  open,
  onClose,
  onConvertToProposal
}: SimulationDialogProps) {
  const [step, setStep] = useState(1);

  const handleConvertToProposal = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A conversão para proposta estará disponível em breve.",
    });
    if (onConvertToProposal) {
      onConvertToProposal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulação Rápida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Placeholder para funcionalidade futura */}
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Simulador em Desenvolvimento
            </h3>
            <p className="text-muted-foreground mb-6">
              Esta funcionalidade está sendo construída e estará disponível em breve.
              <br />
              Por enquanto, você pode criar uma proposta formal diretamente.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>
                Voltar
              </Button>
              <Button onClick={handleConvertToProposal}>
                <FileText className="h-4 w-4 mr-2" />
                Criar Proposta
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
