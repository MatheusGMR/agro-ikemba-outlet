
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info and contact */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <img 
                alt="Agro Ikemba Logo" 
                src={supabase.storage.from('media-assets').getPublicUrl('Logo.png').data.publicUrl}
                onError={(e) => {
                  e.currentTarget.src = "http://agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png";
                }}
                className="h-16 w-auto object-contain" 
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-xs">
              Simplificando e otimizando todo o processo de compra e venda de genéricos.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-gray-300">Rua Flamingos, 1651 - Centro, Arapongas, Paraná, Brasil</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-gray-300">+55 43 98406-4141</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          

          {/* Newsletter */}
          <div>
            <h4 className="font-poppins text-lg font-medium mb-4 text-white">Mantenha-se Atualizado</h4>
            <p className="text-gray-300 mb-4">Inscreva-se em nossa newsletter para receber as últimas atualizações.</p>
            <form className="space-y-2 mb-6">
              <input type="email" placeholder="Seu endereço de e-mail" className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" className="w-full bg-primary text-white font-medium px-4 py-2 rounded-md hover:bg-brand-green-dark transition-colors">
                Inscrever-se
              </button>
            </form>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors text-gray-300">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="hover:text-primary transition-colors text-gray-300">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="hover:text-primary transition-colors text-gray-300">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="hover:text-primary transition-colors text-gray-300">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-6 text-center">
          <p className="text-gray-300">© {new Date().getFullYear()} Agro Ikemba. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
