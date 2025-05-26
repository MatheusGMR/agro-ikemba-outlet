
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-agro-green-dark text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info and contact */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <img 
                alt="Agro Ikemba Logo" 
                src="http://agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png" 
                className="h-12 w-30 object-contain" 
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-xs">
              Simplificando e otimizando todo o processo de compra e venda de genéricos.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-agro-gold mt-0.5" />
                <span>Rua Flamingos, 1651 - Centro, Arapongas, Paraná, Brasil</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-agro-gold" />
                <span>+55 43 98406-4141</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-agro-gold" />
                <span>contato@agroikemba.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins text-lg font-medium mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-agro-gold transition-colors">Início</Link></li>
              <li><Link to="/products" className="hover:text-agro-gold transition-colors">Produtos</Link></li>
              <li><Link to="/dashboard" className="hover:text-agro-gold transition-colors">Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-agro-gold transition-colors">Cadastro</Link></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-poppins text-lg font-medium mb-4">Mantenha-se Atualizado</h4>
            <p className="text-gray-300 mb-4">Inscreva-se em nossa newsletter para receber as últimas atualizações.</p>
            <form className="space-y-2 mb-6">
              <input 
                type="email" 
                placeholder="Seu endereço de e-mail" 
                className="w-full px-4 py-2 rounded-md bg-agro-green-light text-white placeholder-gray-300 border border-agro-green focus:outline-none focus:ring-2 focus:ring-agro-gold" 
              />
              <button 
                type="submit" 
                className="w-full bg-agro-gold text-agro-green-dark font-medium px-4 py-2 rounded-md hover:bg-agro-gold-light transition-colors"
              >
                Inscrever-se
              </button>
            </form>
            <div className="flex gap-4">
              <a href="#" className="hover:text-agro-gold transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="hover:text-agro-gold transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="hover:text-agro-gold transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="hover:text-agro-gold transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-agro-green-light/30 mt-12 pt-6 text-center">
          <p className="text-gray-300">© {new Date().getFullYear()} Agro Ikemba. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
