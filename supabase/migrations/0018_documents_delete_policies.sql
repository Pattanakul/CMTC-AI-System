-- Allow active users to delete documents they are allowed to manage.

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Active staff can delete own department documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING (
      uploaded_by = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.status = 'ACTIVE'
          AND (
            p.role IN ('Super Admin', 'Admin')
            OR (
              p.role IN ('Department Admin', 'Staff')
              AND department_id = p.department_id
            )
          )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete own document files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'documents'
      AND owner = auth.uid()
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
