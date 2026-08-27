-- Add Document -> Markdown processing metadata to existing documents table.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS markdown_content TEXT,
  ADD COLUMN IF NOT EXISTS processing_status TEXT NOT NULL DEFAULT 'UPLOADED',
  ADD COLUMN IF NOT EXISTS processing_error TEXT,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS ai_ready BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  ALTER TABLE documents
    ADD CONSTRAINT documents_processing_status_check
    CHECK (processing_status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE documents
    ADD CONSTRAINT documents_version_check
    CHECK (version > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_processing_status
  ON documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_documents_content_hash
  ON documents(content_hash);
