ALTER TABLE documents ADD COLUMN IF NOT EXISTS department_id UUID;
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON documents(department_id);
