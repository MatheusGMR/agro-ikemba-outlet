
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Hero() {
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video error occurred');
    const video = e.target as HTMLVideoElement;
    console.log('Video error code:', video.error?.code);
    console.log('Video error message:', video.error?.message);
    console.log('Video network state:', video.networkState);
    console.log('Video ready state:', video.readyState);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleCanPlay = () => {
    console.log('Video can start playing');
  };

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
              Somos um outlet que simplifica o acesso a produtos post patent com modelo operacional de baixo custo, garantindo as melhores condições comerciais do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-agro-green hover:bg-agro-green-light text-white px-8 py-6 text-lg" asChild>
                <Link to="/register">Pré-cadastre-se</Link>
              </Button>
              <Button variant="outline" className="border-agro-earth text-agro-earth hover:bg-agro-earth hover:text-white px-8 py-6 text-lg">
                Saiba mais
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Economize +25% na compra de seus genéricos aqui</span>
              </p>
            </div>
          </div>
          
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <video 
              width="100%" 
              controls 
              autoPlay 
              muted 
              loop 
              playsInline
              className="rounded-xl shadow-lg"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              onCanPlay={handleCanPlay}
            >
              <source src="http://agroikemba.com.br/wp-content/uploads/2025/05/Pitch-deck-1.mp4" type="video/mp4" />
              Seu navegador não suporta a exibição deste vídeo.
            </video>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="hidden md:block absolute -right-32 -top-32 w-96 h-96 bg-agro-gold/10 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-agro-green/10 rounded-full blur-3xl"></div>
    </section>
  );
}
