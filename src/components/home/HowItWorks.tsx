
import { User, Building, Search, BarChart3, ShoppingCart, TruckIcon } from 'lucide-react';

interface StepProps {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
  userType: 'manufacturer' | 'distributor';
}

const Step = ({ icon, step, title, description, isLast, userType }: StepProps) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
        userType === 'manufacturer' ? 'bg-agro-green' : 'bg-agro-earth'
      }`}>
        {icon}
      </div>
      {!isLast && (
        <div className={`w-0.5 grow mt-2 ${
          userType === 'manufacturer' ? 'bg-agro-green/30' : 'bg-agro-earth/30'
        }`}></div>
      )}
    </div>
    <div className="pb-10">
      <span className={`text-sm font-medium ${
        userType === 'manufacturer' ? 'text-agro-green' : 'text-agro-earth'
      }`}>
        Passo {step}
      </span>
      <h3 className="text-xl font-semibold mt-1 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default function HowItWorks() {
  const manufacturerSteps = [
    {
      icon: <User className="w-5 h-5" />,
      title: "Registre sua Empresa",
      description: "Crie sua conta e complete seu perfil de fabricante com detalhes da empresa e credenciais."
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "Liste seus Produtos",
      description: "Adicione seus insumos agrícolas com descrições detalhadas, especificações e opções de preço."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Gerencie Pedidos & Análises",
      description: "Processe pedidos recebidos, acompanhe o desempenho e obtenha insights de análises abrangentes."
    },
  ];
  
  const distributorSteps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Navegue pelos Produtos",
      description: "Pesquise e filtre um catálogo abrangente de insumos agrícolas de fabricantes verificados."
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Faça Pedidos",
      description: "Selecione produtos, quantidades e solicite cotações ou faça pedidos diretamente pela plataforma."
    },
    {
      icon: <TruckIcon className="w-5 h-5" />,
      title: "Acompanhe & Receba",
      description: "Monitore o status do pedido, organize a logística e gerencie seu estoque com eficiência."
    },
  ];

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            Como o Agro Ikemba Funciona
          </h2>
          <p className="text-lg text-gray-600">
            Nossa plataforma simplifica o processo tanto para fabricantes quanto para distribuidores de insumos agrícolas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-md">
            <h3 className="text-2xl font-bold mb-8 text-agro-green">Para Fabricantes</h3>
            <div className="space-y-0">
              {manufacturerSteps.map((step, index) => (
                <Step 
                  key={index}
                  icon={step.icon}
                  step={index + 1}
                  title={step.title}
                  description={step.description}
                  isLast={index === manufacturerSteps.length - 1}
                  userType="manufacturer"
                />
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-md">
            <h3 className="text-2xl font-bold mb-8 text-agro-earth">Para Distribuidores</h3>
            <div className="space-y-0">
              {distributorSteps.map((step, index) => (
                <Step 
                  key={index}
                  icon={step.icon}
                  step={index + 1}
                  title={step.title}
                  description={step.description}
                  isLast={index === distributorSteps.length - 1}
                  userType="distributor"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
