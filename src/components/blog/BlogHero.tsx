
import { Calendar, User } from 'lucide-react';

const BlogHero = () => {
  return (
    <section className="bg-gradient-to-br from-green-50 to-green-100 py-16">
      <div className="container-custom">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Blog <span className="text-primary">Agro Ikemba</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Mantenha-se atualizado com as últimas novidades do agronegócio, 
            dicas sobre insumos agrícolas e tendências de mercado
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Publicações semanais</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Especialistas do setor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
