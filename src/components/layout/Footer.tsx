import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
export default function Footer() {
  return <footer className="bg-agro-green-dark text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <img 
                src="http://agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png" 
                alt="Agro Ikemba Logo" 
                className="h-12 w-auto object-contain"
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
                
                
              </div>
            </div>
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
