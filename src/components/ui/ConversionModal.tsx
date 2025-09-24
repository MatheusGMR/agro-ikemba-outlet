import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Zap, Star, TrendingUp, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureRequested: string;
}

export function ConversionModal({ open, onOpenChange, featureRequested }: ConversionModalProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    onOpenChange(false);
    navigate('/register');
  };

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/login');
  };

  const handleContinue = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Desbloqueie Preços Exclusivos
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {featureRequested} requer cadastro para acesso completo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature highlight */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Compre com Desconto</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete seu cadastro e finalize a compra com os preços simulados - economia garantida!
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-100 rounded-full">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="text-sm">Descontos progressivos por volume</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <Star className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-sm">Preços exclusivos para cadastrados</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="text-sm">Produtos certificados MAPA</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleRegister}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Cadastrar e Comprar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogin}
              className="w-full"
            >
              Já tenho conta
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleContinue}
              className="w-full text-sm"
            >
              Continuar navegando
            </Button>
          </div>

          {/* Trust indicator */}
          <div className="text-center pt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              + de 317.960 L/Kg em estoque
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}