import React, { useState } from 'react';
import { BlockingDialog, BlockingDialogContent, BlockingDialogHeader, BlockingDialogTitle } from '@/components/ui/blocking-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface PersonJuridicaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (hasActivePJ: boolean, confirmed?: boolean) => void;
  onSubmitBlocked: () => void;
}

export function PersonJuridicaPopup({ isOpen, onClose, onResponse, onSubmitBlocked }: PersonJuridicaPopupProps) {
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAindaNao = async () => {
    setIsSubmitting(true);
    
    try {
      // Auto-submit com status "reprovado"
      await onSubmitBlocked();
      
      // Mostrar modal de agradecimento
      setShowThankYou(true);
      
      // Tracking do Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'representative_form_blocked', {
          event_category: 'Representative',
          event_label: 'no_cnpj',
          value: 1
        });
      }
    } catch (error) {
      console.error('Erro ao submeter aplicação bloqueada:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSim = () => {
    onResponse(true, true);
    onClose();
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
    onClose();
  };

  if (showThankYou) {
    return (
      <BlockingDialog open={true}>
        <BlockingDialogContent className="sm:max-w-md">
          <BlockingDialogHeader>
            <BlockingDialogTitle className="flex items-center gap-2 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-green-600" />
              </div>
              Obrigado pelo seu interesse!
            </BlockingDialogTitle>
          </BlockingDialogHeader>
          
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Recebemos sua solicitação. Para participar do programa de representantes, é necessário ter CNPJ ativo (MEI ou empresa).
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Próximos passos:</strong><br />
                Quando sua empresa estiver aberta, faça um novo pedido de inscrição. Nossa equipe entrará em contato em até 5 dias úteis.
              </p>
            </div>
            
            <Button 
              onClick={handleCloseThankYou}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        </BlockingDialogContent>
      </BlockingDialog>
    );
  }

  return (
    <BlockingDialog open={isOpen}>
      <BlockingDialogContent className="sm:max-w-md">
        <BlockingDialogHeader>
          <BlockingDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirmação de Pessoa Jurídica
          </BlockingDialogTitle>
        </BlockingDialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Você tem alguma pessoa jurídica (ex. MEI) aberta em seu nome?
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleAindaNao}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Processando...
                </>
              ) : (
                'Ainda não'
              )}
            </Button>
            
            <Button
              onClick={handleSim}
              disabled={isSubmitting}
              className="w-full"
            >
              Sim
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Importante:</strong> Para participar do programa, é necessário ter CNPJ ativo (MEI ou empresa).
            </p>
          </div>
        </div>
      </BlockingDialogContent>
    </BlockingDialog>
  );
}