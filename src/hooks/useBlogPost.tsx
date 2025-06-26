
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
    title: 'Tendências do Mercado de Defensivos Agrícolas para 2024',
    content: `
      <h2>Introdução</h2>
      <p>O mercado de defensivos agrícolas está em constante evolução, impulsionado por fatores como mudanças climáticas, demanda crescente por alimentos e avanços tecnológicos. Para 2024, algumas tendências se destacam e prometem moldar o setor.</p>
      
      <h2>Principais Tendências</h2>
      <h3>1. Crescimento dos Biológicos</h3>
      <p>Os defensivos biológicos continuam ganhando espaço no mercado, com crescimento projetado de 15% ao ano. Estes produtos oferecem soluções mais sustentáveis e com menor impacto ambiental.</p>
      
      <h3>2. Digitalização da Agricultura</h3>
      <p>A integração de tecnologias digitais na aplicação de defensivos, como drones e sistemas de precisão, está revolucionando a forma como os produtos são aplicados no campo.</p>
      
      <h3>3. Regulamentações Mais Rigorosas</h3>
      <p>As agências reguladoras estão implementando critérios mais rigorosos para aprovação de novos produtos, priorizando a segurança ambiental e humana.</p>
      
      <h2>Impactos no Mercado</h2>
      <p>Essas tendências têm impactos diretos nos preços, disponibilidade e estratégias de marketing dos produtos. Empresas que se adaptarem rapidamente terão vantagem competitiva.</p>
      
      <h2>Conclusão</h2>
      <p>O ano de 2024 promete ser de grandes transformações no mercado de defensivos agrícolas. Acompanhar essas tendências é fundamental para o sucesso dos produtores.</p>
    `,
    excerpt: 'Descubra as principais tendências que irão moldar o mercado de defensivos agrícolas em 2024 e como se preparar para essas mudanças.',
    featuredImage: '/lovable-uploads/cc866595-a7de-4eca-b055-09f1bb8beb61.png',
    author: 'Dr. João Silva',
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    category: 'Defensivos Agrícolas',
    tags: ['Herbicidas', 'Fungicidas', 'Mercado', 'Tendências'],
    slug: 'tendencias-mercado-defensivos-2024'
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
