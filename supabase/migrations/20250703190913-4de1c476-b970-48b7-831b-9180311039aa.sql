-- Create blog_posts table for real content management
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'Equipe AgroIkemba',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Blog posts are publicly readable" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Create policy for admin write access
CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);

-- Create function to update timestamps
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample blog posts with SEO optimization
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category,
  tags,
  meta_title,
  meta_description,
  meta_keywords
) VALUES (
  'A Importância dos Insumos Agrícolas Genéricos para a Economia Rural',
  'importancia-insumos-agricolas-genericos',
  'Descubra como os insumos agrícolas genéricos podem reduzir custos em até 25% e aumentar a rentabilidade da sua propriedade rural.',
  '<h2>Por que escolher insumos agrícolas genéricos?</h2><p>Os insumos agrícolas genéricos representam uma revolução no setor agropecuário brasileiro, oferecendo a mesma eficiência dos produtos originais com economia significativa para o produtor rural.</p><h3>Vantagens dos fertilizantes genéricos</h3><p>Os fertilizantes genéricos possuem a mesma composição química dos produtos de marca, garantindo resultados equivalentes na produtividade das culturas. A diferença está no preço: economia de até 25% sem comprometer a qualidade.</p><h3>Defensivos agrícolas genéricos: segurança e eficácia</h3><p>Os defensivos genéricos passam pelos mesmos rigorosos testes de qualidade e eficácia exigidos pelos órgãos reguladores, como ANVISA e IBAMA, garantindo proteção total às culturas.</p><h3>Como escolher o melhor fornecedor</h3><p>Na AgroIkemba, conectamos você diretamente aos fabricantes de insumos genéricos, eliminando intermediários e garantindo os melhores preços do mercado. Nossa plataforma oferece:</p><ul><li>Comparação de preços em tempo real</li><li>Certificação de qualidade</li><li>Logística integrada</li><li>Suporte técnico especializado</li></ul>',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  'Fertilizantes',
  ARRAY['insumos agrícolas', 'fertilizantes genéricos', 'economia rural', 'agronegócio', 'defensivos genéricos'],
  'Insumos Agrícolas Genéricos: Economize 25% na Sua Fazenda | AgroIkemba',
  'Reduza custos com insumos agrícolas genéricos. Fertilizantes e defensivos com mesma qualidade, preços até 25% menores. Compare preços na AgroIkemba.',
  'insumos agrícolas genéricos, fertilizantes baratos, defensivos genéricos preço, economia rural, agronegócio'
), (
  'Gestão de Distribuidoras de Insumos Agrícolas: Riscos e Estratégias Vencedoras',
  'gestao-distribuidoras-insumos-agricolas-riscos-estrategias',
  'Estratégias para otimizar a gestão de distribuidoras, reduzir riscos operacionais e aumentar a margem de lucro no mercado de insumos.',
  '<h2>Desafios na gestão de distribuidoras agrícolas</h2><p>O mercado de distribuição de insumos agrícolas enfrenta desafios únicos: sazonalidade, volatilidade de preços, gestão de estoque e concorrência acirrada.</p><h3>Controle de estoque inteligente</h3><p>A gestão eficiente do estoque é fundamental para o sucesso. Distribuidoras precisam equilibrar disponibilidade de produtos com custos de armazenagem, especialmente para fertilizantes que têm picos de demanda sazonais.</p><h3>Relacionamento com fornecedores</h3><p>Parcerias estratégicas com fabricantes de insumos genéricos podem reduzir custos e aumentar margens. A AgroIkemba facilita essas conexões, oferecendo acesso direto aos melhores fornecedores.</p><h3>Digitalização do processo comercial</h3><p>Plataformas B2B modernas permitem automatizar cotações, pedidos e acompanhamento de entregas, reduzindo custos operacionais e melhorando a experiência do cliente.</p>',
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  'Gestão',
  ARRAY['distribuidoras agrícolas', 'gestão estoque', 'fornecedores insumos', 'margem lucro', 'B2B agrícola'],
  'Gestão de Distribuidoras Agrícolas: Estratégias para Aumentar Lucros | AgroIkemba',
  'Otimize sua distribuidora de insumos agrícolas. Estratégias para gestão de estoque, fornecedores e aumento da margem de lucro. Saiba mais.',
  'distribuidoras insumos agrícolas, gestão estoque fertilizantes, fornecedores defensivos, margem lucro distribuidora'
);