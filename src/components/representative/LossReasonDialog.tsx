import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { XCircle, Loader2 } from 'lucide-react';

interface LossReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityTitle: string;
  onConfirm: (reason: string, comments?: string) => Promise<void>;
}

const LOSS_REASONS = [
  { value: 'preco', label: 'Preço não competitivo' },
  { value: 'prazo', label: 'Prazo de entrega inadequado' },
  { value: 'concorrencia', label: 'Perdeu para concorrência' },
  { value: 'orcamento', label: 'Cliente sem orçamento' },
  { value: 'qualidade', label: 'Questões de qualidade do produto' },
  { value: 'pagamento', label: 'Condições de pagamento' },
  { value: 'relacionamento', label: 'Questões de relacionamento' },
  { value: 'timing', label: 'Timing inadequado' },
  { value: 'outros', label: 'Outros motivos' }
];

export default function LossReasonDialog({
  open,
  onOpenChange,
  opportunityTitle,
  onConfirm
}: LossReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason, comments);
      onOpenChange(false);
      setReason('');
      setComments('');
    } catch (error) {
      console.error('Error marking opportunity as lost:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Marcar como Perdida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Oportunidade</Label>
            <p className="text-sm text-muted-foreground">{opportunityTitle}</p>
          </div>

          <div>
            <Label htmlFor="reason">Motivo da Perda *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {LOSS_REASONS.map(lossReason => (
                  <SelectItem key={lossReason.value} value={lossReason.value}>
                    {lossReason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comments">Comentários (opcional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Detalhes adicionais sobre a perda..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marcando...
                </>
              ) : (
                'Marcar como Perdida'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}