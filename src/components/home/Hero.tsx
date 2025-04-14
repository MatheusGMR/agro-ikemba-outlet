
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Hero() {
  return <section className="relative bg-gradient-to-b from-agro-beige to-white overflow-hidden">
      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-black">Revolucionando o</span>{" "}
              <span className="text-agro-green">Mercado de Insumos</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-lg">
              Conectando fabricantes e distribuidores diretamente em uma única plataforma B2B poderosa para insumos agrícolas.
            </p>
            <p className="text-lg md:text-xl font-medium text-agro-earth">
              Somos uma plataforma que simplifica o acesso a produtos post patent com modelo operacional de baixo custo, garantindo as melhores condições comerciais do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-agro-green hover:bg-agro-green-light text-white px-8 py-6 text-lg" asChild>
                <Link to="/register">Cadastrar como Fabricante</Link>
              </Button>
              <Button variant="outline" className="border-agro-earth text-agro-earth hover:bg-agro-earth hover:text-white px-8 py-6 text-lg" asChild>
                <Link to="/register">Cadastrar como Distribuidor</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-agro-${i % 2 === 0 ? 'green' : 'earth'}-${i < 2 ? 'light' : 'dark'}`}></div>)}
              </div>
              <p className="text-gray-700">
                <span className="font-semibold">150+</span> parceiros já cadastrados
              </p>
            </div>
          </div>
          
          <div className="relative lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-agro-green/20 to-transparent z-10 rounded-2xl"></div>
            <img src="https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=1200&auto=format&fit=crop" alt="Paisagem agrícola" className="w-full h-full object-cover object-center" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs z-10">
              <p className="font-medium text-agro-green">Transações Simplificadas</p>
              <p className="text-sm text-gray-700">Conexões diretas significam negócios mais rápidos, melhores preços e logística simplificada</p>
              <Button variant="link" className="text-agro-green p-0 h-auto flex items-center mt-2 font-medium">
                Saiba mais <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="hidden md:block absolute -right-32 -top-32 w-96 h-96 bg-agro-gold/10 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-agro-green/10 rounded-full blur-3xl"></div>
    </section>;
}
