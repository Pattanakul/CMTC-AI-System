import { createClient } from '@/utils/supabase/client';

export const categoryService = {
  async getCategories(departmentId?: string) {
    const supabase = createClient();
    let query = supabase.from('knowledge_categories').select('*').order('name');
    
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createCategory(name: string, slug: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_categories').insert([{ name, slug }]).select().single();
    if (error) throw error;
    return data;
  }
  };
