import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const VideoBoasVindas = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  const handleVideoLoad = () => {
    // Try autoplay muted first
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // If autoplay fails, show the play button
        setShowPlayButton(true);
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Bem-vindo ao AgroIkemba - Vídeo de Apresentação</title>
        <meta name="description" content="Conheça o primeiro Outlet do Agronegócio Brasileiro. Assista nosso vídeo de boas-vindas e descubra como economizar em insumos agrícolas." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <img 
              src="https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Logo%20Ikemba.png" 
              alt="Logo AgroIkemba" 
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 p-2"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao AgroIkemba! 🌱</h1>
            <p className="text-green-100 text-lg">O primeiro Outlet do Agronegócio Brasileiro</p>
          </div>

          {/* Video Section */}
          <div className="p-8">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Logo%20Ikemba.png"
                controls
                playsInline
                onLoadedData={handleVideoLoad}
              >
                <source 
                  src="https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Seja%20bem%20vindo,%20Comprador!.mov" 
                  type="video/quicktime" 
                />
                Seu navegador não suporta o elemento de vídeo.
              </video>
              
              {/* Play Button Overlay */}
              {showPlayButton && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
                  onClick={handlePlay}
                >
                  <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4"
                  >
                    <Volume2 className="w-8 h-8 mr-2" />
                    Assistir com Som
                  </Button>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pronto para economizar em insumos agrícolas?
              </h2>
              <p className="text-gray-600 mb-6">
                Acesse nossa plataforma e descubra os melhores preços do mercado
              </p>
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                onClick={() => window.location.href = '/login'}
              >
                Acessar Plataforma
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoBoasVindas;