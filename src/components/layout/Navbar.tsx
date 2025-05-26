
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavItem = ({
  href,
  children,
  className
}: NavItemProps) => <li>
    <Link to={href} className={cn('text-foreground hover:text-agro-green transition-colors duration-200 py-2 block', className)}>
      {children}
    </Link>
  </li>;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.email === 'admin@agroikemba.com'; // Simples verificação de admin
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1 py-2 px-0">
              <img 
                alt="Agro Ikemba" 
                src="/lovable-uploads/6aea75d9-eade-440b-8bf4-099785748206.png" 
                className="h-48 w-auto object-contain" 
              />
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            {user?.verified ? <div className="flex items-center gap-2">
                <span className="text-sm">Olá, {user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-1" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}>
                  Sair
                </Button>
              </div> : <>
                <Button variant="outline">Entrar</Button>
                <Button className="bg-agro-green hover:bg-agro-green-light" asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
              </>}
          </div>
        </nav>
        
        {/* Mobile menu button */}
        <button className="block md:hidden p-2" onClick={toggleMenu}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && <div className="fixed inset-0 z-50 bg-background md:hidden pt-16">
          <nav className="container-custom py-4">
            <ul className="space-y-4 text-lg">
              <NavItem href={user?.verified ? "/products" : "/"}>Início</NavItem>
              <NavItem href="/products">Produtos</NavItem>
              <NavItem href="/for-manufacturers">Para Fabricantes</NavItem>
              <NavItem href="/for-distributors">Para Distribuidores</NavItem>
              <NavItem href="/financial-services">Serviços Financeiros</NavItem>
              <NavItem href="/logistics">Logística</NavItem>
              <NavItem href="/about">Sobre Nós</NavItem>
              {isAdmin && (
                <NavItem href="/admin">Administração</NavItem>
              )}
            </ul>
            
            <div className="mt-8 flex flex-col gap-2">
              {user?.verified ? <>
                  <span className="text-sm mb-2">Olá, {user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <Button variant="outline" className="w-full mb-2" asChild>
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-1" />
                        Painel Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}>
                    Sair
                  </Button>
                </> : <>
                  <Button variant="outline" className="w-full">Entrar</Button>
                  <Button className="w-full bg-agro-green hover:bg-agro-green-light" asChild>
                    <Link to="/register">Cadastrar</Link>
                  </Button>
                </>}
            </div>
          </nav>
        </div>}
    </header>;
}
