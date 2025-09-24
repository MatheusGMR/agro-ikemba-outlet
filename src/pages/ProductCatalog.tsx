import { Helmet } from 'react-helmet-async';
import ProductCatalogComponent from '@/components/ui/custom/ProductCatalogComponent';

export default function ProductCatalog() {
  return (
    <>
      <Helmet>
        <title>Catálogo de Produtos - AgroIkemba | Defensivos Agrícolas</title>
        <meta 
          name="description" 
          content="Explore nosso catálogo completo de defensivos agrícolas. Herbicidas, fungicidas, inseticidas e fertilizantes com os melhores preços do mercado."
        />
        <meta 
          name="keywords" 
          content="defensivos agrícolas, herbicidas, fungicidas, inseticidas, fertilizantes, agrotóxicos, produtos agrícolas, catálogo"
        />
        <link rel="canonical" href="https://agroikemba.com.br/products" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Catálogo de Produtos - AgroIkemba" />
        <meta property="og:description" content="Explore nosso catálogo completo de defensivos agrícolas com os melhores preços do mercado." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agroikemba.com.br/products" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Catálogo de Produtos - AgroIkemba" />
        <meta name="twitter:description" content="Explore nosso catálogo completo de defensivos agrícolas com os melhores preços do mercado." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Catálogo de Defensivos Agrícolas",
            "description": "Catálogo completo de defensivos agrícolas, herbicidas, fungicidas, inseticidas e fertilizantes",
            "url": "https://agroikemba.com.br/products",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Produtos Agrícolas",
              "description": "Lista de produtos defensivos agrícolas disponíveis"
            }
          })}
        </script>
      </Helmet>

      <ProductCatalogComponent />
    </>
  );
}