import { UnifiedRegistrationForm } from '@/components/auth/UnifiedRegistrationForm';

export default function PreRegistration() {

  return (
    <section id="pre-cadastro" className="py-20 bg-gray-50 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M50 50c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua compra de produtos pós patente?
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Junte-se ao Agro Ikemba hoje e experimente os benefícios de conexões diretas, 
            transações simplificadas e serviços integrados adaptados para a melhora compra de seus genéricos.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Solicitar acesso antecipado</h3>
            <p className="text-gray-600">
              Seja um dos primeiros a experimentar a revolução no mercado de insumos agrícolas.
            </p>
          </div>
          
          <UnifiedRegistrationForm context="preregistration" />
          
          <p className="text-sm text-gray-500 text-center mt-6">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="text-agro-green hover:underline">Termos de Serviço</a>
            {' '}e{' '}
            <a href="#" className="text-agro-green hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
