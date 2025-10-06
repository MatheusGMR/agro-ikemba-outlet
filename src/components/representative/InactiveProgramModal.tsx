import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "agroikemba_inactive_program_modal_seen";

export const InactiveProgramModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem(STORAGE_KEY);
    
    if (hasSeenModal) {
      return;
    }

    // Show modal when user scrolls to 70% of the page
    const handleScroll = () => {
      const scrollPercentage = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= 70 && !open) {
        setOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-warning" />
            <DialogTitle className="text-2xl">
              Programa Temporariamente Inativo
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-left space-y-4 pt-4">
            <p>
              Obrigado pelo seu interesse em fazer parte do time AgroIkemba!
            </p>
            <p>
              <strong>Importante:</strong> O programa de representantes técnicos afiliados 
              está temporariamente inativo. Não há processos seletivos em andamento no momento.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Ao preencher o formulário, você:
              </p>
              <ul className="space-y-2 ml-7 text-sm">
                <li>✓ Manifesta seu interesse no programa</li>
                <li>✓ Fica registrado em nossa base de dados</li>
                <li>✓ Será contatado quando o programa for reativado</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Observação:</strong> Não há previsão definida para reabertura do programa. 
              Seu cadastro não garante participação em processos futuros.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button onClick={handleClose} className="flex-1">
            Entendi, quero me cadastrar
          </Button>
          <Button onClick={handleClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
