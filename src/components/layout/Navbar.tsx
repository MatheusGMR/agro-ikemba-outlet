
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-agro-green">Agro Ikemba</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-agro-green transition-colors">
              Início
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-agro-green transition-colors">
              Produtos
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-agro-green transition-colors">
              Dashboard
            </Link>
            <Button asChild className="bg-agro-green hover:bg-agro-green-dark">
              <Link to="/register">Cadastrar</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-agro-green"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-agro-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-agro-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-agro-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Button asChild className="bg-agro-green hover:bg-agro-green-dark w-fit">
                <Link to="/register" onClick={() => setIsOpen(false)}>Cadastrar</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
