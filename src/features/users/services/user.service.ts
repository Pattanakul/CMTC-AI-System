import { createClient } from '@/utils/supabase/server';
import { CreateUser, UpdateUser } from '../schemas';

export const userService = {
  async getUsers() {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createUser(userData: CreateUser) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').insert([{
      full_name: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      department: userData.department,
      role: userData.role,
      status: userData.status
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: UpdateUser) {
    const supabase = createClient();
    const updatePayload: any = {};
    if (userData.fullName) updatePayload.full_name = userData.fullName;
    if (userData.phone !== undefined) updatePayload.phone = userData.phone;
    if (userData.department) updatePayload.department = userData.department;
    if (userData.role) updatePayload.role = userData.role;
    if (userData.status) updatePayload.status = userData.status;
    
    const { data, error } = await supabase.from('users').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async disableUser(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').update({ status: 'INACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async enableUser(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').update({ status: 'ACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
