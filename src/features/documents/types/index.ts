export type DocumentStatus = "ACTIVE" | "ARCHIVED" | "DISABLED";

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
}

export interface DocumentFilters {
  search?: string;
  category?: DocumentCategory;
  departmentId?: string;
  fileType?: string;
  status?: DocumentStatus;
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

export const STORAGE_FOLDER_MAP: Record<DocumentCategory, string> = {
  "Admissions": "admissions",
  "Tuition Fees": "admissions",
  "Departments": "departments",
  "Regulations": "departments",
  "Curriculum": "departments",
  "News": "news",
  "General Documents": "general",
};
