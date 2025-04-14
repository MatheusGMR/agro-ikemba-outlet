import { Check, TrendingUp, BadgePercent, Truck, ShieldCheck, Clock } from 'lucide-react';

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
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-agro-green" />,
      title: "Crescimento de Negócios",
      description: "Expanda seu alcance para novos mercados e clientes com visibilidade em uma plataforma B2B confiável."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
