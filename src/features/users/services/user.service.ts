import { CreateUser, UpdateUser } from '../schemas';

export const userService = {
  async getUsers(supabaseClient: any) {
    const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserById(id: string, supabaseClient: any) {
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createUser(userData: CreateUser, supabaseClient: any) {
    // Note: Assuming 'profiles' table has these columns. Adjust if schema differs.
    const { data, error } = await supabaseClient.from('profiles').insert([{
      role: userData.role,
      status: userData.status
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: UpdateUser, supabaseClient: any) {
    const updatePayload: any = {};
    if (userData.role) updatePayload.role = userData.role;
    if (userData.status) updatePayload.status = userData.status;
    
    const { data, error } = await supabaseClient.from('profiles').update(updatePayload).eq('id', id);
    if (error) throw error;
    return data;
  },

  async deleteUser(id: string, supabaseClient: any) {
    const { data, error } = await supabaseClient.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return data;
  },

  async disableUser(id: string, supabaseClient: any) {
    const { data, error } = await supabaseClient.from('profiles').update({ status: 'INACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async enableUser(id: string, supabaseClient: any) {
    const { data, error } = await supabaseClient.from('profiles').update({ status: 'ACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
