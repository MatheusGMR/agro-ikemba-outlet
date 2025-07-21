
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import NoScript from '@/components/seo/NoScript';

const Blog = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog Agro Ikemba",
    "description": "Conteúdo especializado em agronegócio, insumos agrícolas, defensivos, fertilizantes e inovações do setor rural brasileiro",
    "url": "https://www.agroikemba.com.br/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Agro Ikemba",
      "url": "https://www.agroikemba.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.agroikemba.com.br/wp-content/uploads/2025/05/Add-a-heading-3.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.agroikemba.com.br/blog"
    },
    "keywords": ["agronegócio", "insumos agrícolas", "defensivos", "fertilizantes", "agricultura", "genéricos"]
  };

  return (
    <>
      <Helmet>
        <title>Blog - Agro Ikemba | Conteúdo Especializado em Agronegócio</title>
        <meta name="description" content="Mantenha-se atualizado com as últimas novidades do agronegócio, dicas sobre insumos agrícolas, defensivos, fertilizantes, tendências de mercado e inovações tecnológicas no setor rural." />
        <meta name="keywords" content="blog agronegócio, insumos agrícolas, defensivos agrícolas, fertilizantes, sementes, agricultura sustentável, genéricos agrícolas, nutrição vegetal, manejo integrado, tecnologia agrícola" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content="Blog - Agro Ikemba | Conteúdo Especializado em Agronegócio" />
        <meta property="og:description" content="Mantenha-se atualizado com as últimas novidades do agronegócio e tendências de mercado." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.agroikemba.com.br/blog" />
        <meta property="og:site_name" content="AgroIkemba" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Agro Ikemba | Conteúdo Especializado em Agronegócio" />
        <meta name="twitter:description" content="Conteúdo especializado em agronegócio e insumos agrícolas" />
        <link rel="canonical" href="https://www.agroikemba.com.br/blog" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <NoScript />
      
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
