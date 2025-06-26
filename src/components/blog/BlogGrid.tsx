
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const BlogGrid = () => {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Últimos Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts?.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {post.featuredImage ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <span className="text-green-600 text-lg font-medium">Agro Ikemba</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
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
              
              <h3 className="text-xl font-bold mb-3 line-clamp-2">
                <Link 
                  to={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {post.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/blog/${post.slug}`}>
                    Ler mais
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogGrid;
