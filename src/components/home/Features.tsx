
import { useEffect, useState } from 'react';
import { Warehouse, BadgePercent, Truck, ShieldCheck, Clock, Check } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  scrollY: number;
}

const FeatureCard = ({
  icon,
  title,
  description,
  index,
  scrollY
}: FeatureCardProps) => (
  <div 
    className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
    style={{
      transform: `translateY(${scrollY * 0.02 * (index + 1)}px)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.3s ease'
    }}
  >
    <div className="w-12 h-12 bg-agro-green/10 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-agro-green-dark mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Features() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainFeatures = [{
    icon: <Warehouse className="w-6 h-6 text-agro-green" />,
    title: "Armazenagem de Insumos",
    description: "Tenha a disposição uma vasta rede de +150 armazens parceiros que garantem a segurança até o periodo de uso dos produtos"
  }, {
    icon: <BadgePercent className="w-6 h-6 text-agro-green" />,
    title: "Preços Competitivos",
    description: "Transações mais simples, resultando em melhores preços para todos, +20% de ganho financeiro."
  }, {
    icon: <Truck className="w-6 h-6 text-agro-green" />,
    title: "Logística Integrada",
    description: "Tenha a disposição uma vasta rede de +50 Operadores e Transportadoras que garantem a segurança até o periodo de uso dos produtos"
  }];

  const whyChooseUs = [{
    icon: <ShieldCheck className="w-6 h-6 text-agro-green" />,
    title: "Melhor preço",
    description: "Temos um modelo de operação de baixo custo, 20% menor que o mercado, como resultado damos ao comprador os melhores preços."
  }, {
    icon: <Clock className="w-6 h-6 text-agro-green" />,
    title: "Eficiência de Tempo",
    description: "Processos otimizados reduzem até 25% o tempo do pedido à entrega, economizando seu tempo valioso."
  }, {
    icon: <Check className="w-6 h-6 text-agro-green" />,
    title: "Garantia de Qualidade",
    description: "Fornecedores 100% verificados e controle de qualidade de produtos garantem que você receba o esperado."
  }];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      <div className="container-custom relative z-10">
        <div 
          className="text-center max-w-3xl mx-auto mb-16"
          style={{
            transform: `translateY(${scrollY * 0.05}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Transformando o comércio de insumos agrícolas
          </h2>
          <p className="text-lg text-gray-600">
            Nossa plataforma B2B abrangente conecta fabricantes e importadores ao mercado, com processo simples e ágil para vender genéricos com preços imbatíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description}
              index={index}
              scrollY={scrollY}
            />
          ))}
        </div>

        <div 
          className="text-center max-w-3xl mx-auto mb-16"
          style={{
            transform: `translateY(${scrollY * 0.03}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-700">
            Porque <span className="text-agro-green">Agro Ikemba</span> é sua melhor opção em genéricos?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyChooseUs.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description}
              index={index + 3}
              scrollY={scrollY}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
