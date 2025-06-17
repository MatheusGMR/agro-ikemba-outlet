
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('Hero component mounted');

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video error occurred');
    const video = e.target as HTMLVideoElement;
    console.log('Video error code:', video.error?.code);
    console.log('Video error message:', video.error?.message);
    console.log('Video network state:', video.networkState);
    console.log('Video ready state:', video.readyState);
    console.log('Video current src:', video.currentSrc);
    console.log('Video sources available:', video.querySelectorAll('source'));
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    console.log('Video source used:', document.querySelector('video')?.currentSrc);
    setVideoLoaded(true);
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    console.log('Video can start playing');
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    console.log('Video started loading');
  };

  const handleSaibaMais = () => {
    // Look for the Features section with the "Transformando o comércio" title
    const featuresSection = document.querySelector('section.py-20.bg-gray-50');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content loads first for immediate FCP */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-black">Revolucionando o</span>{" "}
              <span className="text-primary">Mercado de Insumos</span>
            </h1>
            
            <p className="text-lg md:text-xl font-medium text-gray-800">
              Nascida na revenda, somos um outlet que simplifica o acesso a produtos post patent com modelo operacional de baixo custo, garantindo as melhores condições comerciais do mercado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg" asChild>
                <Link to="/register">Pedir cadastro</Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg"
                onClick={handleSaibaMais}
              >
                Saiba mais
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Economize +25% na compra de seus genéricos aqui</span>
              </p>
            </div>
          </div>
          
          {/* Video section */}
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-50 rounded-xl flex items-center justify-center shadow-lg" style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Carregando vídeo...</p>
                  </div>
                </div>
              )}
              <video 
                width="100%" 
                controls 
                muted 
                loop 
                playsInline 
                poster="/lovable-uploads/6aea75d9-eade-440b-8bf4-099785748206.png"
                className="rounded-xl shadow-lg bg-gray-50" 
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onError={handleVideoError} 
                onLoadedData={handleVideoLoad} 
                onCanPlay={handleCanPlay}
                onLoadStart={handleLoadStart}
                src="https://agroikemba.com.br/wp-content/uploads/2025/05/Pitch-deck-1.mp4"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
}
