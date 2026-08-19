import { createClient } from '@/utils/supabase/client';

export const categoryService = {
  async getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_categories').select('*').order('name');
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
