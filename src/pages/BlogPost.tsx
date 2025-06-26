
import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { useBlogPost } from '@/hooks/useBlogPost';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading } = useBlogPost(slug);

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
        <meta name="description" content={post.excerpt} />
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
            "description": post.excerpt,
            "image": post.featuredImage,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Agro Ikemba",
              "url": "https://agroikemba.com.br"
            },
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://agroikemba.com.br/blog/${post.slug}`
            }
          })}
        </script>
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          <Navbar />
          <main className="flex-1">
            <div className="container-custom py-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <BlogPostContent post={post} />
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

export default BlogPost;
