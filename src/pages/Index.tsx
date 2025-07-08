
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import LogisticsPartners from '@/components/home/LogisticsPartners';
import CallToAction from '@/components/home/CallToAction';
import PreRegistration from '@/components/home/PreRegistration';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

const Index = () => {
  console.log('Index page rendering');
  
  return (
    <>
      <Helmet>
        <title>Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B</title>
        <meta name="description" content="Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores. Compare fornecedores na AgroIkemba." />
        <meta name="keywords" content="insumos agrícolas genéricos, fertilizantes baratos, defensivos genéricos preço, distribuidora insumos, fornecedores fertilizantes, economia rural, agronegócio B2B" />
        <meta property="og:title" content="Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B" />
        <meta property="og:description" content="Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.agroikemba.com.br" />
        <link rel="canonical" href="https://www.agroikemba.com.br" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          <Navbar />
          <main className="flex-1">
            <Hero />
            <Features />
            <HowItWorks />
            <LogisticsPartners />
            <CallToAction />
            <PreRegistration />
          </main>
          <Footer />
          <WhatsAppButton phoneNumber="+55 43 98406-4141" />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
