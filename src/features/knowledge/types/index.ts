import { z } from "zod";
import { KnowledgeArticleSchema, CreateArticleSchema, UpdateArticleSchema } from "../schemas";

export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
