
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
        Step {step}
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
      title: "Register Your Business",
      description: "Create your account and complete your manufacturer profile with company details and credentials."
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "List Your Products",
      description: "Add your agricultural input products with detailed descriptions, specifications, and pricing options."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Manage Orders & Analytics",
      description: "Process incoming orders, track performance, and gain insights from comprehensive analytics."
    },
  ];
  
  const distributorSteps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Browse Products",
      description: "Search and filter through a comprehensive catalog of agricultural inputs from verified manufacturers."
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Place Orders",
      description: "Select products, quantities, and request quotes or place orders directly through the platform."
    },
    {
      icon: <TruckIcon className="w-5 h-5" />,
      title: "Track & Receive",
      description: "Monitor order status, arrange logistics, and manage your inventory efficiently."
    },
  ];

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            How Agro Ikemba Works
          </h2>
          <p className="text-lg text-gray-600">
            Our platform simplifies the process for both agricultural input manufacturers and distributors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-md">
            <h3 className="text-2xl font-bold mb-8 text-agro-green">For Manufacturers</h3>
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
            <h3 className="text-2xl font-bold mb-8 text-agro-earth">For Distributors</h3>
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
