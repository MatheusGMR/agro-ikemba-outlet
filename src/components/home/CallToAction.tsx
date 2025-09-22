
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart, UserPlus } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

export default function CallToAction() {
  const handleVerProdutos = () => {
    analyticsService.trackConversion('lead');
  };

  const handleCadastro = () => {
    analyticsService.trackConversion('quote_request');
  };

  const stats = [{
    value: "+25%",
    label: "Tempo médio reduzido"
  }, {
    value: "750",
    label: "Distribuidores e Cooperativas cadastrados"
  }, {
    value: "150",
    label: "Operadores logísticos e financeiros cadastrados"
  }, {
    value: "+30%",
    label: "Economia na compra dos insumos"
  }];

  return (
    <section className="py-20 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm10 0c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-8 items-center">
          {/* New CTA Section above the stats */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para revolucionar seu negócio?
            </h2>
            <p className="text-xl mb-6 text-gray-200">Junte-se a milhares de compradores que buscam melhor preço em seus genéricos</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg border-0" 
                asChild
                onClick={handleVerProdutos}
              >
                <Link to="/products" className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Explorar Produtos
                </Link>
              </Button>
              <Button 
                className="bg-white text-primary hover:bg-gray-100 hover:text-primary px-8 py-6 text-lg border-0" 
                asChild
                onClick={handleCadastro}
              >
                <Link to="/register" className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Pedir Cadastro
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-brand-green-dark rounded-lg p-6 px-[23px]">
                <div className="text-3xl font-bold mb-2 text-white">{stat.value}</div>
                <p className="text-gray-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
