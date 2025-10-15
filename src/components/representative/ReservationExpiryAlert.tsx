import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservationExpiryAlertProps {
  expiresAt: string;
  reservationStatus?: string;
}

export function ReservationExpiryAlert({ expiresAt, reservationStatus }: ReservationExpiryAlertProps) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Se a reserva foi confirmada, não mostrar alerta
  if (reservationStatus === 'confirmed' || reservationStatus === 'cancelled') {
    return null;
  }
  
  if (hoursLeft <= 0 || reservationStatus === 'expired') {
    return (
      <Alert variant="destructive" className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Reserva Expirada</AlertTitle>
        <AlertDescription>
          Esta proposta perdeu a reserva de estoque. O volume está disponível para outros representantes.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (hoursLeft <= 24) {
    return (
      <Alert className="border-orange-500 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Reserva Expirando em Breve</AlertTitle>
        <AlertDescription className="text-orange-800">
          Esta proposta expira {formatDistanceToNow(expiryDate, { locale: ptBR, addSuffix: true })}.
          Entre em contato com o cliente urgentemente!
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="border-blue-500 bg-blue-50">
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Reserva Ativa</AlertTitle>
      <AlertDescription className="text-blue-800">
        O estoque está reservado até {formatDistanceToNow(expiryDate, { locale: ptBR, addSuffix: true })}.
      </AlertDescription>
    </Alert>
  );
}
