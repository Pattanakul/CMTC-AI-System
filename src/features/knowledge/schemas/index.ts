import { z } from "zod";

export const KnowledgeArticleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  question: z.string().optional(),
  answer: z.string().min(1, "Answer is required"),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid(),
  source: z.string().optional(),
  isPublish: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional().nullable(),
});

export const CreateArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  question: z.string().optional(),
  answer: z.string().min(1, "Answer is required"),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid(),
  source: z.string().optional(),
  isPublish: z.boolean(),
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
