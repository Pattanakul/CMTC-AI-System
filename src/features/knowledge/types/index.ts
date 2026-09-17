import { z } from "zod";
import { KnowledgeArticleSchema, CreateArticleSchema, UpdateArticleSchema } from "../schemas";

export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;

export type KnowledgeArticleListItem = {
  id: string;
  title: string;
  is_publish: boolean | null;
  updated_at: string | null;
  knowledge_categories: {
    name: string | null;
  } | null;
};
