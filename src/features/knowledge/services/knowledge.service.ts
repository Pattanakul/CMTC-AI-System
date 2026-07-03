import { createClient } from '@/utils/supabase/server';
import { CreateArticle, UpdateArticle } from '../types';

export const knowledgeService = {
  async getArticles(filters?: { search?: string; category?: string; departmentId?: string; status?: string }) {
    const supabase = createClient();
    let query = supabase.from('knowledge_articles').select('*').order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getArticleById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_articles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createArticle(articleData: CreateArticle) {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_articles').insert([{
      title: articleData.title,
      category: articleData.category,
      department_id: articleData.departmentId,
      content: articleData.content,
      keywords: articleData.keywords,
      tags: articleData.tags,
      status: articleData.status,
      author_id: articleData.authorId,
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateArticle(id: string, articleData: UpdateArticle) {
    const supabase = createClient();
    const updatePayload: any = {};
    if (articleData.title) updatePayload.title = articleData.title;
    if (articleData.category) updatePayload.category = articleData.category;
    if (articleData.departmentId) updatePayload.department_id = articleData.departmentId;
    if (articleData.content) updatePayload.content = articleData.content;
    if (articleData.keywords) updatePayload.keywords = articleData.keywords;
    if (articleData.tags) updatePayload.tags = articleData.tags;
    if (articleData.status) updatePayload.status = articleData.status;

    const { data, error } = await supabase.from('knowledge_articles').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async publishArticle(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_articles').update({ status: 'PUBLISHED' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async archiveArticle(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('knowledge_articles').update({ status: 'ARCHIVED' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
