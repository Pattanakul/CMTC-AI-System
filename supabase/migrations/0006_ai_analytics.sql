-- Migration: Create AI Analytics and Logs
-- Milestone 5: AI Integration Platform

-- 1. AI Analytics Table
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  model_used TEXT,
  response_time_ms INT,
  source_type TEXT CHECK (source_type IN ('KNOWLEDGE', 'DOCUMENT', 'AI')),
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Feedback Table
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_id UUID REFERENCES public.ai_analytics(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
