-- Migration: Create documents table for Document Management Module
-- Milestone 5: Document Management Module

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Document status enum
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('ACTIVE', 'ARCHIVED', 'DISABLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document category enum
DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'Admissions',
    'Tuition Fees',
    'Departments',
    'Regulations',
    'Curriculum',
    'News',
    'General Documents'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name     TEXT NOT NULL,
  display_title TEXT NOT NULL,
  description   TEXT,
  department_id UUID,
  category      TEXT NOT NULL,
  keywords      TEXT[],
  tags          TEXT[],
  file_type     TEXT NOT NULL,
  file_size     BIGINT NOT NULL,
  storage_path  TEXT NOT NULL,
  uploaded_by   UUID NOT NULL,
  language      TEXT NOT NULL DEFAULT 'th',
  status        TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_display_title ON documents USING gin(to_tsvector('simple', display_title));

-- RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view ACTIVE documents
CREATE POLICY "Authenticated users can view active documents"
  ON documents FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'ACTIVE');

-- Policy: Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
  ON documents FOR ALL
  USING (auth.role() = 'authenticated');
