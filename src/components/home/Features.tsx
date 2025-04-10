
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
      title: "Business Growth",
      description: "Expand your reach to new markets and customers with visibility on a trusted B2B platform."
    },
    {
      icon: <BadgePercent className="w-6 h-6 text-agro-green" />,
      title: "Competitive Pricing",
      description: "Direct transactions eliminate intermediaries, resulting in better prices for everyone."
    },
    {
      icon: <Truck className="w-6 h-6 text-agro-green" />,
      title: "Integrated Logistics",
      description: "Access optimized shipping solutions, warehouse options, and delivery tracking."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-agro-green" />,
      title: "Secure Transactions",
      description: "Our platform ensures payment security, quality assurance, and regulatory compliance."
    },
    {
      icon: <Clock className="w-6 h-6 text-agro-green" />,
      title: "Time Efficiency",
      description: "Streamlined processes reduce the time from order to delivery, saving you valuable time."
    },
    {
      icon: <Check className="w-6 h-6 text-agro-green" />,
      title: "Quality Assurance",
      description: "Verified suppliers and product quality control ensures you get what you expect."
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Transforming Agricultural Input Trading
          </h2>
          <p className="text-lg text-gray-600">
            Our comprehensive B2B platform connects manufacturers and distributors with powerful tools to streamline operations and grow your business.
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
