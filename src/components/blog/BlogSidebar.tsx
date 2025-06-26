
import { Search, Calendar, Tag, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BlogSidebar = () => {
  const categories = [
    { name: 'Defensivos Agrícolas', count: 15 },
    { name: 'Fertilizantes', count: 12 },
    { name: 'Sementes', count: 8 },
    { name: 'Tecnologia Agrícola', count: 10 },
    { name: 'Sustentabilidade', count: 6 },
    { name: 'Mercado', count: 9 }
  ];

  const tags = [
    'Herbicidas', 'Fungicidas', 'Inseticidas', 'NPK', 'Orgânicos',
    'Milho', 'Soja', 'Algodão', 'Café', 'Cana-de-açúcar',
    'Precision Farming', 'Drones', 'IoT', 'Agricultura 4.0'
  ];

  const recentPosts = [
    {
      title: 'Tendências do Mercado de Defensivos para 2024',
      date: '2024-01-15',
      slug: 'tendencias-mercado-defensivos-2024'
    },
    {
      title: 'Como Escolher o Fertilizante Ideal para Sua Cultura',
      date: '2024-01-12',
      slug: 'como-escolher-fertilizante-ideal'
    },
    {
      title: 'Agricultura Sustentável: Práticas e Benefícios',
      date: '2024-01-10',
      slug: 'agricultura-sustentavel-praticas-beneficios'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Buscar posts..." className="flex-1" />
            <Button size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between py-1">
                <span className="text-sm hover:text-primary cursor-pointer transition-colors">
                  {category.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Posts Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.slug} className="pb-3 border-b border-gray-100 last:border-b-0">
                <h4 className="text-sm font-medium hover:text-primary cursor-pointer transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader>
          <CardTitle className="text-center">Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Receba as últimas novidades do agronegócio diretamente no seu email
          </p>
          <div className="space-y-2">
            <Input placeholder="Seu email" type="email" />
            <Button className="w-full">
              Inscrever-se
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogSidebar;
