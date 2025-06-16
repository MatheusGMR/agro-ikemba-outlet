
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  console.log('Hero component mounted');

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video error occurred');
    const video = e.target as HTMLVideoElement;
    console.log('Video error code:', video.error?.code);
    console.log('Video error message:', video.error?.message);
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
  };

  const handleCanPlay = () => {
    console.log('Video can start playing');
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
              <Button variant="outline" className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg">
                Saiba mais
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Economize +25% na compra de seus genéricos aqui</span>
              </p>
            </div>
          </div>
          
          {/* Video section with fallback content */}
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <div className="w-full h-64 md:h-80 bg-gray-50 rounded-xl flex items-center justify-center shadow-lg" style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Agro Ikemba</h3>
                <p className="text-gray-600 mb-4">Revolucionando o mercado de insumos agrícolas</p>
                <p className="text-sm text-gray-500">Vídeo de apresentação em breve</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/register">Conheça nossa proposta</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
}
