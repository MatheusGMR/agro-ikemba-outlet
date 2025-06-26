
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog - Agro Ikemba | Conteúdo Especializado em Agronegócio</title>
        <meta name="description" content="Mantenha-se atualizado com as últimas novidades do agronegócio, dicas sobre insumos agrícolas, tendências de mercado e inovações tecnológicas no setor." />
        <meta name="keywords" content="blog agronegócio, insumos agrícolas, defensivos agrícolas, fertilizantes, sementes, agricultura sustentável" />
        <meta property="og:title" content="Blog - Agro Ikemba | Conteúdo Especializado em Agronegócio" />
        <meta property="og:description" content="Mantenha-se atualizado com as últimas novidades do agronegócio e tendências de mercado." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agroikemba.com.br/blog" />
        <link rel="canonical" href="https://agroikemba.com.br/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog Agro Ikemba",
            "description": "Conteúdo especializado em agronegócio, insumos agrícolas e inovações do setor",
            "url": "https://agroikemba.com.br/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Agro Ikemba",
              "url": "https://agroikemba.com.br"
            }
          })}
        </script>
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          <Navbar />
          <main className="flex-1">
            <BlogHero />
            <div className="container-custom py-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <BlogGrid />
                </div>
                <div className="lg:col-span-1">
                  <BlogSidebar />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default Blog;
