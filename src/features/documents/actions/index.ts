"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { documentService } from "../services/document.service";
import { processUploadedDocument } from "../services/document-processing.service";
import { UploadFormSchema, UpdateDocumentSchema } from "../schemas";
import type { DocumentCategory, DocumentFilters } from "../types";

interface CurrentProfile {
  role: string | null;
  department_id: string | null;
  status: string | null;
}

function getActionErrorMessage(
  err: unknown,
  fallback: string
): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const errorLike = err as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
      error?: unknown;
    };
    const parts = [
      errorLike.message,
      errorLike.details,
      errorLike.hint,
      errorLike.code ? `code: ${String(errorLike.code)}` : undefined,
    ]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ");

    if (parts) return parts;
    if (typeof errorLike.error === "string") return errorLike.error;
  }

  return fallback;
}

// ─── Get Documents (Server Action) ──────────────────────────────────────────

export async function getDocumentsAction(filters?: DocumentFilters) {
  try {
    const documents = await documentService.getDocuments(filters);
    return { data: documents, error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการโหลดเอกสาร"
    );
    return { data: null, error: message };
  }
}

// ─── Get Document By ID (Server Action) ─────────────────────────────────────

export async function getDocumentAction(id: string) {
  try {
    const document = await documentService.getDocumentById(id);
    return { data: document, error: null };
  } catch (err) {
    const message = getActionErrorMessage(err, "ไม่พบเอกสาร");
    return { data: null, error: message };
  }
}

// ─── Upload Document (Server Action) ─────────────────────────────────────────

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดเอกสาร" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, department_id, status")
    .eq("id", user.id)
    .single<CurrentProfile>();

  if (profileError || profile?.status !== "ACTIVE") {
    return { data: null, error: "บัญชีนี้ยังไม่มีสิทธิ์อัปโหลดเอกสาร" };
  }

  const rawData = {
    displayTitle: formData.get("displayTitle"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    keywords: formData.get("keywords") || undefined,
    tags: formData.get("tags") || undefined,
    language: formData.get("language") || "th",
    departmentId: formData.get("departmentId") || undefined,
  };

  const parsed = UploadFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { data: null, error: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" };
  }

  try {
    const category = parsed.data.category as DocumentCategory;
    const isDepartmentScopedRole =
      profile.role === "Staff" || profile.role === "Department Admin";
    const requestedDepartmentId = rawData.departmentId as string | undefined;
    const effectiveDepartmentId = isDepartmentScopedRole
      ? profile.department_id
      : requestedDepartmentId;

    if (isDepartmentScopedRole && !effectiveDepartmentId) {
      return {
        data: null,
        error: "บัญชีนี้ยังไม่ได้ผูกกับแผนก จึงไม่สามารถอัปโหลดเอกสารได้",
      };
    }

    if (
      isDepartmentScopedRole &&
      requestedDepartmentId &&
      requestedDepartmentId !== effectiveDepartmentId
    ) {
      return {
        data: null,
        error: "ไม่สามารถอัปโหลดเอกสารไปยังแผนกอื่นได้",
      };
    }

    console.info("[Document] Upload started", {
      fileName: file.name,
      fileSize: file.size,
    });

    const storagePath = await documentService.uploadDocumentFile(file, category);

    // Parse keywords and tags from comma-separated strings
    const keywords = parsed.data.keywords
      ? parsed.data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    const tags = parsed.data.tags
      ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Get file extension as file type
    const fileType = file.name.split(".").pop()?.toLowerCase() ?? "unknown";

    const document = await documentService.createDocument({
      fileName: file.name,
      displayTitle: parsed.data.displayTitle,
      description: parsed.data.description,
      departmentId: effectiveDepartmentId ?? undefined,
      category,
      keywords,
      tags,
      fileType,
      fileSize: file.size,
      storagePath,
      uploadedBy: user.id,
      language: parsed.data.language,
      status: "ACTIVE",
      processingStatus: "UPLOADED",
      version: 1,
    });

    const processedDocument = await processUploadedDocument({
      supabase,
      document,
      file,
    });

    revalidatePath("/admin/documents");
    revalidatePath("/staff/documents");
    return { data: processedDocument, error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร"
    );
    return { data: null, error: message };
  }
}

