import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, Crown, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/ui/CartDrawer';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser } from '@supabase/supabase-js';
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
  const [supaUser, setSupaUser] = useState<SupaUser | null>(null);
  const [logoError, setLogoError] = useState(false);
  const {
    getTotalItems,
    toggleCart
  } = useCart();
  const {
    isAuthenticated: isAdminAuthenticated,
    logout
  } = useAdminAuth();
  const { 
    user: authUser, 
    isRepresentative, 
    signOut: authSignOut 
  } = useAuth();

  // Get the public URL for the logo from Supabase Storage
  const getLogoUrl = () => {
    const {
      data
    } = supabase.storage.from('media-assets').getPublicUrl('Logo.png');
    return data.publicUrl;
  };
  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null;
      setSupaUser(authUser);
      
      // Compatibility bridge: sync with localStorage
      if (authUser) {
        const bridgeUser = {
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'Usuário',
          verified: true,
          isAdmin: false
        };
        setUser(bridgeUser);
        localStorage.setItem('user', JSON.stringify(bridgeUser));
      } else {
        // Clear localStorage user if Supabase session is gone
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Only clear if this was a Supabase-synced user (has verified: true)
            if (parsedUser.verified) {
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.error('Erro ao parsear usuário:', error);
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setSupaUser(authUser);
      
      if (authUser) {
        const bridgeUser = {
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'Usuário', 
          verified: true,
          isAdmin: false
        };
        setUser(bridgeUser);
        localStorage.setItem('user', JSON.stringify(bridgeUser));
      }
    });

    // Also check localStorage for non-Supabase users
    const storedUser = localStorage.getItem('user');
    if (storedUser && !supaUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    }

    console.log('Navbar - Estado atual:', {
      user,
      supaUser,
      isAdminAuthenticated
    });

    return () => subscription.unsubscribe();
  }, [isAdminAuthenticated]);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLogout = async () => {
    // Auth handler will take care of representative logout
    if (authUser) {
      await authSignOut();
    } else {
      // Logout from Supabase
      await supabase.auth.signOut();
      
      // Logout from admin auth
      logout();
      
      // Clear all local state
      setUser(null);
      setSupaUser(null);
      localStorage.removeItem('user');
      
      window.location.href = '/';
    }
  };

  // Determine if user is logged in (prioritize auth context)
  const isLoggedIn = !!authUser || !!supaUser || !!(user?.verified);
  const handleLogoError = () => {
    setLogoError(true);
  };
  return <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1 py-2 px-0">
              {!logoError ? <img alt="Agro Ikemba" src={getLogoUrl()} loading="eager" decoding="async" className="h-20 w-auto object-contain" onError={handleLogoError} /> : <div className="h-20 w-32 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    <span className="text-white">Agro</span>
                    <span className="text-green-200">Ikemba</span>
                  </span>
                </div>}
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4 mr-4">
            <Link to="/products" className="text-foreground hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link to="/sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre Nós
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? <div className="flex items-center gap-3">
                {/* Cart Icon */}
                <Button variant="outline" size="sm" className="relative" onClick={toggleCart}>
                  <ShoppingCart className="w-4 h-4" />
                  {getTotalItems() > 0 && <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>}
                </Button>
                
                <span className="text-sm flex items-center gap-1">
                  Olá, {authUser?.email?.split('@')[0] || user?.name?.split(' ')[0] || supaUser?.email?.split('@')[0] || 'Usuário'}
                  {isAdminAuthenticated && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                  {isRepresentative && <User className="w-4 h-4 ml-1 text-blue-500" />}
                </span>
                {isAdminAuthenticated && <Button variant="outline" size="sm" asChild className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-1" />
                      Painel Admin
                    </Link>
                  </Button>}
                {isRepresentative && <Button variant="outline" size="sm" asChild className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100">
                    <Link to="/representative">
                      <User className="w-4 h-4 mr-1" />
                      Painel Rep
                    </Link>
                  </Button>}
                <Button variant="outline" onClick={handleLogout}>
                  Sair
                </Button>
              </div> : <>
                <Button variant="outline" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
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
              <NavItem href="/products">Produtos</NavItem>
              <NavItem href="/sobre">Sobre Nós</NavItem>
              <NavItem href="/blog">Blog</NavItem>
              <NavItem href="/simulador">Simulador</NavItem>
              {isLoggedIn && <>
                  <NavItem href="/for-manufacturers">Para Fabricantes</NavItem>
                  <NavItem href="/for-distributors">Para Distribuidores</NavItem>
                  <NavItem href="/financial-services">Serviços Financeiros</NavItem>
                  <NavItem href="/logistics">Logística</NavItem>
                </>}
              {isAdminAuthenticated && <NavItem href="/admin">Painel Admin</NavItem>}
              {isRepresentative && <NavItem href="/representative">Painel Representante</NavItem>}
            </ul>
            
            <div className="mt-8 flex flex-col gap-2">
              {isLoggedIn ? <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm flex items-center gap-1">
                      Olá, {authUser?.email?.split('@')[0] || user?.name?.split(' ')[0] || supaUser?.email?.split('@')[0] || 'Usuário'}
                      {isAdminAuthenticated && <Crown className="w-4 h-4 text-yellow-500" />}
                      {isRepresentative && <User className="w-4 h-4 text-blue-500" />}
                    </span>
                  </div>
                  {isAdminAuthenticated && <Button variant="outline" className="w-full mb-2 bg-yellow-50 border-yellow-200 text-yellow-800" asChild>
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-1" />
                        Painel Admin
                      </Link>
                    </Button>}
                  {isRepresentative && <Button variant="outline" className="w-full mb-2 bg-blue-50 border-blue-200 text-blue-800" asChild>
                      <Link to="/representative">
                        <User className="w-4 h-4 mr-1" />
                        Painel Representante
                      </Link>
                    </Button>}
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Sair
                  </Button>
                </> : <>
                  <Button variant="outline" className="w-full mb-2" asChild>
                    <Link to="/login">Entrar</Link>
                  </Button>
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