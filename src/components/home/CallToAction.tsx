import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
export default function CallToAction() {
  const stats = [{
    value: "25%",
    label: "Redução média em tempo"
  }, {
    value: "10.000",
    label: "Distribuidores e Cooperativas mapeados"
  }, {
    value: "16.000",
    label: "Agricultores mapeados"
  }, {
    value: "30%",
    label: "Redução média de custos"
  }];
  return <section className="py-20 bg-agro-green text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm10 0c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30z'/%3E%3C/g%3E%3C/svg%3E")`
    }} />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-1 items-center">
          <div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-agro-green hover:bg-agro-green hover:text-white px-8 py-6 text-lg" asChild>
                
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => <div key={index} className="bg-agro-green-dark rounded-lg p-6 px-[23px]">
                <div className="text-3xl font-bold mb-2 text-agro-gold">{stat.value}</div>
                <p className="text-gray-200">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
}