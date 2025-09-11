import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const VideoBoasVindas = () => {

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
              <iframe
                src="https://www.youtube.com/embed/VaVjD8OtFK0?rel=0&modestbranding=1&showinfo=0"
                title="Bem-vindo ao AgroIkemba - Vídeo de Apresentação"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
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