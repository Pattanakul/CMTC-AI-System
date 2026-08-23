-- Create Categories Table (if not from 0005)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Create Tags Table (if not from 0005)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Create Knowledge Articles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES public.categories(id),
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to knowledge_articles if they were created by an earlier migration
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS published_date TIMESTAMPTZ;

-- Add CHECK constraint for status (ignore if already exists)
DO $$
BEGIN
  ALTER TABLE public.knowledge_articles ADD CONSTRAINT knowledge_articles_status_check
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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
-- Use DO block to avoid errors if policies already exist
DO $$ BEGIN
  CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Staff can manage categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Staff can manage tags" ON public.tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Policies for Articles (Public read if published, Staff full access)
DO $$ BEGIN
  CREATE POLICY "Public can view published articles" ON public.knowledge_articles FOR SELECT USING (status = 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Staff can manage articles" ON public.knowledge_articles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view article tags" ON public.article_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.knowledge_articles WHERE id = article_tags.article_id AND status = 'PUBLISHED')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Staff can manage article tags" ON public.article_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Super Admin', 'Admin', 'Department Admin', 'Staff'))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
