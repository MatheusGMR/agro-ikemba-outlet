import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import LogisticsPartners from '@/components/home/LogisticsPartners';
import CallToAction from '@/components/home/CallToAction';

export default function About() {
  return (
    <>
      <Helmet>
        <title>Sobre Nós - AgroIkemba | Defensivos Agrícolas</title>
        <meta 
          name="description" 
          content="Conheça a AgroIkemba, sua parceira de confiança em defensivos agrícolas. Oferecemos produtos de qualidade, preços competitivos e suporte especializado para o agronegócio brasileiro."
        />
        <meta 
          name="keywords" 
          content="sobre agroikemba, defensivos agrícolas, agronegócio, produtos certificados, representantes comerciais, agricultura brasileira"
        />
        <link rel="canonical" href="https://agroikemba.com.br/sobre" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Sobre Nós - AgroIkemba | Defensivos Agrícolas" />
        <meta property="og:description" content="Conheça a AgroIkemba, sua parceira de confiança em defensivos agrícolas com produtos certificados e suporte especializado." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agroikemba.com.br/sobre" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sobre Nós - AgroIkemba | Defensivos Agrícolas" />
        <meta name="twitter:description" content="Conheça a AgroIkemba, sua parceira de confiança em defensivos agrícolas com produtos certificados e suporte especializado." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AgroIkemba",
            "description": "Distribuidora de defensivos agrícolas com produtos certificados e suporte especializado",
            "url": "https://agroikemba.com.br",
            "logo": "https://agroikemba.com.br/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "BR"
            },
            "sameAs": [
              "https://facebook.com/agroikemba",
              "https://instagram.com/agroikemba"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Testimonials />
          <LogisticsPartners />
          <CallToAction />
        </main>
        
        <Footer />
      </div>
    </>
  );
}