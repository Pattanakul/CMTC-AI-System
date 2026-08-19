-- Update the RLS policy to use the existing 'role' column instead of non-existent tables
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('Super Admin', 'Department Admin', 'Admin')
    )
  );
