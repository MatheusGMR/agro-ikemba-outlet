
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImageGeneratorTest from '@/components/blog/ImageGeneratorTest';

const TestPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container-custom py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Teste de Integração OpenAI</h1>
          <p className="text-gray-600">
            Use esta página para testar se a API Key da OpenAI está funcionando corretamente.
          </p>
        </div>
        
        <ImageGeneratorTest />
      </main>
      <Footer />
    </div>
  );
};

export default TestPage;
