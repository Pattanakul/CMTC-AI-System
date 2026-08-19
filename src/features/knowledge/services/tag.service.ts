import { createClient } from '@/utils/supabase/client';

export const tagService = {
  async getTags() {
    const supabase = createClient();
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async createTag(name: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('tags').insert([{ name }]).select().single();
    if (error) throw error;
    return data;
  }
};
