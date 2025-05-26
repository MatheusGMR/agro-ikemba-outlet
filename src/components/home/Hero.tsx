
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-agro-beige to-white overflow-hidden">
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
              <p className="text-gray-700">
                <span className="font-semibold">Comprando aqui economize +20%</span> com produtos genéricos
              </p>
            </div>
          </div>
          
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <video 
              src="http://agroikemba.com.br/wp-content/uploads/2025/05/Pitch-deck-1.mp4"
              width="100%" 
              controls 
              autoPlay 
              muted 
              loop 
              playsInline
              className="rounded-xl shadow-lg"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              Seu navegador não suporta a exibição deste vídeo.
            </video>
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
    </section>
  );
}
