import { ArrowRight, Play, Maximize, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';
export default function Hero() {
  // Video component updated to fix runtime errors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get the public URL for the video from Supabase Storage
  const getVideoUrl = () => {
    const {
      data
    } = supabase.storage.from('media-assets').getPublicUrl('pitchdeck.mp4');
    return data.publicUrl;
  };

  // Fallback URL for company welcome video if pitchdeck is not available
  const getFallbackVideoUrl = () => {
    const {
      data
    } = supabase.storage.from('media-assets').getPublicUrl('Seja bem vindo!.mp4');
    return data.publicUrl;
  };
  const handleSaibaMais = () => {
    analyticsService.trackConversion('lead');
    const featuresSection = document.querySelector('section.py-20.bg-gray-50');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleVerProdutos = () => {
    analyticsService.trackConversion('lead');
  };
  const handleCadastro = () => {
    analyticsService.trackConversion('quote_request');
  };
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };
  return <section className="relative bg-white overflow-hidden">
      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content loads first for immediate FCP */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-black">Revolucionando o</span>{" "}
              <span className="text-primary">Mercado de Insumos</span>
            </h1>
            
            <p className="text-lg md:text-xl font-medium text-gray-800">
              Somos o Outlet do Agronegócio, trabalhamos para entregar produtos convencionais e genéricos com melhores preços, priorizando o jeito simples e fácil que você procura.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg" asChild onClick={handleCadastro}>
                <Link to="/register">Pedir cadastro</Link>
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-6 text-lg border-0" asChild onClick={handleVerProdutos}>
                <Link to="/products" className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Ver Produtos
                </Link>
              </Button>
              
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Economize +25% na compra de seus genéricos aqui</span>
              </p>
            </div>
          </div>
          
          {/* Video section with enhanced fullscreen experience */}
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <div className="relative group">
              {/* Video preview */}
              <video ref={videoRef} width="100%" controls autoPlay muted loop playsInline preload="metadata" className="rounded-xl shadow-lg bg-gray-50 transition-all duration-300 group-hover:shadow-xl" style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
                {/* Primary source: Supabase Storage MP4 */}
                <source src={getVideoUrl()} type="video/mp4" />
                {/* Fallback source: Company welcome video */}
                <source src={getFallbackVideoUrl()} type="video/mp4" />
                <p className="text-center p-8 text-gray-600">
                  Seu navegador não suporta o elemento de vídeo.
                  <br />
                  <Link to="/register" className="text-primary hover:underline">
                    Clique aqui para se cadastrar
                  </Link>
                </p>
              </video>

              {/* Fullscreen button overlay */}
              <button onClick={handleFullscreen} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm" title="Assistir em tela cheia">
                <Maximize className="w-5 h-5" />
              </button>

              {/* Modal for enhanced video experience */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white transition-colors">
                      <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 bg-black">
                  <div className="aspect-video w-full">
                    <video width="100%" height="100%" controls autoPlay loop className="w-full h-full">
                      <source src={getVideoUrl()} type="video/mp4" />
                      <source src={getFallbackVideoUrl()} type="video/mp4" />
                    </video>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Video info overlay */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                <p className="text-sm font-medium">Seja bem-vindo, Comprador!</p>
                <p className="text-xs opacity-90">Clique para assistir em tela cheia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    </section>;
}