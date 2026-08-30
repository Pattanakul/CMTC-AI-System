-- Allow authenticated staff/admin users to create and process documents while
-- preserving department boundaries through the existing profiles table.

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Active staff can insert own department documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (
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
  CREATE POLICY "Active staff can update own department documents"
    ON public.documents FOR UPDATE
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
    )
    WITH CHECK (
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
