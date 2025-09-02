import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRepClients, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { Search, Plus, Building, Phone, Mail, MapPin, User } from 'lucide-react';
import { RepClient } from '@/types/representative';
import { ClientRegistrationDialog } from './ClientRegistrationDialog';

interface ClientCardProps {
  client: RepClient;
}

function ClientCard({ client }: ClientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{client.company_name}</h3>
            {client.contact_name && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{client.contact_name}</span>
                  {client.contact_function && (
                    <span className="text-muted-foreground">({client.contact_function})</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Ativo
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
          )}
          
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {client.phone}
            </div>
          )}
          
          {(client.city || client.state) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {[client.city, client.state].filter(Boolean).join(', ')}
            </div>
          )}
          
          {client.cnpj_cpf && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              {client.cnpj_cpf}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Ver Detalhes
          </Button>
          <Button size="sm" className="flex-1">
            Nova Oportunidade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientManagement() {
  const { data: representative } = useCurrentRepresentative();
  const { data: clients = [], isLoading } = useRepClients(representative?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie sua carteira de clientes e relacionamentos
          </p>
        </div>
        
        <Button onClick={() => setShowRegistrationDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Cliente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.phone || c.whatsapp).length}
                </p>
                <p className="text-sm text-muted-foreground">Com Contato</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.email).length}
                </p>
                <p className="text-sm text-muted-foreground">Com E-mail</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && clients.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum cliente encontrado para "{searchTerm}"
          </p>
        </div>
      )}

      {clients.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece cadastrando seu primeiro cliente para começar a gerenciar suas vendas
          </p>
          <Button onClick={() => setShowRegistrationDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeiro Cliente
          </Button>
        </div>
      )}
      
      {/* Client Registration Dialog */}
      {representative && (
        <ClientRegistrationDialog
          open={showRegistrationDialog}
          onOpenChange={setShowRegistrationDialog}
          representativeId={representative.id}
        />
      )}
    </div>
  );
}