
import { Truck, Warehouse, MapPin, Shield } from 'lucide-react';

export default function LogisticsPartners() {
  const logisticsStats = [
    {
      icon: <Warehouse className="w-8 h-8 text-primary" />,
      number: "150+",
      title: "Armazéns Parceiros",
      description: "Rede de armazenagem estrategicamente distribuída"
    },
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      number: "50+",
      title: "Transportadoras",
      description: "Operadores logísticos especializados"
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary" />,
      number: "100%",
      title: "Cobertura Nacional",
      description: "Atendimento em todo território brasileiro"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      number: "24/7",
      title: "Monitoramento",
      description: "Rastreamento completo da sua carga"
    }
  ];

  const partnerFeatures = [
    {
      title: "Armazenagem Segura",
      description: "Instalações com controle de temperatura e umidade para preservar a qualidade dos produtos até o momento do uso."
    },
    {
      title: "Logística Integrada",
      description: "Coordenação completa entre armazéns e transportadoras para garantir entregas no prazo certo."
    },
    {
      title: "Rastreamento em Tempo Real",
      description: "Acompanhe sua carga desde a saída do armazém até a entrega final com total transparência."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm10 0c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-green-dark">
            Parceiros Logísticos
          </h2>
          <p className="text-lg text-gray-600">
            Uma rede robusta de armazéns e transportadoras para garantir que seus insumos cheguem com segurança e no prazo certo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {logisticsStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <h3 className="text-lg font-semibold text-brand-green-dark mb-2">{stat.title}</h3>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {partnerFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-brand-green-dark mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-primary/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-brand-green-dark mb-4">
              Pronto para conhecer nossa rede logística?
            </h3>
            <p className="text-gray-600 mb-6">
              Faça parte de uma cadeia de suprimentos eficiente e confiável
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Seguro e Confiável
              </span>
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Entrega Garantida
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
