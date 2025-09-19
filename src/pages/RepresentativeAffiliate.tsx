import { Helmet } from 'react-helmet-async';
import { RepresentativeApplicationForm } from '@/components/representative/RepresentativeApplicationForm';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, TrendingUp, Handshake } from 'lucide-react';

export default function RepresentativeAffiliate() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Comissão Atrativa",
      description: "Sistema de comissão competitivo sobre vendas efetivadas com possibilidade de bonificação por indicação"
    },
    {
      icon: Handshake,
      title: "Suporte Completo",
      description: "Acompanhamento técnico e comercial para maximizar suas oportunidades de vendas"
    },
    {
      icon: Users,
      title: "Rede Consolidada", 
      description: "Faça parte da maior rede de distribuição de genéricos do agronegócio"
    }
  ];

  const requirements = [
    "Pessoa jurídica ativa (MEI ou empresa)",
    "Experiência comprovada no agronegócio",
    "Infraestrutura básica (celular, internet, veículo)",
    "Disponibilidade para atuar na sua região"
  ];

  return (
    <>
      <Helmet>
        <title>Seja Representante Técnico Afiliado | AgroIkemba</title>
        <meta name="description" content="Torne-se um Representante Técnico Afiliado da AgroIkemba. Comissões atrativas, suporte completo e acesso à maior rede de genéricos do agronegócio." />
        <meta name="keywords" content="representante técnico, afiliado, agronegócio, comissão, vendas, AgroIkemba" />
        <link rel="canonical" href={`${window.location.origin}/representante-afiliado`} />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M50 50c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div className="container-custom relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Seja Representante Técnico
              <br />
              <span className="text-primary">Afiliado AgroIkemba</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Faça parte da maior rede de distribuição de produtos genéricos do agronegócio. 
              Oportunidades exclusivas, comissões atrativas e suporte técnico especializado.
            </p>

            <div className="flex justify-center">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Programa de Recrutamento Ativo
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-card/30">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que ser um Representante AgroIkemba?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Oferecemos as melhores condições do mercado para profissionais experientes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="p-6 text-center hover-scale">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </Card>
                );
              })}
            </div>

            {/* Requirements */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Requisitos Básicos</h3>
              <Card className="p-6">
                <ul className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Candidate-se Agora
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 5 dias úteis
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <RepresentativeApplicationForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}