
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import CallToAction from '@/components/home/CallToAction';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppButton phoneNumber="+55 43 98406-4141" />
    </div>
  );
};

export default Index;
