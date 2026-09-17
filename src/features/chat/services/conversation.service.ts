import { createAdminClient } from '@/utils/supabase/admin';
import { ChatMessage } from '../types';

export const conversationService = {
  async createConversation(userId: string, title?: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as ChatMessage[];
  },

  async saveMessage(message: ChatMessage) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: message.conversationId,
        role: message.role,
        content: message.content,
        sources: message.sources,
        confidence_score: message.confidenceScore,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
