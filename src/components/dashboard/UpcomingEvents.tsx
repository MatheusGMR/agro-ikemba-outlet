import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export function UpcomingEvents() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Próximos Eventos</h2>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 rounded-lg border-l-4 border-primary bg-muted/50">
          <p className="font-medium text-sm">Feira de Materiais 2024</p>
          <p className="text-xs text-muted-foreground">15 de Janeiro - São Paulo</p>
        </div>
        
        <div className="p-3 rounded-lg border-l-4 border-secondary bg-muted/50">
          <p className="font-medium text-sm">Workshop Inovações</p>
          <p className="text-xs text-muted-foreground">28 de Janeiro - Online</p>
        </div>
      </div>
      
      <Button variant="ghost" size="sm" className="w-full mt-4">
        Ver Agenda Completa
      </Button>
    </Card>
  );
}