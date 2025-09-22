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
          <DialogTitle>Termos de Parceria e Política de Comissão</DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente os termos completos antes de aceitar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea 
          className="flex-1 pr-4" 
          onScrollCapture={handleScroll}
        >
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. POLÍTICA DE COMISSÃO</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• A comissão é calculada sobre a taxa da plataforma nas vendas efetivamente liquidadas</p>
                <p>• O percentual de comissão será definido conforme o perfil do representante e performance</p>
                <p>• Pagamento mensal mediante apresentação de nota fiscal de prestação de serviços</p>
                <p>• Pode haver indicativos de indicação (sobre vendas de profissionais indicados), conforme regras específicas</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. OBRIGAÇÕES DO REPRESENTANTE</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Seguir rigorosamente os preços e regras da listagem oficial da plataforma</p>
                <p>• Não alterar condições comerciais sem autorização prévia</p>
                <p>• Cumprir as boas práticas de relacionamento com clientes</p>
                <p>• Manter absoluta confidencialidade sobre informações comerciais e estratégicas</p>
                <p>• Representar a marca de forma profissional e ética</p>
                <p>• Participar de treinamentos e capacitações quando solicitado</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. REGRAS DE CONDUTA</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Proibida a utilização de práticas comerciais desleais ou antiéticas</p>
                <p>• Vedado o contato direto com fornecedores sem autorização</p>
                <p>• Obrigatório o uso dos canais oficiais para comunicação</p>
                <p>• Respeitar os territórios e clientes de outros representantes</p>
                <p>• Manter atualização constante do pipeline de oportunidades</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. CONDIÇÕES DE PAGAMENTO</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Comissões são pagas mensalmente até o 5º dia útil do mês subsequente</p>
                <p>• Necessário emissão de nota fiscal de prestação de serviços</p>
                <p>• Retenção de impostos conforme legislação vigente</p>
                <p>• Comissões só são liberadas após confirmação de recebimento pelo cliente final</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. POLÍTICA DE LGPD</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Seus dados pessoais serão utilizados exclusivamente para:</p>
                <p className="ml-4">- Análise e aprovação do cadastro como representante</p>
                <p className="ml-4">- Auditoria e controle de performance</p>
                <p className="ml-4">- Comunicação oficial relacionada à parceria</p>
                <p className="ml-4">- Cumprimento de obrigações legais e contratuais</p>
                <p>• Os dados serão mantidos pelo período necessário para cumprimento dos objetivos</p>
                <p>• Você tem direito de acesso, correção, exclusão e portabilidade dos seus dados</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. RESCISÃO</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Qualquer das partes pode rescindir a parceria mediante aviso prévio de 30 dias</p>
                <p>• Em caso de descumprimento das regras, a rescisão pode ser imediata</p>
                <p>• Comissões pendentes serão pagas conforme cronograma estabelecido</p>
                <p>• Obrigação de confidencialidade permanece após rescisão</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. DISPOSIÇÕES GERAIS</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Este documento pode ser atualizado mediante comunicação prévia</p>
                <p>• Eventuais conflitos serão resolvidos por arbitragem</p>
                <p>• Foro da comarca de São Paulo para questões judiciais</p>
                <p>• A parceria não gera vínculo empregatício</p>
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