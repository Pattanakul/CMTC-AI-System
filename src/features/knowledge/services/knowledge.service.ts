import { createClient } from '@/utils/supabase/client';
import { CreateArticle, UpdateArticle } from '../schemas';
import { SupabaseClient } from '@supabase/supabase-js';

export const knowledgeService = {
  async getArticles(filters?: { search?: string; categoryId?: string; departmentId?: string; isPublish?: boolean }, supabaseClient?: SupabaseClient) {
    const supabase = supabaseClient || createClient();
    let query = supabase
      .from('knowledge_articles')
      .select('*, knowledge_categories(name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.isPublish !== undefined) {
      query = query.eq('is_publish', filters.isPublish);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase error in getArticles:", error);
      return []; // คืนค่าอาเรย์ว่างแทนการ throw error
    }
    return data || [];
  },

  async getArticleById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*, knowledge_categories(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createArticle(articleData: CreateArticle) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('knowledge_articles')
      .insert([{
        title: articleData.title,
        question: articleData.question,
        answer: articleData.answer,
        category_id: articleData.categoryId,
        department_id: articleData.departmentId,
        source: articleData.source,
        is_publish: articleData.isPublish,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateArticle(id: string, articleData: UpdateArticle) {
    const supabase = createClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (articleData.title) updatePayload.title = articleData.title;
    if (articleData.question) updatePayload.question = articleData.question;
    if (articleData.answer) updatePayload.answer = articleData.answer;
    if (articleData.categoryId) updatePayload.category_id = articleData.categoryId;
    if (articleData.departmentId) updatePayload.department_id = articleData.departmentId;
    if (articleData.source) updatePayload.source = articleData.source;
    if (articleData.isPublish !== undefined) updatePayload.is_publish = articleData.isPublish;

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async softDeleteArticle(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setPublishStatus(id: string, isPublish: boolean) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({ is_publish: isPublish, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
