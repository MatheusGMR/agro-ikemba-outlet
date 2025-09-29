import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Building2, LogOut, Settings } from 'lucide-react';
import { Revenda } from '@/hooks/useRevenda';

interface RevendaHeaderProps {
  revenda: Revenda | null;
}

export default function RevendaHeader({ revenda }: RevendaHeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {revenda ? revenda.razao_social : 'AgroIkemba Revenda'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {revenda ? `${revenda.cidade}/${revenda.estado}` : 'Dashboard Executivo'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {revenda && (
              <>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}