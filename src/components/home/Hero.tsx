
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  console.log('Hero component mounted');

  // Preload video only when component is visible
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Only start loading video after initial render
      const timer = setTimeout(() => {
        video.load();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video error occurred');
    const video = e.target as HTMLVideoElement;
    console.log('Video error code:', video.error?.code);
    console.log('Video error message:', video.error?.message);
    console.log('Video current source:', video.currentSrc);
    console.log('Video network state:', video.networkState);
    console.log('Video ready state:', video.readyState);
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    console.log('Video can start playing');
    setIsLoading(false);
  };

  const handleSaibaMais = () => {
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
          
          {/* Video section with optimized loading */}
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
              
              {videoError ? (
                <div className="rounded-xl shadow-lg overflow-hidden bg-gray-50" style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <img 
                    src="/lovable-uploads/6aea75d9-eade-440b-8bf4-099785748206.png" 
                    alt="Agro Ikemba - Revolucionando o Mercado de Insumos"
                    className="w-full h-auto"
                  />
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-600 text-center">
                      Vídeo temporariamente indisponível
                    </p>
                  </div>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  width="100%" 
                  controls 
                  muted 
                  loop 
                  playsInline 
                  preload="metadata"
                  poster="/lovable-uploads/6aea75d9-eade-440b-8bf4-099785748206.png"
                  className="rounded-xl shadow-lg bg-gray-50" 
                  style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onError={handleVideoError} 
                  onLoadedData={handleVideoLoad} 
                  onCanPlay={handleCanPlay}
                >
                  <source src="https://agroikemba.com.br/public_html/Pitch-deck-1.mp4" type="video/mp4" />
                  <source src="https://agroikemba.com.br/wp-content/uploads/2025/05/Pitch-deck-1.mp4" type="video/mp4" />
                  <source src="https://www.agroikemba.com.br/Pitch-deck-1.mp4" type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
}
