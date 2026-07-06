import { createClient } from "@/utils/supabase/server";
import {
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  DocumentRow,
  STORAGE_FOLDER_MAP,
  DocumentCategory,
} from "../types";

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
      display_title: string;
      description: string;
      category: string;
      department_id: string | null;
      keywords: string[];
      tags: string[];
      language: string;
      status: string;
    }> = {};

    if (documentData.displayTitle !== undefined)
      updatePayload.display_title = documentData.displayTitle;
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

  async getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};
