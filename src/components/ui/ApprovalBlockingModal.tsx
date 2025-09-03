import { useUserApproval } from '@/hooks/useUserApproval';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnclosableDialog, UnclosableDialogContent, UnclosableDialogTitle, UnclosableDialogDescription } from './unclosable-dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ApprovalBlockingModal() {
  const { user } = useAuth();
  const { isApproved, isPending, isLoading } = useUserApproval();
  const { toast } = useToast();

  // Don't show modal if user is not logged in, is loading, or is approved
  if (!user || isLoading || isApproved) return null;
  
  // Lock background scroll while modal is open
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UnclosableDialog open={true}>
      <UnclosableDialogContent className="max-w-md mx-auto">
        <UnclosableDialogTitle className="sr-only">Conta em análise</UnclosableDialogTitle>
        <UnclosableDialogDescription className="sr-only">
          Sua conta está sendo analisada pela nossa equipe
        </UnclosableDialogDescription>
        
        <div className="text-center space-y-6 p-6">
          <div className="flex justify-center">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Sua conta está sendo analisada
            </h2>
            <p className="text-muted-foreground">
              Os preços e funcionalidades de compra serão liberados após a aprovação da nossa equipe.
            </p>
          </div>
          
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Aprovação Pendente
          </Badge>
          
          <div className="text-sm text-muted-foreground">
            Você receberá um e-mail assim que sua conta for aprovada.
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </UnclosableDialogContent>
    </UnclosableDialog>
  );
}