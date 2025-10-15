import { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import LogisticsPartners from '@/components/home/LogisticsPartners';
import CallToAction from '@/components/home/CallToAction';
import PreRegistration from '@/components/home/PreRegistration';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { logger } from '@/utils/logger';
import { usePageAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  logger.log('Index page rendering');
  
  const navigate = useNavigate();
  const { user, isRepresentative } = useAuth();
  
  // Track landing page analytics
  usePageAnalytics({
    pagePath: '/',
    pageTitle: 'Home - AgroIkemba',
    enableTimeTracking: true
  });

  // Redirecionamento inteligente para app mobile
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      if (user && isRepresentative) {
        navigate('/representative', { replace: true });
      } else {
        navigate('/representative/login', { replace: true });
      }
    }
  }, [user, isRepresentative, navigate]);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B",
    "description": "Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores. Compare fornecedores na AgroIkemba.",
    "url": "https://www.agroikemba.com.br",
    "mainEntity": {
      "@type": "Organization",
      "name": "AgroIkemba",
      "url": "https://www.agroikemba.com.br",
      "logo": "https://www.agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png",
      "description": "Plataforma B2B líder em insumos agrícolas genéricos",
      "offers": {
        "@type": "AggregateOffer",
        "description": "Insumos agrícolas genéricos com economia de até 25%",
        "offerCount": "1000+",
        "lowPrice": "1",
        "highPrice": "10000",
        "priceCurrency": "BRL"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.agroikemba.com.br"
        }
      ]
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B</title>
        <meta name="description" content="Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores. Compare fornecedores na AgroIkemba." />
        <meta name="keywords" content="insumos agrícolas genéricos, fertilizantes baratos, defensivos genéricos preço, distribuidora insumos, fornecedores fertilizantes, economia rural, agronegócio B2B, defensivos agrícolas, sementes genéricas, nutrição vegetal" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content="Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B" />
        <meta property="og:description" content="Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.agroikemba.com.br" />
        <meta property="og:site_name" content="AgroIkemba" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Insumos Agrícolas Genéricos - Economize 25% | AgroIkemba B2B" />
        <meta name="twitter:description" content="Plataforma B2B líder em insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços 25% menores." />
        <link rel="canonical" href="https://www.agroikemba.com.br" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
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
        </Suspense>
      </div>
    </>
  );
};

export default Index;
