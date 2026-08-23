-- Migration: AI Semantic Search
-- Milestone 4: Enable pgvector and add embeddings

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to knowledge_articles
ALTER TABLE public.knowledge_articles ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create a function to match articles
CREATE OR REPLACE FUNCTION match_articles(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  slug text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    summary,
    slug,
    1 - (knowledge_articles.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_articles
  WHERE 1 - (knowledge_articles.embedding <=> query_embedding) > match_threshold
    AND status = 'PUBLISHED'
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
