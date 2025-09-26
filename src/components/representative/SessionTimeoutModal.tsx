import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onClose: () => void;
}

export function SessionTimeoutModal({ 
  isOpen, 
  timeRemaining, 
  onExtendSession, 
  onClose 
}: SessionTimeoutModalProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Sua sessão expirará em breve
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sua sessão será encerrada automaticamente em <strong>{formatTime(timeRemaining)}</strong> por inatividade.
            Clique em "Continuar sessão" para permanecer conectado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Sair agora
          </Button>
          <Button onClick={onExtendSession}>
            Continuar sessão
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}