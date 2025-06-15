
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import CallToAction from '@/components/home/CallToAction';
import PreRegistration from '@/components/home/PreRegistration';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

const Index = () => {
  console.log('Index page rendering');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Features />
          <HowItWorks />
          <CallToAction />
          <PreRegistration />
        </main>
        <Footer />
        <WhatsAppButton phoneNumber="+55 43 98406-4141" />
      </Suspense>
    </div>
  );
};

export default Index;
