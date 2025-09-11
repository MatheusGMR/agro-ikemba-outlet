import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const VideoBoasVindas = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const videoUrl = "https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Seja%20bem%20vindo,%20Comprador!.mov";
  const posterUrl = "https://jhkxcplfempenoczcoep.supabase.co/storage/v1/object/public/media-assets/Logo%20Ikemba.png";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay blocked, showing play button');
        setShowPlayButton(true);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayWithSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      setIsMuted(false);
      await video.play();
      setIsPlaying(true);
      setShowPlayButton(false);
    } catch (error) {
      console.error('Erro ao reproduzir vídeo:', error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <>
      <Helmet>
        <title>Seja bem-vindo ao AgroIkemba!</title>
        <meta name="description" content="Assista ao vídeo de boas-vindas e conheça nossa plataforma B2B de insumos agrícolas." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Seja bem-vindo ao AgroIkemba! 🌾
            </h1>
            <p className="text-xl text-muted-foreground">
              Assista ao vídeo e conheça nossa plataforma
            </p>
          </div>

          <div className="relative bg-card rounded-lg shadow-xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              poster={posterUrl}
              muted={true}
              playsInline
              preload="metadata"
              controls
            >
              <source src={videoUrl} type="video/quicktime" />
              <p className="p-8 text-center text-muted-foreground">
                Seu navegador não suporta a reprodução deste vídeo. 
                <br />
                <a 
                  href={videoUrl} 
                  className="text-primary hover:underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Clique aqui para fazer o download
                </a>
              </p>
            </video>

            {showPlayButton && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  onClick={handlePlayWithSound}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  Reproduzir com Som
                </Button>
              </div>
            )}

            {isPlaying && (
              <div className="absolute top-4 right-4">
                <Button
                  onClick={toggleMute}
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Pronto para começar? Acesse nossa plataforma!
            </p>
            <Button asChild>
              <a href="/dashboard">
                Ir para o Dashboard
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoBoasVindas;