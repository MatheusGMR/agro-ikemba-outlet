import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RegistrationForm from '@/components/auth/RegistrationForm';
export default function Registration() {
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-agro-neutral py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              <span className="text-black">Crie seu </span>
              <span className="text-agro-green">cadastro</span>
            </h1>
            <RegistrationForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}