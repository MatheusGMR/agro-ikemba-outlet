
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        {/* Quick Access Section */}
        <div className="bg-muted py-8">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-center mb-6">Acesso Rápido</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-agro-green hover:bg-agro-green-light">
                <Link to="/products">Catálogo de Produtos</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/product/1">Exemplo de Produto</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/checkout">Processo de Compra</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
