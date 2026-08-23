-- Create Knowledge Articles Table
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES public.categories(id),
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Article Tags Bridge Table
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Add updated_at trigger for knowledge_articles
CREATE OR REPLACE FUNCTION update_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_knowledge_articles_updated_at ON public.knowledge_articles;
CREATE TRIGGER update_knowledge_articles_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION update_article_updated_at();

-- Enable RLS
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policies for Categories & Tags (Public read, Admin/Staff write)
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);

CREATE POLICY "Staff can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
);
CREATE POLICY "Staff can manage tags" ON public.tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
);

-- Policies for Articles (Public read if published, Staff full access)
CREATE POLICY "Public can view published articles" ON public.knowledge_articles FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Staff can manage articles" ON public.knowledge_articles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
);

CREATE POLICY "Public can view article tags" ON public.article_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.knowledge_articles WHERE id = article_tags.article_id AND status = 'PUBLISHED')
);
CREATE POLICY "Staff can manage article tags" ON public.article_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
);
