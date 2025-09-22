import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consentimento LGPD e Próximos Passos</DialogTitle>
          <DialogDescription>
            Consentimento para uso dos dados pessoais e informações sobre a documentação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold text-base mb-2">Uso dos Dados Pessoais (LGPD)</h3>
            <div className="text-muted-foreground space-y-1">
              <p>Seus dados pessoais serão utilizados exclusivamente para análise e aprovação do cadastro, comunicação oficial e controle de performance.</p>
              <p>Você tem direito de acesso, correção, exclusão e portabilidade dos seus dados.</p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">Documentação Futura</h3>
            <div className="text-muted-foreground">
              <p>Após aprovação, nossa equipe solicitará documentos complementares e apresentará os termos comerciais.</p>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleAccept} className="min-w-[120px]">
            <CheckCircle className="w-4 h-4 mr-2" />
            Aceitar Termos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}