
import { Warehouse, BadgePercent, Truck, ShieldCheck, Clock, Check } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
    <div className="w-12 h-12 bg-agro-green/10 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-agro-green-dark mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Features() {
  const mainFeatures = [
    {
      icon: <Warehouse className="w-6 h-6 text-agro-green" />,
      title: "Armazenagem de Insumos",
      description: "Tenha a disposição uma vasta rede de armazens parceiros que garantem a segurança até o periodo de uso dos produtos"
    },
    {
      icon: <BadgePercent className="w-6 h-6 text-agro-green" />,
      title: "Preços Competitivos",
      description: "Transações diretas eliminam intermediários, resultando em melhores preços para todos."
    },
    {
      icon: <Truck className="w-6 h-6 text-agro-green" />,
      title: "Logística Integrada",
      description: "Tenha a disposição uma vasta rede de armazens parceiros que garantem a segurança até o periodo de uso dos produtos"
    },
  ];

  const whyChooseUs = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-agro-green" />,
      title: "Transações Seguras",
      description: "Nossa plataforma garante segurança de pagamento, garantia de qualidade e conformidade regulatória."
    },
    {
      icon: <Clock className="w-6 h-6 text-agro-green" />,
      title: "Eficiência de Tempo",
      description: "Processos otimizados reduzem o tempo do pedido à entrega, economizando seu tempo valioso."
    },
    {
      icon: <Check className="w-6 h-6 text-agro-green" />,
      title: "Garantia de Qualidade",
      description: "Fornecedores verificados e controle de qualidade de produtos garantem que você receba o esperado."
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Transformando o Comércio de Insumos Agrícolas
          </h2>
          <p className="text-lg text-gray-600">
            Nossa plataforma B2B abrangente conecta fabricantes e distribuidores com ferramentas poderosas para otimizar operações e fazer crescer seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Porque Agro Ikemba é sua melhor opção em genéricos?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyChooseUs.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
