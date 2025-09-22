import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledToEnd = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    
    if (isScrolledToEnd && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
    setHasScrolledToEnd(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setHasScrolledToEnd(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Consentimento LGPD e Informações</DialogTitle>
          <DialogDescription>
            Por favor, leia as informações sobre uso dos dados e próximos passos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea 
          className="flex-1 pr-4" 
          onScrollCapture={handleScroll}
        >
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">Uso dos Dados Pessoais (LGPD)</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Seus dados pessoais serão utilizados exclusivamente para:</p>
                <p className="ml-4">- Análise e aprovação do cadastro como representante</p>
                <p className="ml-4">- Comunicação oficial relacionada à parceria</p>
                <p className="ml-4">- Controle de performance e comissionamento</p>
                <p className="ml-4">- Cumprimento de obrigações legais</p>
                <p>• Os dados serão mantidos pelo período necessário para cumprimento dos objetivos</p>
                <p>• Você tem direito de acesso, correção, exclusão e portabilidade dos seus dados</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">Documentação Complementar</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Após a aprovação da sua inscrição, nossa equipe entrará em contato para:</p>
                <p className="ml-4">- Coleta de documentos complementares</p>
                <p className="ml-4">- Apresentação dos termos comerciais</p>
                <p className="ml-4">- Treinamento sobre produtos e plataforma</p>
                <p className="ml-4">- Configuração do seu acesso como representante</p>
                <p>• A documentação será solicitada de acordo com as normas vigentes</p>
              </div>
            </section>

            {!hasScrolledToEnd && (
              <div className="flex justify-center py-4">
                <p className="text-xs text-muted-foreground animate-pulse">
                  Role até o final para habilitar o botão "Aceitar"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasScrolledToEnd}
            className="min-w-[120px]"
          >
            {hasScrolledToEnd ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aceitar Termos
              </>
            ) : (
              "Leia até o final"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}