import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, Crown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/ui/CartDrawer';
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
    <Link to={href} className={cn('text-foreground hover:text-primary transition-colors duration-200 py-2 block', className)}>
      {children}
    </Link>
  </li>;
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { getTotalItems, toggleCart } = useCart();
  const {
    isAuthenticated: isAdminAuthenticated,
    logout
  } = useAdminAuth();
  useEffect(() => {
    // Verificar usuário logado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
        setUser(null);
      }
    }
    console.log('Navbar - Estado atual:', {
      user: storedUser ? JSON.parse(storedUser) : null,
      isAdminAuthenticated
    });
  }, [isAdminAuthenticated]);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };
  return <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1 py-2 px-0">
              <img alt="Agro Ikemba" src="http://agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png" loading="eager" decoding="async" className="h-20 w-auto object-contain" />
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4 mr-4">
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {user?.verified ? <div className="flex items-center gap-3">
                {/* Cart Icon */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
                
                <span className="text-sm flex items-center gap-1">
                  Olá, {user.name.split(' ')[0]}
                  {isAdminAuthenticated && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                </span>
                {isAdminAuthenticated && <Button variant="outline" size="sm" asChild className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-1" />
                      Painel Admin
                    </Link>
                  </Button>}
                <Button variant="outline" onClick={handleLogout}>
                  Sair
                </Button>
              </div> : <>
                <Button variant="outline" disabled>Entrar</Button>
                <Button className="bg-primary hover:bg-primary/90" asChild>
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
              <NavItem href="/">Início</NavItem>
              <NavItem href="/blog">Blog</NavItem>
              {user?.verified && <>
                  <NavItem href="/products">Produtos</NavItem>
                  <NavItem href="/for-manufacturers">Para Fabricantes</NavItem>
                  <NavItem href="/for-distributors">Para Distribuidores</NavItem>
                  <NavItem href="/financial-services">Serviços Financeiros</NavItem>
                  <NavItem href="/logistics">Logística</NavItem>
                </>}
              <NavItem href="/about">Sobre Nós</NavItem>
              {isAdminAuthenticated && <NavItem href="/admin">Painel Admin</NavItem>}
            </ul>
            
            <div className="mt-8 flex flex-col gap-2">
              {user?.verified ? <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm flex items-center gap-1">
                      Olá, {user.name.split(' ')[0]}
                      {isAdminAuthenticated && <Crown className="w-4 h-4 text-yellow-500" />}
                    </span>
                  </div>
                  {isAdminAuthenticated && <Button variant="outline" className="w-full mb-2 bg-yellow-50 border-yellow-200 text-yellow-800" asChild>
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-1" />
                        Painel Admin
                      </Link>
                    </Button>}
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Sair
                  </Button>
                </> : <>
                  <Button variant="outline" className="w-full" disabled>Entrar</Button>
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link to="/register">Cadastrar</Link>
                  </Button>
                </>}
            </div>
          </nav>
        </div>}
      
      {/* Cart Drawer */}
      <CartDrawer />
    </header>;
}