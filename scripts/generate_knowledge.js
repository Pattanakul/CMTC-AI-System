const fs = require('fs');
const path = require('path');

const files = {
  "src/features/knowledge/schemas/index.ts": `import { z } from "zod";

export const ArticleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const ArticleCategorySchema = z.enum([
  "Admissions", 
  "Tuition Fees", 
  "Departments", 
  "Contact Information", 
  "News", 
  "General Information"
]);

export const KnowledgeArticleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  category: ArticleCategorySchema,
  departmentId: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: ArticleStatusSchema.default("DRAFT"),
  authorId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateArticleSchema = KnowledgeArticleSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateArticleSchema = CreateArticleSchema.partial();
`,
  "src/features/knowledge/types/index.ts": `import { z } from "zod";
import { KnowledgeArticleSchema, CreateArticleSchema, UpdateArticleSchema } from "../schemas";

export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
`,
  "src/features/knowledge/services/knowledge.service.ts": `import { createClient } from '@/utils/supabase/server';
import { CreateArticle, UpdateArticle } from '../types';

export const knowledgeService = {
  async getArticles(filters?: { search?: string; category?: string; departmentId?: string; status?: string }) {
    const supabase = createClient();
    let query = supabase.from('knowledge_articles').select('*').order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', \`%\${filters.search}%\`);
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
`,
  "src/app/(admin)/knowledge/page.tsx": `import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function KnowledgePage() {
  let articles = [];
  try {
    articles = await knowledgeService.getArticles();
  } catch (err) {
    console.error("Error fetching articles:", err);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <Link href="/knowledge/create">
          <Button>Create Article</Button>
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles?.map((article: any) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap">{article.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={\`/knowledge/\${article.id}/edit\`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <Link href={\`/knowledge/\${article.id}\`} className="text-blue-600 hover:text-blue-900">View</Link>
                </td>
              </tr>
            ))}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,
  "src/app/(admin)/knowledge/create/page.tsx": `"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateArticleSchema, CreateArticle } from "@/features/knowledge/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateArticlePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateArticle>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      status: "DRAFT"
    }
  });

  const onSubmit = async (data: CreateArticle) => {
    // We would normally call the service here (e.g. via a Server Action or API route)
    // For this milestone, we'll assume success for now or wire up a Server Action
    router.push("/knowledge");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Knowledge Article</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register("category")} className="w-full p-2 border rounded">
            <option value="Admissions">Admissions</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Departments">Departments</option>
            <option value="Contact Information">Contact Information</option>
            <option value="News">News</option>
            <option value="General Information">General Information</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" rows={10} {...register("content")} placeholder="Use rich text..." />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>

        {/* Note: In a real app, authorId is pulled from the current user session. */}
        <input type="hidden" {...register("authorId")} value="00000000-0000-0000-0000-000000000000" />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/knowledge")}>Cancel</Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('D:/CMTC/CMTC-AI-System', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
}
