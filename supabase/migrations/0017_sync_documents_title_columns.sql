-- Keep legacy/alternate title columns compatible with the current document UI.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS display_title TEXT;

UPDATE public.documents
SET
  title = COALESCE(NULLIF(title, ''), NULLIF(display_title, ''), NULLIF(file_name, ''), 'Untitled document'),
  display_title = COALESCE(NULLIF(display_title, ''), NULLIF(title, ''), NULLIF(file_name, ''), 'Untitled document')
WHERE title IS NULL
   OR title = ''
   OR display_title IS NULL
   OR display_title = '';

ALTER TABLE public.documents
  ALTER COLUMN title SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_document_title_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.title = COALESCE(
    NULLIF(NEW.title, ''),
    NULLIF(NEW.display_title, ''),
    NULLIF(NEW.file_name, ''),
    'Untitled document'
  );
  NEW.display_title = COALESCE(
    NULLIF(NEW.display_title, ''),
    NULLIF(NEW.title, ''),
    NULLIF(NEW.file_name, ''),
    'Untitled document'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_document_title_columns ON public.documents;
CREATE TRIGGER sync_document_title_columns
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_document_title_columns();

NOTIFY pgrst, 'reload schema';
