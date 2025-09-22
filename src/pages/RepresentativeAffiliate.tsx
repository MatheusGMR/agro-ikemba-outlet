import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { RepresentativeApplicationForm } from '@/components/representative/RepresentativeApplicationForm';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, TrendingUp, Handshake, FileCheck, Award, Users2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function RepresentativeAffiliate() {
  const heroRef = useScrollAnimation();
  const benefitsRef = useScrollAnimation();
  const valueRef = useScrollAnimation(); 
  const foundersRef = useScrollAnimation();
  const requirementsRef = useScrollAnimation();
  const formRef = useScrollAnimation();

  const benefits = [
    {
      icon: TrendingUp,
      title: "Ganhe de 0,75% a 1,50% do volume vendido",
      description: "Sistema de comissão competitivo sobre vendas efetivadas com possibilidade de bonificação por indicação"
    },
    {
      icon: Handshake,
      title: "Campanhas Digitais para sua região",
      description: "Maximizamos a geração de leads direcionado para sua região de atuação"
    },
    {
      icon: Users,
      title: "Valorize sua trajetória e pioneirismo", 
      description: "Faça parte do Outlet do Agro, pioneira em tecnologia inteligente"
    },
    {
      icon: FileCheck,
      title: "Venda e Deixe a burocracia",
      description: "Foque na venda a logística, e processos administrativos é com a gente."
    }
  ];

  const founders = [
    {
      name: "Renato Seraphim",
      role: "Founder & Estrategista",
      image: "/assets/founders/renato-seraphim.png",
      bio: "Estrategista, CEO e membro de conselho com uma visão de liderança no agronegócio de alta performance. Focado em inovação, tecnologia e transformação digital, é fundador da Agro Ikemba e autor do livro \"Estratégia e Fé\". Com experiência como CEO na Albaugh, AgroGalaxy, com legado também na Syngenta, Bayer, UPL. Atualmente é Associate na ADIMAG, Professor de Marketing e Vendas na Terras Gerais Educação e Elevagro, e Board Member e fundador da SMALL NANOTECHNOLOGY e NIRUS."
    },
    {
      name: "Matheus Roldan", 
      role: "Co-Founder & CEO",
      image: "/assets/founders/matheus-roldan.png",
      bio: "Profissional de Marketing & Sales com vasta experiência em ideiação, execução, desenvolvimento de times, economia comportamental e marketing. Atuou como Marketing & Sales Enablement - CMO no Genesis Group, é fundador da Legac-y Consulting, e teve anos de experiência na Syngenta, AgroGalaxy, e Ourofino. Especialista em transformar a agricultura brasileira e o comportamento do agricultor, com foco em tecnologias digitais e economia comportamental."
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

      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M50 50c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div 
            ref={heroRef.ref}
            className={`container-custom relative z-10 text-center transition-all duration-1000 ${
              heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-6">
              <p className="text-xl md:text-2xl text-primary font-semibold mb-4">
                Conquiste sua autonomia
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient">
                Seja Representante Técnico
                <br />
                <span className="text-primary">Afiliado AgroIkemba</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Aproveite sua experiência e relacionamentos para ganhar como afiliado do Outlet do Agro!
            </p>

            <div className="flex justify-center">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 animate-pulse">
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
          <div 
            ref={benefitsRef.ref}
            className={`container-custom transition-all duration-1000 delay-200 ${
              benefitsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
              {/* Image */}
              <div className="flex-shrink-0 lg:w-1/2">
                <img 
                  src="/assets/representantes-agroikemba.png" 
                  alt="Representantes AgroIkemba"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 lg:w-1/2">
                <div className="text-center lg:text-left mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Por que ser um Representante AgroIkemba?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Oferecemos as melhores condições do mercado para profissionais experientes
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <Card 
                        key={index} 
                        className={`p-6 text-center hover-scale transition-all duration-700 ${
                          benefitsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                        style={{ transitionDelay: `${400 + index * 100}ms` }}
                      >
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-16 bg-primary/5">
          <div 
            ref={valueRef.ref}
            className={`container-custom transition-all duration-1000 delay-300 ${
              valueRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Valorizamos seu relacionamento
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Acreditamos que o sucesso vem de parcerias duradouras. Por isso, investimos no seu crescimento, 
                oferecendo as ferramentas e o suporte necessários para que você alcance seus objetivos.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Autonomia</h3>
                  <p className="text-muted-foreground">Trabalhe no seu ritmo e gerencie seu território</p>
                </Card>
                <Card className="p-6 text-center">
                  <Users2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Relacionamento</h3>
                  <p className="text-muted-foreground">Parceria genuína focada no seu sucesso</p>
                </Card>
                <Card className="p-6 text-center">
                  <FileCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Simplicidade</h3>
                  <p className="text-muted-foreground">Processos descomplicados e suporte completo</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-16">
          <div 
            ref={foundersRef.ref}
            className={`container-custom transition-all duration-1000 delay-400 ${
              foundersRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Liderados por Especialistas do Agronegócio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nossa liderança combina décadas de experiência no setor com visão inovadora para o futuro do agronegócio
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {founders.map((founder, index) => (
                <Card 
                  key={index} 
                  className={`p-8 text-center md:text-left transition-all duration-700 ${
                    foundersRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${600 + index * 200}ms` }}
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={founder.image} 
                        alt={founder.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
                      <p className="text-primary font-semibold mb-4">{founder.role}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{founder.bio}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 bg-card/30">
          <div 
            ref={requirementsRef.ref}
            className={`container-custom transition-all duration-1000 delay-500 ${
              requirementsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
                O que é importante para começar?
              </h2>
              <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">Requisitos Básicos</h3>
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
          <div 
            ref={formRef.ref}
            className={`container-custom transition-all duration-1000 delay-600 ${
              formRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
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
      
      <Footer />
    </>
  );
}