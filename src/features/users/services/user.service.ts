import { createClient } from '@/utils/supabase/client';
import { UserStatusSchema } from '../schemas';
import { z } from 'zod';

export const userService = {
  async getAllUsers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data;
  },

  async updateUserStatus(id: string, status: z.infer<typeof UserStatusSchema>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
