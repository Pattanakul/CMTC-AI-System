import { z } from "zod";

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
