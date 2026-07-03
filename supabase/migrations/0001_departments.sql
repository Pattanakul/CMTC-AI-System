-- Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    office VARCHAR(255),
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow authenticated users to view/manage, wait user said "Only authenticated users may access this module" so we assume auth is handled in middleware but let's just create permissive policies for authenticated users)
CREATE POLICY "Allow authenticated users to read departments" 
    ON public.departments 
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert departments" 
    ON public.departments 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update departments" 
    ON public.departments 
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Create a trigger to automatically update `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_departments_updated_at ON public.departments;
CREATE TRIGGER handle_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
