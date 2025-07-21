
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Hero() {
  // Get the public URL for the video from Supabase Storage
  const getVideoUrl = () => {
    const { data } = supabase.storage.from('media-assets').getPublicUrl('pitchdeck.mp4');
    return data.publicUrl;
  };

  // Fallback URLs if Supabase video is not available
  const fallbackVideoUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4'
  ];

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
          
          {/* Video section with Supabase Storage */}
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <video 
              width="100%" 
              controls 
              muted 
              loop 
              playsInline 
              autoPlay
              poster="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
              className="rounded-xl shadow-lg bg-gray-50" 
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {/* Primary source: Supabase Storage */}
              <source src={getVideoUrl()} type="video/mp4" />
              {/* Fallback sources */}
              {fallbackVideoUrls.map((url, index) => (
                <source key={index} src={url} type="video/mp4" />
              ))}
              <p className="text-center p-8 text-gray-600">
                Seu navegador não suporta o elemento de vídeo.
                <br />
                <Link to="/register" className="text-primary hover:underline">
                  Clique aqui para se cadastrar
                </Link>
              </p>
            </video>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="hidden md:block absolute -left-32 top-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
}
