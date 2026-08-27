export type DocumentStatus = "ACTIVE" | "ARCHIVED" | "DISABLED";
export type DocumentProcessingStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type DocumentCategory =
  | "Admissions"
  | "Tuition Fees"
  | "Departments"
  | "Regulations"
  | "Curriculum"
  | "News"
  | "General Documents";

export interface DocumentRecord {
  id: string;
  fileName: string;
  displayTitle: string;
  description?: string;
  departmentId?: string;
  category: DocumentCategory;
  keywords?: string[];
  tags?: string[];
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  language: string;
  status: DocumentStatus;
  markdownContent?: string | null;
  processingStatus?: DocumentProcessingStatus;
  processingError?: string | null;
  processedAt?: Date;
  version?: number;
  contentHash?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentRow {
  id: string;
  file_name: string;
  display_title: string;
  description?: string;
  department_id?: string;
  category: DocumentCategory;
  keywords?: string[];
  tags?: string[];
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  language: string;
  status: DocumentStatus;
  markdown_content?: string | null;
  processing_status?: DocumentProcessingStatus;
  processing_error?: string | null;
  processed_at?: string | null;
  version?: number;
  content_hash?: string | null;
  ai_ready?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocument {
  fileName: string;
  displayTitle: string;
  description?: string;
  departmentId?: string;
  category: DocumentCategory;
  keywords?: string[];
  tags?: string[];
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  language: string;
  status: DocumentStatus;
  processingStatus?: DocumentProcessingStatus;
  version?: number;
  contentHash?: string;
}

export interface UpdateDocument {
  displayTitle?: string;
  description?: string;
  departmentId?: string;
  category?: DocumentCategory;
  keywords?: string[];
  tags?: string[];
  language?: string;
  status?: DocumentStatus;
  markdownContent?: string | null;
  processingStatus?: DocumentProcessingStatus;
  processingError?: string | null;
  processedAt?: string | null;
  version?: number;
  contentHash?: string | null;
}

export interface DocumentFilters {
  search?: string;
  category?: DocumentCategory;
  departmentId?: string;
  fileType?: string;
  status?: DocumentStatus;
  processingStatus?: DocumentProcessingStatus;
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".csv", ".txt", ".png", ".jpg", ".jpeg"] as const;

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Admissions",
  "Tuition Fees",
  "Departments",
  "Regulations",
  "Curriculum",
  "News",
  "General Documents",
];

export const DOCUMENT_CATEGORY_MAP: Record<DocumentCategory, string> = {
  "Admissions": "การรับสมัคร",
  "Tuition Fees": "ค่าธรรมเนียมการศึกษา",
  "Departments": "แผนกวิชา",
  "Regulations": "ระเบียบข้อบังคับ",
  "Curriculum": "หลักสูตร",
  "News": "ข่าวสาร",
  "General Documents": "เอกสารทั่วไป",
};

export const STORAGE_FOLDER_MAP: Record<DocumentCategory, string> = {
  "Admissions": "admissions",
  "Tuition Fees": "admissions",
  "Departments": "departments",
  "Regulations": "departments",
  "Curriculum": "departments",
  "News": "news",
  "General Documents": "general",
};
