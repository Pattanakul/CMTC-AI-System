-- ─── Documents Table Migration ────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  display_title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Admissions', 'Tuition Fees', 'Departments',
    'Regulations', 'Curriculum', 'News', 'General Documents'
  )),
  keywords TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'th',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DISABLED')),
  -- AI Preparation metadata (no embeddings yet)
  ai_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read ACTIVE documents
CREATE POLICY "Authenticated users can read active documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (status = 'ACTIVE');

-- Policy: Super Admin and Admin can read all documents
CREATE POLICY "Admins can read all documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Department Admin', 'Admin')
    )
  );

-- Policy: Super Admin and Admin can insert documents
CREATE POLICY "Admins can insert documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Department Admin', 'Admin')
    )
  );

-- Policy: Super Admin and Admin can update documents
CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Department Admin', 'Admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON public.documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
-- Full text search index
CREATE INDEX IF NOT EXISTS idx_documents_search ON public.documents
  USING GIN (to_tsvector('simple', display_title || ' ' || file_name || ' ' || COALESCE(description, '')));

-- ─── Supabase Storage Bucket ─────────────────────────────────────────────────
-- Run these separately in Supabase SQL Editor or via Storage dashboard

-- Create storage bucket (if not exists via Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  20971520, -- 20MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Admins can update document files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');
