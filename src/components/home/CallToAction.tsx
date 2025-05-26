
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  return (
    <section className="py-20 bg-agro-green text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Pronto para transformar sua compra de produtos pós patente?
            </h2>
            <p className="text-lg mb-8 text-gray-100">
              Junte-se ao Agro Ikemba hoje e experimente os benefícios de conexões diretas, 
              transações simplificadas e serviços integrados adaptados para a melhora compra de seus genéricos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-agro-green hover:bg-agro-gold hover:text-white px-8 py-6 text-lg" asChild>
                <Link to="/register">Pré-cadastre-se</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-agro-green px-8 py-6 text-lg">
                Fale agora
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">25%</div>
              <p className="text-gray-200">Redução média em tempo</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">10.000</div>
              <p className="text-gray-200">Distribuidores e Cooperativas mapeados</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">16.000</div>
              <p className="text-gray-200">Agricultores mapeados</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">30%</div>
              <p className="text-gray-200">Redução média de custos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
