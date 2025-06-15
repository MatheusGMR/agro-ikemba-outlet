
import { Users, Search, Handshake, Truck } from 'lucide-react';

const steps = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Cadastre-se",
    description: "Faça seu cadastro e aguarde aprovação para acessar nossa plataforma"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "Encontre Produtos",
    description: "Navegue por nosso catálogo de insumos agrícolas com preços competitivos"
  },
  {
    icon: <Handshake className="w-8 h-8" />,
    title: "Negocie",
    description: "Entre em contato direto com fornecedores e negocie as melhores condições"
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Receba",
    description: "Conte com nossa logística integrada para entrega segura e rápida"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600">
            Processo simples e eficiente para conectar você aos melhores fornecedores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-agro-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-agro-green">
                  {step.icon}
                </div>
              </div>
              <div className="w-8 h-8 bg-agro-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-agro-green-dark mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
