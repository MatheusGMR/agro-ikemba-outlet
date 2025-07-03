import { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { useBlogPost } from '@/hooks/useBlogPost';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!post) {
    return <div>Post não encontrado</div>;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Blog Agro Ikemba</title>
        <meta name="description" content={post.excerpt.length > 155 ? post.excerpt.substring(0, 152) + '...' : post.excerpt} />
        <meta name="keywords" content={post.tags?.join(', ')} />
        <meta name="author" content={post.author} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        <meta property="article:tag" content={post.tags?.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://agroikemba.com.br/blog/${post.slug}`} />
        <meta property="og:image" content={post.featuredImage} />
        <link rel="canonical" href={`https://agroikemba.com.br/blog/${post.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt.length > 155 ? post.excerpt.substring(0, 152) + '...' : post.excerpt,
            "image": {
              "@type": "ImageObject",
              "url": post.featuredImage,
              "caption": post.title,
              "width": 1920,
              "height": 1080
            },
            "author": {
              "@type": "Person",
              "name": post.author,
              "url": "https://agroikemba.com.br"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Agro Ikemba",
              "url": "https://agroikemba.com.br",
              "logo": {
                "@type": "ImageObject",
                "url": "https://agroikemba.com.br/favicon.ico",
                "width": 32,
                "height": 32
              }
            },
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://agroikemba.com.br/blog/${post.slug}`
            },
            "articleSection": post.category,
            "keywords": post.tags?.join(', '),
            "wordCount": post.content.replace(/<[^>]*>/g, '').split(' ').length,
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://agroikemba.com.br"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://agroikemba.com.br/blog"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.category,
                  "item": `https://agroikemba.com.br/blog?category=${encodeURIComponent(post.category)}`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": post.title,
                  "item": `https://agroikemba.com.br/blog/${post.slug}`
                }
              ]
            }
          })}
        </script>
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          <Navbar />
          <main className="flex-1">
            <div className="container-custom py-12">
              <div className="max-w-4xl mx-auto">
                <nav className="mb-6" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <Link to="/" className="hover:text-primary transition-colors">
                        Home
                      </Link>
                    </li>
                    <li className="flex items-center">
                      <span className="mx-2">/</span>
                      <Link to="/blog" className="hover:text-primary transition-colors">
                        Blog
                      </Link>
                    </li>
                    <li className="flex items-center">
                      <span className="mx-2">/</span>
                      <span className="text-gray-600">{post.category}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mx-2">/</span>
                      <span className="text-gray-900 font-medium truncate max-w-xs" title={post.title}>
                        {post.title}
                      </span>
                    </li>
                  </ol>
                </nav>
                <BlogPostContent post={post} />
              </div>
            </div>
          </main>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default BlogPost;
