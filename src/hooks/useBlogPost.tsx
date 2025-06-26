
import { useQuery } from '@tanstack/react-query';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags?: string[];
  slug: string;
}

// Mock data - mesmo do useBlogPosts
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'A Importância dos Insumos Agrícolas Genéricos: Economia e Eficiência na Agricultura Moderna',
    content: `
      <div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-6">Introdução: O Que São Insumos Agrícolas Genéricos?</h2>
        
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Os insumos agrícolas genéricos representam uma alternativa econômica e eficiente aos produtos de marca no agronegócio brasileiro. Estes produtos, que incluem fertilizantes, defensivos agrícolas e sementes, oferecem a mesma qualidade e eficácia dos produtos originais, porém com preços mais acessíveis.
        </p>
        
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          No cenário atual do agronegócio, onde a competitividade e a sustentabilidade econômica são fundamentais, os insumos genéricos emergem como uma solução estratégica para produtores rurais de todos os portes.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Vantagens Econômicas dos Insumos Agrícolas Genéricos</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Redução de Custos Operacionais</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          A principal vantagem dos insumos genéricos é a <strong class="text-primary font-semibold">redução significativa dos custos de produção</strong>. Estudos indicam que produtores podem economizar entre 20% a 40% nos custos com insumos ao optar por alternativas genéricas de qualidade.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Maior Acessibilidade para Pequenos Produtores</h3>
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Os insumos genéricos democratizam o acesso a tecnologias agrícolas avançadas, permitindo que pequenos e médios produtores utilizem produtos de alta qualidade sem comprometer sua viabilidade econômica.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Qualidade e Eficácia: Desmistificando Preconceitos</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Rigor Regulatório</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Todos os insumos genéricos comercializados no Brasil passam pelo mesmo rigor regulatório que os produtos originais. O <strong class="text-primary font-semibold">Ministério da Agricultura, Pecuária e Abastecimento (MAPA)</strong> e a <strong class="text-primary font-semibold">ANVISA</strong> garantem que estes produtos atendam aos mesmos padrões de qualidade e segurança.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Equivalência Bioativa</h3>
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Os princípios ativos dos insumos genéricos são idênticos aos dos produtos de referência, garantindo a mesma eficácia no controle de pragas, doenças e na nutrição das plantas.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Impacto na Sustentabilidade da Agricultura</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Sustentabilidade Econômica</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          A utilização de insumos genéricos contribui para a <strong class="text-primary font-semibold">sustentabilidade econômica</strong> das propriedades rurais, permitindo maior reinvestimento em tecnologia, infraestrutura e expansão da produção.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Competitividade Internacional</h3>
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Com custos de produção reduzidos, o agronegócio brasileiro torna-se mais competitivo no mercado internacional, fortalecendo a posição do país como grande exportador de commodities agrícolas.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Principais Categorias de Insumos Genéricos</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Fertilizantes Genéricos</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Incluem formulações NPK, micronutrientes e fertilizantes orgânicos que oferecem a mesma nutrição essencial para as culturas com preços mais acessíveis.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Defensivos Genéricos</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Herbicidas, fungicidas e inseticidas genéricos proporcionam proteção eficaz das culturas contra pragas e doenças, mantendo os padrões de qualidade exigidos.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Sementes e Mudas</h3>
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Variedades genéricas selecionadas oferecem alta produtividade e adaptação às condições climáticas brasileiras.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Como Escolher Insumos Genéricos de Qualidade</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Verificação de Registro</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Sempre verifique se o produto possui registro no MAPA e se está em conformidade com as normas regulatórias vigentes.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Análise de Composição</h3>
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Compare a composição química e os princípios ativos com os produtos de referência para garantir equivalência.
        </p>
        
        <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Reputação do Fabricante</h3>
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Opte por fornecedores com boa reputação no mercado e que ofereçam suporte técnico adequado.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Tendências e Perspectivas Futuras</h2>
        
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          O mercado de insumos genéricos no Brasil está em franca expansão, impulsionado pela crescente conscientização dos produtores sobre os benefícios econômicos e pela melhoria contínua da qualidade destes produtos.
        </p>
        
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          Especialistas preveem que os insumos genéricos representarão uma parcela cada vez maior do mercado brasileiro de insumos agrícolas, contribuindo para a modernização e sustentabilidade do setor.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Conclusão</h2>
        
        <p class="text-lg leading-relaxed mb-6 text-gray-700">
          Os insumos agrícolas genéricos representam uma oportunidade valiosa para o agronegócio brasileiro, oferecendo <strong class="text-primary font-semibold">economia, qualidade e sustentabilidade</strong>. A adoção responsável destes produtos pode contribuir significativamente para o aumento da competitividade e rentabilidade das propriedades rurais.
        </p>
        
        <p class="text-lg leading-relaxed mb-8 text-gray-700">
          À medida que o mercado se desenvolve e a regulamentação se aperfeiçoa, os insumos genéricos consolidam-se como uma alternativa inteligente e estratégica para produtores que buscam otimizar seus recursos sem comprometer a qualidade da produção.
        </p>
      </div>
    `,
    excerpt: 'Descubra como os insumos agrícolas genéricos podem revolucionar sua produção, oferecendo economia de até 40% nos custos operacionais sem comprometer a qualidade. Um guia completo sobre qualidade, regulamentação e benefícios para o agronegócio brasileiro.',
    featuredImage: '/lovable-uploads/cc866595-a7de-4eca-b055-09f1bb8beb61.png',
    author: 'Comunicação AgroIkemba',
    publishedAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
    category: 'Insumos Agrícolas',
    tags: ['Insumos Genéricos', 'Fertilizantes', 'Defensivos Agrícolas', 'Economia Rural', 'Sustentabilidade', 'Agronegócio', 'Produtividade', 'MAPA', 'Competitividade'],
    slug: 'importancia-insumos-agricolas-genericos'
  },
  // ... outros posts mocados
];

export const useBlogPost = (slug?: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const post = mockPosts.find(post => post.slug === slug);
      return post || null;
    },
    enabled: !!slug
  });
};
