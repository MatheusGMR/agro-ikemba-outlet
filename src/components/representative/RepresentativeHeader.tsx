import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, Package, Users, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import InventoryConsultation from './InventoryConsultation';
import CreateOpportunityDialog from './CreateOpportunityDialog';
import { ClientRegistrationDialog } from './ClientRegistrationDialog';
import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import { useAuth } from '@/hooks/useAuth';

export default function RepresentativeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [showClientRegistration, setShowClientRegistration] = useState(false);
  const { data: representative } = useCurrentRepresentative();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Get the public URL for the logo from Supabase Storage
  const getLogoUrl = () => {
    const { data } = supabase.storage.from('media-assets').getPublicUrl('Logo.png');
    return data.publicUrl;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/representative-login');
  };

  const actionButtons = [
    {
      label: "Nova Oportunidade",
      icon: Plus,
      onClick: () => setShowCreateOpportunity(true),
      variant: "outline" as const
    },
    {
      label: "Consultar Estoque", 
      icon: Package,
      component: InventoryConsultation,
      variant: "outline" as const
    },
    {
      label: "Cadastrar Cliente",
      icon: Users,
      onClick: () => setShowClientRegistration(true), 
      variant: "outline" as const
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-custom flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-1 py-2 px-0">
                {!logoError ? (
                  <img
                    alt="Agro Ikemba"
                    src={getLogoUrl()}
                    loading="eager"
                    decoding="async"
                    className="h-20 w-auto object-contain"
                    onError={handleLogoError}
                  />
                ) : (
                  <div className="h-20 w-32 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      <span className="text-white">Agro</span>
                      <span className="text-green-200">Ikemba</span>
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {actionButtons.map((action, index) => {
                if (action.component) {
                  const Component = action.component;
                  return (
                    <Component key={index}>
                      <Button variant={action.variant}>
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    </Component>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.onClick}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {representative?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{representative?.name || 'Representante'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <button className="block md:hidden p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background backdrop-blur-md md:hidden pt-16 border-r border-border/40">
            <nav className="container-custom py-4 h-full bg-background border-t border-border/20">
              <div className="space-y-4">
                {actionButtons.map((action, index) => {
                  if (action.component) {
                    const Component = action.component;
                    return (
                      <Component key={index}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </Button>
                      </Component>
                    );
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        action.onClick?.();
                        setIsMenuOpen(false);
                      }}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Create Opportunity Dialog */}
      <Dialog open={showCreateOpportunity} onOpenChange={setShowCreateOpportunity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Oportunidade</DialogTitle>
          </DialogHeader>
          <CreateOpportunityDialog onClose={() => setShowCreateOpportunity(false)} />
        </DialogContent>
      </Dialog>

      {/* Client Registration Dialog */}
      <ClientRegistrationDialog 
        open={showClientRegistration}
        onOpenChange={setShowClientRegistration}
        representativeId={representative?.id || ''}
      />
    </>
  );
}