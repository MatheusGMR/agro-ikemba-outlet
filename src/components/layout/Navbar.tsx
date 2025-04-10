
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavItem = ({ href, children, className }: NavItemProps) => (
  <li>
    <Link
      to={href}
      className={cn(
        'text-foreground hover:text-agro-green transition-colors duration-200 py-2 block',
        className
      )}
    >
      {children}
    </Link>
  </li>
);

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 rounded-full bg-agro-green flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-poppins font-bold text-xl hidden sm:inline-block">
                <span className="text-agro-green">Agro</span>
                <span className="text-agro-earth">Ikemba</span>
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/products">Products</NavItem>
            <div className="relative group">
              <button className="flex items-center gap-1 text-foreground hover:text-agro-green transition-colors duration-200 py-2">
                Solutions <ChevronDown className="h-4 w-4" />
              </button>
              <ul className="absolute hidden group-hover:block bg-white shadow-lg rounded-md p-2 min-w-[180px] z-10 mt-0">
                <NavItem href="/for-manufacturers" className="px-3">For Manufacturers</NavItem>
                <NavItem href="/for-distributors" className="px-3">For Distributors</NavItem>
                <NavItem href="/financial-services" className="px-3">Financial Services</NavItem>
                <NavItem href="/logistics" className="px-3">Logistics</NavItem>
              </ul>
            </div>
            <NavItem href="/about">About Us</NavItem>
          </ul>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">Log in</Button>
            <Button className="bg-agro-green hover:bg-agro-green-light">Register</Button>
          </div>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="block md:hidden p-2"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden pt-16">
          <nav className="container-custom py-4">
            <ul className="space-y-4 text-lg">
              <NavItem href="/">Home</NavItem>
              <NavItem href="/products">Products</NavItem>
              <NavItem href="/for-manufacturers">For Manufacturers</NavItem>
              <NavItem href="/for-distributors">For Distributors</NavItem>
              <NavItem href="/financial-services">Financial Services</NavItem>
              <NavItem href="/logistics">Logistics</NavItem>
              <NavItem href="/about">About Us</NavItem>
            </ul>
            
            <div className="mt-8 flex flex-col gap-2">
              <Button variant="outline" className="w-full">Log in</Button>
              <Button className="w-full bg-agro-green hover:bg-agro-green-light">Register</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
