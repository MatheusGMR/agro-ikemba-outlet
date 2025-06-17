
import { Suspense } from 'react';
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
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const Index = () => {
  console.log('📄 Index page rendering');
  
  return (
    <div className="flex flex-col min-h-screen">
      <ErrorBoundary fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Agro Ikemba</h1>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }>
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
      </ErrorBoundary>
    </div>
  );
};

export default Index;
