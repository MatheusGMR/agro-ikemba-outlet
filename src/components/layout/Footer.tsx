import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
export default function Footer() {
  return <footer className="bg-agro-green-dark text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-agro-green-dark font-bold text-sm">AI</span>
              </div>
              <span className="font-poppins font-bold text-xl">
                <span className="text-white">Agro</span>
                <span className="text-agro-gold">Ikemba</span>
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-xs">
              Conectando fabricantes de insumos agrícolas diretamente com canais de distribuição.
              Simplificando e otimizando todo o processo de compra e venda.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-agro-gold mt-0.5" />
                <span>Av. Agrícola 123, São Paulo, Brasil</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-agro-gold" />
                <span>+55 11 98623-0007</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-agro-gold" />
                <span>contato@agroikemba.com</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="Remove\n">
            <h3 className="font-poppins text-lg font-medium mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-agro-gold transition-colors">Início</Link></li>
              <li><Link to="/products" className="hover:text-agro-gold transition-colors">Produtos</Link></li>
              <li><Link to="/about" className="hover:text-agro-gold transition-colors">Sobre Nós</Link></li>
              <li><Link to="/contact" className="hover:text-agro-gold transition-colors">Contato</Link></li>
              <li><Link to="/terms" className="hover:text-agro-gold transition-colors">Termos de Serviço</Link></li>
              <li><Link to="/privacy" className="hover:text-agro-gold transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-poppins text-lg font-medium mb-4">Soluções</h3>
            <ul className="space-y-2">
              <li><Link to="/for-manufacturers" className="hover:text-agro-gold transition-colors">Para Fabricantes</Link></li>
              <li><Link to="/for-distributors" className="hover:text-agro-gold transition-colors">Para Distribuidores</Link></li>
              <li><Link to="/financial-services" className="hover:text-agro-gold transition-colors">Serviços Financeiros</Link></li>
              <li><Link to="/logistics" className="hover:text-agro-gold transition-colors">Logística</Link></li>
              <li><Link to="/storage" className="hover:text-agro-gold transition-colors">Soluções de Armazenamento</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-poppins text-lg font-medium mb-4">Mantenha-se Atualizado</h3>
            <p className="text-gray-300 mb-4">Inscreva-se em nossa newsletter para receber as últimas atualizações.</p>
            <form className="space-y-2">
              <input type="email" placeholder="Seu endereço de e-mail" className="w-full px-4 py-2 rounded-md bg-agro-green-light text-white placeholder-gray-300 border border-agro-green focus:outline-none focus:ring-2 focus:ring-agro-gold" />
              <button type="submit" className="w-full bg-agro-gold text-agro-green-dark font-medium px-4 py-2 rounded-md hover:bg-agro-gold-light transition-colors">
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-agro-green-light/30 mt-12 pt-6 text-center md:flex md:justify-between md:text-left">
          <p className="text-gray-300">© {new Date().getFullYear()} Agro Ikemba. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end gap-6">
              <li><a href="#" className="hover:text-agro-gold transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-agro-gold transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>;
}