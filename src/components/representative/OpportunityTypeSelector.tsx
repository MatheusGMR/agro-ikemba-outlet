import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Calculator, FileText } from 'lucide-react';

interface OpportunityTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectSimulation: () => void;
  onSelectProposal: () => void;
}

export default function OpportunityTypeSelector({
  open,
  onClose,
  onSelectSimulation,
  onSelectProposal
}: OpportunityTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            O que você deseja fazer?
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Opção Simulação */}
            <Card 
              className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
              onClick={onSelectSimulation}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Simulação</h3>
                  <p className="text-sm text-muted-foreground">
                    Calcule preços e fretes rapidamente sem criar proposta formal
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Opção Proposta */}
            <Card 
              className="p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
              onClick={onSelectProposal}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Proposta</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie uma proposta formal completa para enviar ao cliente
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
