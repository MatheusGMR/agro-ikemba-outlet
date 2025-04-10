
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
          className={`w-5 h-5 ${i < rating ? 'text-agro-gold fill-agro-gold' : 'text-gray-300'}`}
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
      quote: "Agro Ikemba has transformed how we source agricultural inputs. We've seen a 30% reduction in procurement costs and significantly improved delivery times.",
      author: "Ricardo Silva",
      role: "Purchasing Manager",
      company: "AgriCoop Distributors",
      rating: 5
    },
    {
      quote: "As a manufacturer, we've expanded our market reach by 40% since joining the platform. The direct connection to distributors has been invaluable for our business growth.",
      author: "Maria Gonzalez",
      role: "Sales Director",
      company: "EcoAgro Products",
      rating: 5
    },
    {
      quote: "The platform's logistics integration solved our biggest challenge. Now we can focus on core business activities instead of complicated shipping arrangements.",
      author: "João Oliveira",
      role: "Operations Director",
      company: "Rural Supplies Ltd",
      rating: 4
    }
  ];

  return (
    <section className="py-20 bg-agro-beige/30">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-agro-green-dark">
            What Our Partners Say
          </h2>
          <p className="text-lg text-gray-600">
            Hear from the manufacturers and distributors who have transformed their businesses with Agro Ikemba.
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
