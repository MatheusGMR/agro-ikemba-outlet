
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "❌ 404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        <p className="text-gray-500 mb-6">A página que você está procurando não existe.</p>
        <div className="space-y-2">
          <a 
            href="/" 
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar ao Início
          </a>
          <p className="text-sm text-gray-400">Caminho: {location.pathname}</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