// ─── Reprocess Document (Server Action) ──────────────────────────────────────

export async function reprocessDocumentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  try {
    const document = await documentService.getDocumentById(id);
    const originalFile = await documentService.downloadDocumentFile(
      document.storage_path
    );

    console.info("[Document] Reprocess requested", {
      documentId: id,
      fileName: document.file_name,
    });

    const processedDocument = await processUploadedDocument({
      supabase,
      document,
      file: originalFile,
      forceReprocess: true,
    });

    revalidatePath("/admin/documents");
    revalidatePath("/staff/documents");
    revalidatePath(`/admin/documents/${id}`);
    return { data: processedDocument, error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการประมวลผลเอกสารใหม่"
    );
    return { data: null, error: message };
  }
}

// ─── Update Document (Server Action) ─────────────────────────────────────────

export async function updateDocumentAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const rawData = {
    displayTitle: formData.get("displayTitle"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    keywords: formData.get("keywords") || undefined,
    tags: formData.get("tags") || undefined,
    language: formData.get("language") || undefined,
    status: formData.get("status") || undefined,
    departmentId: formData.get("departmentId") || undefined,
  };

  const parsed = UpdateDocumentSchema.safeParse({
    displayTitle: rawData.displayTitle,
    category: rawData.category,
    description: rawData.description,
    language: rawData.language,
    status: rawData.status,
    departmentId: rawData.departmentId,
    keywords: rawData.keywords
      ? (rawData.keywords as string).split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    tags: rawData.tags
      ? (rawData.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
  });

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  try {
    const document = await documentService.updateDocument(id, {
      displayTitle: parsed.data.displayTitle,
      description: parsed.data.description,
      category: parsed.data.category,
      departmentId: rawData.departmentId as string | undefined,
      keywords: parsed.data.keywords,
      tags: parsed.data.tags,
      language: parsed.data.language,
      status: parsed.data.status,
    });

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${id}`);
    return { data: document, error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการอัปเดตเอกสาร"
    );
    return { data: null, error: message };
  }
}

// ─── Archive Document (Server Action) ────────────────────────────────────────

export async function archiveDocumentAction(id: string) {
  try {
    await documentService.archiveDocument(id);
    revalidatePath("/admin/documents");
    return { error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการจัดเก็บเอกสาร"
    );
    return { error: message };
  }
}

// ─── Enable Document (Server Action) ─────────────────────────────────────────

export async function enableDocumentAction(id: string) {
  try {
    await documentService.enableDocument(id);
    revalidatePath("/admin/documents");
    return { error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการเปิดใช้งานเอกสาร"
    );
    return { error: message };
  }
}

// ─── Disable Document (Server Action) ────────────────────────────────────────

export async function disableDocumentAction(id: string) {
  try {
    await documentService.disableDocument(id);
    revalidatePath("/admin/documents");
    return { error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการปิดใช้งานเอกสาร"
    );
    return { error: message };
  }
}

// ─── Delete Document (Server Action) ─────────────────────────────────────────

export async function deleteDocumentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  try {
    await documentService.deleteDocument(id, user.id);
    revalidatePath("/admin/documents");
    revalidatePath("/staff/documents");
    return { error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการลบเอกสาร"
    );
    return { error: message };
  }
}

// ─── Get Signed Download URL (Server Action) ──────────────────────────────────

export async function getDownloadUrlAction(storagePath: string) {
  try {
    const url = await documentService.getSignedUrl(storagePath, 300); // 5 minute link
    return { data: url, error: null };
  } catch (err) {
    const message = getActionErrorMessage(
      err,
      "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์"
    );
    return { data: null, error: message };
  }
}
