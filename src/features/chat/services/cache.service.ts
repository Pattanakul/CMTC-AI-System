import { createAdminClient } from '@/utils/supabase/admin';

export const cacheService = {
  async searchCache(question: string) {
    const supabase = createAdminClient();
    const normalized = question.toLowerCase().trim();

    const { data, error } = await supabase
      .from('ai_cache')
      .select('*')
      .eq('normalized_question', normalized)
      .order('last_used', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  },

  async saveCache(question: string, answer: string, confidence: number) {
    const supabase = createAdminClient();
    const normalized = question.toLowerCase().trim();

    const existing = await this.searchCache(question);

    if (existing) {
      await supabase
        .from('ai_cache')
        .update({
          usage_count: existing.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('ai_cache')
        .insert([{
          question,
          normalized_question: normalized,
          answer,
          confidence_score: confidence,
        }]);
    }
  },
};
