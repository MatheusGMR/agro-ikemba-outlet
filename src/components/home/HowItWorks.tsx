
import { User, Search, ShoppingCart, Truck } from 'lucide-react';

const steps = [
  {
    icon: <User className="w-8 h-8 text-agro-green" />,
    number: "1",
    title: "Cadastre-se",
    description: "Crie sua conta como distribuidor ou indústria em poucos minutos e acesse condições comerciais exclusivas"
  },
  {
    icon: <Search className="w-8 h-8 text-agro-green" />,
    number: "2",
    title: "Encontre Produtos",
    description: "Acesse nosso catálogo completo de insumos agrícolas com preços diferenciados"
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-agro-green" />,
    number: "3",
    title: "Faça seu Pedido",
    description: "Selecione os produtos, quantidades e aproveite nossas linhas de crédito exclusivas"
  },
  {
    icon: <Truck className="w-8 h-8 text-agro-green" />,
    number: "4",
    title: "Receba",
    description: "Conte com nossa rede logística integrada de transportadoras e armazéns parceiros"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-agro-green font-medium mb-4">PROCESSO SIMPLIFICADO</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como funciona a Agro Ikemba
          </h2>
          <p className="text-gray-600 text-lg">
            Conectamos você aos melhores insumos agrícolas com condições comerciais diferenciadas
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center relative transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg rounded-xl p-6"
              >
                {/* Icon circle with hover effect */}
                <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center mb-6 relative z-10 transition-all duration-300 hover:border-agro-green group">
                  <div className="w-16 h-16 rounded-full bg-agro-green/10 flex items-center justify-center transition-all duration-300 group-hover:bg-agro-green/20">
                    {step.icon}
                  </div>
                </div>
                {/* Step number */}
                <div className="absolute top-0 right-0 md:right-4 w-8 h-8 bg-agro-green text-white rounded-full flex items-center justify-center font-bold z-20">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 transition-colors duration-300 group-hover:text-agro-green">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
