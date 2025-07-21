
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
          
          {/* Video section with improved error handling and fallback */}
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <div className="relative">
              {(isLoading || videoError) && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center shadow-lg" style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div className="text-center p-8">
                    {isLoading && !videoError ? (
                      <>
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-2">Carregando vídeo...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ArrowRight className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Conheça a AgroIkemba
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Revolucionando o mercado de insumos agrícolas com economia de até 25%
                        </p>
                        <Button className="bg-primary hover:bg-primary/90" asChild>
                          <Link to="/register">Saiba mais</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {!videoError && (
                <video 
                  ref={videoRef}
                  width="100%" 
                  controls 
                  muted 
                  loop 
                  playsInline 
                  preload="metadata"
                  poster="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
                  className="rounded-xl shadow-lg bg-gray-50" 
                  style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: videoError ? 'none' : 'block'
                  }}
                  onError={handleVideoError} 
                  onLoadedData={handleVideoLoad} 
                  onCanPlay={handleCanPlay}
                >
                  {/* Try multiple video sources */}
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
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
