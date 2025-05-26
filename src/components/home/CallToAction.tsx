
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function CallToAction() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '25%', label: 'Redução média em tempo', color: 'bg-agro-gold' },
    { number: '10.000', label: 'Distribuidores e Cooperativas mapeados', color: 'bg-agro-gold' },
    { number: '16.000', label: 'Agricultores mapeados', color: 'bg-agro-gold' },
    { number: '30%', label: 'Redução média de custos', color: 'bg-agro-gold' }
  ];

  return (
    <section className="py-20 bg-agro-green text-white overflow-hidden relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Pronto para transformar sua compra de produtos pós patente?</h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Junte-se ao Agro Ikemba hoje e experimente os benefícios de conexões diretas, transações simplificadas e serviços integrados adaptados para a melhora compra de seus genéricos.
          </p>
          <Button className="bg-white text-agro-green hover:bg-agro-green hover:text-white px-8 py-6 text-lg" asChild>
            <Link to="/register">Pré-cadastre-se agora</Link>
          </Button>
        </div>

        {/* Parallax Statistics */}
        <div className="relative">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{
                  transform: `translateY(${scrollY * (0.05 + index * 0.02)}px)`
                }}
              >
                {/* Circular Graphic */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-agro-green-dark border-4 border-agro-gold flex items-center justify-center relative overflow-hidden">
                    {/* Animated background circle */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-agro-gold to-yellow-400 opacity-20"
                      style={{
                        transform: `scale(${1 + Math.sin(scrollY * 0.01 + index) * 0.1})`
                      }}
                    ></div>
                    
                    {/* Number */}
                    <div className="text-2xl font-bold text-agro-gold z-10 relative">
                      {stat.number}
                    </div>
                    
                    {/* Floating particles */}
                    <div 
                      className="absolute w-2 h-2 bg-agro-gold rounded-full opacity-60"
                      style={{
                        top: '20%',
                        right: '20%',
                        transform: `translate(${Math.sin(scrollY * 0.02 + index) * 10}px, ${Math.cos(scrollY * 0.02 + index) * 10}px)`
                      }}
                    ></div>
                    <div 
                      className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                      style={{
                        bottom: '30%',
                        left: '25%',
                        transform: `translate(${Math.cos(scrollY * 0.015 + index) * 8}px, ${Math.sin(scrollY * 0.015 + index) * 8}px)`
                      }}
                    ></div>
                  </div>
                  
                  {/* Outer ring animation */}
                  <div 
                    className="absolute inset-0 w-32 h-32 rounded-full border-2 border-agro-gold opacity-30"
                    style={{
                      transform: `scale(${1.2 + Math.sin(scrollY * 0.01 + index) * 0.1}) rotate(${scrollY * 0.1 + index * 90}deg)`
                    }}
                  ></div>
                </div>
                
                {/* Label */}
                <p className="text-gray-200 text-center text-sm leading-tight max-w-40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Background parallax elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-64 h-64 bg-agro-gold opacity-5 rounded-full"
          style={{
            top: '10%',
            right: '10%',
            transform: `translate(${scrollY * -0.05}px, ${scrollY * 0.03}px)`
          }}
        ></div>
        <div 
          className="absolute w-32 h-32 bg-white opacity-5 rounded-full"
          style={{
            bottom: '20%',
            left: '5%',
            transform: `translate(${scrollY * 0.08}px, ${scrollY * -0.02}px)`
          }}
        ></div>
      </div>
    </section>
  );
}
