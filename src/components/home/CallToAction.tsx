
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  return <section className="py-20 bg-agro-green text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-1 items-center">
          <div>
            
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-agro-green hover:bg-agro-green hover:text-white px-8 py-6 text-lg" asChild>
                
              </Button>
              
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-agro-green-dark rounded-lg p-6 px-[23px]">
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
    </section>;
}
