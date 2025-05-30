import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

const Testimonial = ({ quote, author, role, company, rating }: TestimonialProps) => (
  <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-5 h-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
    <blockquote className="text-gray-700 mb-6 italic">"{quote}"</blockquote>
    <div>
      <p className="font-semibold">{author}</p>
      <p className="text-gray-600 text-sm">{role}, {company}</p>
    </div>
  </div>
);

export default function Testimonials() {
  const testimonials = [
    {
      quote: "O Agro Ikemba transformou a maneira como obtemos insumos agrícolas. Vimos uma redução de 30% nos custos de aquisição e melhoramos significativamente os prazos de entrega.",
      author: "Ricardo Silva",
      role: "Gerente de Compras",
      company: "AgriCoop Distribuidores",
      rating: 5
    },
    {
      quote: "Como fabricante, expandimos nosso alcance de mercado em 40% desde que nos juntamos à plataforma. A conexão direta com distribuidores tem sido inestimável para o crescimento do nosso negócio.",
      author: "Maria Gonzalez",
      role: "Diretora de Vendas",
      company: "EcoAgro Produtos",
      rating: 5
    },
    {
      quote: "A integração logística da plataforma resolveu nosso maior desafio. Agora podemos nos concentrar nas atividades principais do negócio em vez de lidar com arranjos de envio complicados.",
      author: "João Oliveira",
      role: "Diretor de Operações",
      company: "Suprimentos Rurais Ltda",
      rating: 4
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            O Que Nossos Parceiros Dizem
          </h2>
          <p className="text-lg text-gray-600">
            Ouça dos fabricantes e distribuidores que transformaram seus negócios com o Agro Ikemba.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
