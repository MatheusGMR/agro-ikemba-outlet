
import { Button } from '@/components/ui/button';

export default function CallToAction() {
  return (
    <section className="py-20 bg-agro-green text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Pronto para Transformar seu Negócio Agrícola?
            </h2>
            <p className="text-lg mb-8 text-gray-100">
              Junte-se ao Agro Ikemba hoje e experimente os benefícios de conexões diretas, 
              transações simplificadas e serviços integrados adaptados para a indústria de 
              insumos agrícolas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-agro-green hover:bg-agro-gold hover:text-white px-8 py-6 text-lg">
                Cadastre-se Agora
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-agro-green px-8 py-6 text-lg">
                Agende uma Demonstração
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">150+</div>
              <p className="text-gray-200">Fabricantes na Plataforma</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">1.200+</div>
              <p className="text-gray-200">Distribuidores Conectados</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">R$50M+</div>
              <p className="text-gray-200">Volume Mensal de Transações</p>
            </div>
            <div className="bg-agro-green-dark rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-agro-gold">30%</div>
              <p className="text-gray-200">Redução Média de Custos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
