
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-agro-green">Agro Ikemba</h3>
            <p className="text-gray-400">
              Revolucionando o mercado de insumos agrícolas com as melhores condições comerciais.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Início
              </Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                Produtos
              </Link>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold">Serviços</h4>
            <div className="flex flex-col space-y-2">
              <span className="text-gray-400">Armazenagem</span>
              <span className="text-gray-400">Logística</span>
              <span className="text-gray-400">Consultoria</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contato</h4>
            <div className="flex flex-col space-y-2 text-gray-400">
              <span>+55 43 98406-4141</span>
              <span>contato@agroikemba.com.br</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Agro Ikemba. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
