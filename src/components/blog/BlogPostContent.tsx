
import { Calendar, User, Share2, BookmarkPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface BlogPostContentProps {
  post: BlogPost;
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  return (
    <article>
      {/* Back to blog */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
          <img
            src={post.featuredImage}
            alt={`Imagem ilustrativa do artigo: ${post.title} - ${post.excerpt.substring(0, 100)}...`}
            className="w-full h-full object-cover"
            loading="lazy"
            width="1920"
            height="1080"
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge>{post.category}</Badge>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>

        {/* Social Share */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm">
            <BookmarkPlus className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>

        <Separator />
      </header>

      {/* Post Content */}
      <div 
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-8">
          <Separator className="mb-4" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Tags:</span>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">{post.author}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              A equipe de comunicação da AgroIkemba é formada por especialistas em agronegócio, comprometidos em trazer informações atualizadas e relevantes para produtores rurais e profissionais do setor agrícola.
            </p>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Posts Relacionados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placeholder for related posts */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Como Otimizar o Uso de Fertilizantes</h4>
            <p className="text-sm text-gray-600">Dicas práticas para maximizar a eficiência dos fertilizantes...</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Tendências em Defensivos Biológicos</h4>
            <p className="text-sm text-gray-600">O crescimento dos produtos biológicos no mercado...</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostContent;
