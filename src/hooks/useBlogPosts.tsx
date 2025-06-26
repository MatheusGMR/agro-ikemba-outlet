
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

// Mock data for demonstration
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Tendências do Mercado de Defensivos Agrícolas para 2024',
    content: '<p>O mercado de defensivos agrícolas está em constante evolução...</p>',
    excerpt: 'Descubra as principais tendências que irão moldar o mercado de defensivos agrícolas em 2024 e como se preparar para essas mudanças.',
    featuredImage: '/lovable-uploads/cc866595-a7de-4eca-b055-09f1bb8beb61.png',
    author: 'Dr. João Silva',
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    category: 'Defensivos Agrícolas',
    tags: ['Herbicidas', 'Fungicidas', 'Mercado', 'Tendências'],
    slug: 'tendencias-mercado-defensivos-2024'
  },
  {
    id: '2',
    title: 'Como Escolher o Fertilizante Ideal para Sua Cultura',
    content: '<p>A escolha do fertilizante adequado é fundamental para o sucesso da cultura...</p>',
    excerpt: 'Guia completo para auxiliar na escolha do fertilizante mais adequado para diferentes tipos de culturas agrícolas.',
    author: 'Eng. Maria Santos',
    publishedAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    category: 'Fertilizantes',
    tags: ['NPK', 'Nutrição', 'Solo', 'Produtividade'],
    slug: 'como-escolher-fertilizante-ideal'
  },
  {
    id: '3',
    title: 'Agricultura Sustentável: Práticas e Benefícios',
    content: '<p>A sustentabilidade na agricultura é mais que uma tendência...</p>',
    excerpt: 'Explore as principais práticas de agricultura sustentável e os benefícios ambientais e econômicos que elas proporcionam.',
    author: 'Dr. Carlos Oliveira',
    publishedAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    category: 'Sustentabilidade',
    tags: ['Sustentabilidade', 'Meio Ambiente', 'Orgânicos', 'Certificação'],
    slug: 'agricultura-sustentavel-praticas-beneficios'
  },
  {
    id: '4',
    title: 'Inovações Tecnológicas no Agronegócio',
    content: '<p>A tecnologia está revolucionando o setor agrícola...</p>',
    excerpt: 'Conheça as principais inovações tecnológicas que estão transformando o agronegócio e aumentando a produtividade.',
    author: 'Eng. Ana Costa',
    publishedAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    category: 'Tecnologia Agrícola',
    tags: ['Drones', 'IoT', 'Precision Farming', 'Agricultura 4.0'],
    slug: 'inovacoes-tecnologicas-agronegocio'
  }
];

export const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockPosts;
    }
  });
};
