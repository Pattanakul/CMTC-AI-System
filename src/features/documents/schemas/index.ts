import { z } from "zod";
import { MAX_FILE_SIZE } from "../types";

export const DocumentStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "DISABLED"]);
export const DocumentProcessingStatusSchema = z.enum([
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
]);
export const DocumentCategorySchema = z.enum([
  "Admissions",
  "Tuition Fees",
  "Departments",
  "Regulations",
  "Curriculum",
  "News",
  "General Documents",
]);

export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  fileName: z.string().min(1, "File name is required"),
  displayTitle: z.string().min(1, "กรุณากรอกชื่อเอกสาร"),
  description: z.string().optional().or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
  category: DocumentCategorySchema,
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().max(MAX_FILE_SIZE, "ขนาดไฟล์ต้องไม่เกิน 20MB"),
  storagePath: z.string().min(1, "Storage path is required"),
  uploadedBy: z.string().uuid(),
  language: z.string().default("th"),
  status: DocumentStatusSchema.default("ACTIVE"),
  processingStatus: DocumentProcessingStatusSchema.default("UPLOADED"),
  version: z.number().int().positive().default(1),
  contentHash: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateDocumentSchema = DocumentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDocumentSchema = z.object({
  displayTitle: z.string().min(1, "กรุณากรอกชื่อเอกสาร").optional(),
  description: z.string().optional().or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
  category: DocumentCategorySchema.optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  status: DocumentStatusSchema.optional(),
});

export const UploadFormSchema = z.object({
  displayTitle: z.string().min(1, "กรุณากรอกชื่อเอกสาร"),
  category: DocumentCategorySchema,
  description: z.string().optional().or(z.literal("")),
  keywords: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  language: z.string(),
  departmentId: z.string().optional().or(z.literal("")),
});

export type UploadFormValues = z.infer<typeof UploadFormSchema>;
export type UpdateFormValues = z.infer<typeof UpdateDocumentSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;
