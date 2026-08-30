import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  DocumentRow,
  STORAGE_FOLDER_MAP,
  DocumentCategory,
} from "../types";

interface DeletePermissionProfile {
  role: string | null;
  department_id: string | null;
  status: string | null;
}

export const documentService = {
  async getDocuments(filters?: DocumentFilters): Promise<DocumentRow[]> {
    const supabase = await createClient();
    let query = supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.or(
        `display_title.ilike.%${filters.search}%,file_name.ilike.%${filters.search}%`
      );
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.departmentId) {
      query = query.eq("department_id", filters.departmentId);
    }
    if (filters?.fileType) {
      query = query.eq("file_type", filters.fileType);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.processingStatus) {
      query = query.eq("processing_status", filters.processingStatus);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as DocumentRow[];
  },

  async getDocumentById(id: string): Promise<DocumentRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async uploadDocumentFile(
    file: File,
    category: DocumentCategory
  ): Promise<string> {
    const supabase = await createClient();
    const folder = STORAGE_FOLDER_MAP[category];
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${folder}/${timestamp}-${safeName}`;

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { upsert: false });

    if (error) throw error;
    return data.path;
  },

  async createDocument(documentData: CreateDocument): Promise<DocumentRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          title: documentData.displayTitle,
          file_name: documentData.fileName,
          display_title: documentData.displayTitle,
          description: documentData.description,
          department_id: documentData.departmentId || null,
          category: documentData.category,
          keywords: documentData.keywords ?? [],
          tags: documentData.tags ?? [],
          file_type: documentData.fileType,
          file_size: documentData.fileSize,
          storage_path: documentData.storagePath,
          uploaded_by: documentData.uploadedBy,
          language: documentData.language,
          status: documentData.status,
          processing_status: documentData.processingStatus ?? "UPLOADED",
          version: documentData.version ?? 1,
          content_hash: documentData.contentHash ?? null,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async updateDocument(
    id: string,
    documentData: UpdateDocument
  ): Promise<DocumentRow> {
    const supabase = await createClient();
    const updatePayload: Partial<{
      title: string;
      display_title: string;
      description: string;
      category: string;
      department_id: string | null;
      keywords: string[];
      tags: string[];
      language: string;
      status: string;
      markdown_content: string | null;
      processing_status: string;
      processing_error: string | null;
      processed_at: string | null;
      version: number;
      content_hash: string | null;
    }> = {};

    if (documentData.displayTitle !== undefined) {
      updatePayload.title = documentData.displayTitle;
      updatePayload.display_title = documentData.displayTitle;
    }
    if (documentData.description !== undefined)
      updatePayload.description = documentData.description;
    if (documentData.category !== undefined)
      updatePayload.category = documentData.category;
    if (documentData.departmentId !== undefined)
      updatePayload.department_id = documentData.departmentId || null;
    if (documentData.keywords !== undefined)
      updatePayload.keywords = documentData.keywords;
    if (documentData.tags !== undefined)
      updatePayload.tags = documentData.tags;
    if (documentData.language !== undefined)
      updatePayload.language = documentData.language;
    if (documentData.status !== undefined)
      updatePayload.status = documentData.status;
    if (documentData.markdownContent !== undefined)
      updatePayload.markdown_content = documentData.markdownContent;
    if (documentData.processingStatus !== undefined)
      updatePayload.processing_status = documentData.processingStatus;
    if (documentData.processingError !== undefined)
      updatePayload.processing_error = documentData.processingError;
    if (documentData.processedAt !== undefined)
      updatePayload.processed_at = documentData.processedAt;
    if (documentData.version !== undefined)
      updatePayload.version = documentData.version;
    if (documentData.contentHash !== undefined)
      updatePayload.content_hash = documentData.contentHash;

    const { data, error } = await supabase
      .from("documents")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async archiveDocument(id: string): Promise<DocumentRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .update({ status: "ARCHIVED" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async disableDocument(id: string): Promise<DocumentRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .update({ status: "DISABLED" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async deleteDocument(id: string, userId: string): Promise<DocumentRow> {
    const adminSupabase = createAdminClient();
    const { data: document, error: documentError } = await adminSupabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (documentError) throw documentError;

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role, department_id, status")
      .eq("id", userId)
      .single<DeletePermissionProfile>();
    if (profileError) throw profileError;

    const canDelete =
      profile.status === "ACTIVE" &&
      (profile.role === "Super Admin" ||
        profile.role === "Admin" ||
        (profile.role === "Department Admin" &&
          document.department_id === profile.department_id) ||
        (profile.role === "Staff" &&
          document.department_id === profile.department_id &&
          document.uploaded_by === userId));

    if (!canDelete) {
      throw new Error("ไม่มีสิทธิ์ลบเอกสารนี้");
    }

    const { error: storageError } = await adminSupabase.storage
      .from("documents")
      .remove([document.storage_path]);
    if (storageError) {
      throw storageError;
    }

    const { data: deletedDocument, error: deleteError } = await adminSupabase
      .from("documents")
      .delete()
      .eq("id", id)
      .select("*")
      .single();
    if (deleteError) throw deleteError;

    return deletedDocument as DocumentRow;
  },

  async enableDocument(id: string): Promise<DocumentRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .update({ status: "ACTIVE" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentRow;
  },

  async downloadDocument(storagePath: string): Promise<Blob> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .download(storagePath);
    if (error) throw error;
    return data;
  },

  async downloadDocumentFile(storagePath: string): Promise<File> {
    const blob = await this.downloadDocument(storagePath);
    return new File([blob], storagePath.split("/").pop() ?? "document");
  },

  async getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};
