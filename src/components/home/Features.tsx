import { Warehouse, BadgePercent, Truck, ShieldCheck, Clock, Check, Leaf, Bug, Shield as FungicideIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({
  icon,
  title,
  description
}: FeatureCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-brand-green-dark mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface ProductCardProps {
  name: string;
  activeIngredient: string;
  type: string;
  icon: React.ReactNode;
}

const ProductCard = ({ name, activeIngredient, type, icon }: ProductCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-brand-green-dark mb-2 text-center">{name}</h3>
    <p className="text-sm text-gray-600 mb-1 text-center"><strong>Princípio Ativo:</strong> {activeIngredient}</p>
    <p className="text-sm text-primary font-medium text-center">{type}</p>
  </div>
);

export default function Features() {
  const mainFeatures = [{
    icon: <Warehouse className="w-6 h-6 text-primary" />,
    title: "Armazenagem de Insumos",
    description: "Tenha a disposição uma vasta rede de +150 armazens parceiros que garantem a segurança até o periodo de uso dos produtos"
  }, {
    icon: <BadgePercent className="w-6 h-6 text-primary" />,
    title: "Preços Competitivos",
    description: "Transações mais simples, resultando em melhores preços para todos, +20% de ganho financeiro."
  }, {
    icon: <Truck className="w-6 h-6 text-primary" />,
    title: "Logística Integrada",
    description: "Tenha a disposição uma vasta rede de +50 Operadores e Transportadoras que garantem a segurança até o periodo de uso dos produtos"
  }];

  const whyChooseUs = [{
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Melhor preço",
    description: "Temos um modelo de operação de baixo custo, 20% menor que o mercado, como resultado damos ao comprador os melhores preços."
  }, {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: "Eficiência de Tempo",
    description: "Processos otimizados reduzem até 25% o tempo do pedido à entrega, economizando seu tempo valioso."
  }, {
    icon: <Check className="w-6 h-6 text-primary" />,
    title: "Garantia de Qualidade",
    description: "Fornecedores 100% verificados e controle de qualidade de produtos garantem que você receba o esperado."
  }];

  const genericProducts = [
    {
      name: "Glifosato",
      activeIngredient: "Glyphosate",
      type: "Herbicida não seletivo",
      icon: <Leaf className="w-8 h-8 text-green-600" />
    },
    {
      name: "2,4-D",
      activeIngredient: "2,4-D",
      type: "Herbicida seletivo para folhas largas",
      icon: <Leaf className="w-8 h-8 text-green-600" />
    },
    {
      name: "Atrazina",
      activeIngredient: "Atrazine",
      type: "Herbicida seletivo",
      icon: <Leaf className="w-8 h-8 text-green-600" />
    },
    {
      name: "Acefato",
      activeIngredient: "Acephate",
      type: "Inseticida (Organofosforado)",
      icon: <Bug className="w-8 h-8 text-orange-600" />
    },
    {
      name: "Mancozeb",
      activeIngredient: "Mancozeb",
      type: "Fungicida protetor (Multissítio)",
      icon: <FungicideIcon className="w-8 h-8 text-blue-600" />
    }
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-green-dark">
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
            />
          ))}
        </div>

        {/* Generic Products Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-green-dark">
            Genéricos de Qualidade
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Produtos que o mercado já conhece e confia, com a qualidade e preços competitivos que você espera
          </p>
          
          {/* Illustrative Image */}
          <div className="mb-12">
            <img 
              src="/lovable-uploads/6aea75d9-eade-440b-8bf4-099785748206.png" 
              alt="Produtos agrícolas genéricos de qualidade" 
              className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
            />
          </div>

          {/* Carousel for Products */}
          <div className="relative px-12">
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {genericProducts.map((product, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/1 sm:basis-1/2 lg:basis-1/3">
                    <ProductCard 
                      name={product.name}
                      activeIngredient={product.activeIngredient}
                      type={product.type}
                      icon={product.icon}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </div>

        <div id="why-choose-us" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-700">
            Porque <span className="text-primary">Agro Ikemba</span> é sua melhor opção em genéricos?
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
