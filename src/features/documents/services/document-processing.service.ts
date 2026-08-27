import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDocumentToMarkdown } from "./document-parser.service";
import type { DocumentRow } from "../types";

interface ProcessDocumentInput {
  supabase: SupabaseClient;
  document: DocumentRow;
  file: File;
  forceReprocess?: boolean;
}

export function createContentHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการประมวลผลเอกสาร";
}

async function updateProcessingState(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<DocumentRow>
) {
  const { error } = await supabase.from("documents").update(payload).eq("id", id);
  if (error) throw error;
}

async function getNextUploadVersion(
  supabase: SupabaseClient,
  document: DocumentRow
): Promise<number> {
  let query = supabase
    .from("documents")
    .select("version")
    .eq("file_name", document.file_name)
    .eq("category", document.category)
    .neq("id", document.id)
    .order("version", { ascending: false })
    .limit(1);

  query = document.department_id
    ? query.eq("department_id", document.department_id)
    : query.is("department_id", null);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;

  return data?.version ? data.version + 1 : document.version ?? 1;
}

export async function processUploadedDocument({
  supabase,
  document,
  file,
  forceReprocess = false,
}: ProcessDocumentInput): Promise<DocumentRow> {
  console.info("[Document] Processing started", {
    documentId: document.id,
    fileName: document.file_name,
  });

  await updateProcessingState(supabase, document.id, {
    processing_status: "PROCESSING",
    processing_error: null,
  });

  let contentHash: string | null = null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    contentHash = createContentHash(buffer);

    if (!forceReprocess) {
      const { data: existing, error: lookupError } = await supabase
        .from("documents")
        .select("markdown_content, content_hash, version, processing_status")
        .eq("content_hash", contentHash)
        .eq("processing_status", "READY")
        .neq("id", document.id)
        .limit(1)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing?.markdown_content) {
        console.info("[Document] Duplicate content hash found, reusing Markdown", {
          documentId: document.id,
        });

        await updateProcessingState(supabase, document.id, {
          markdown_content: existing.markdown_content,
          content_hash: contentHash,
          version: existing.version ?? 1,
          processing_status: "READY",
          processing_error: null,
          processed_at: new Date().toISOString(),
          ai_ready: true,
        });

        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("id", document.id)
          .single();
        if (error) throw error;
        return data as DocumentRow;
      }
    }

    const nextVersion = forceReprocess
      ? (document.version ?? 1) + 1
      : await getNextUploadVersion(supabase, document);

    const result = await parseDocumentToMarkdown({
      fileName: document.file_name,
      fileType: document.file_type,
      buffer,
      title: document.display_title,
    });

    console.info("[Document] Saving Markdown", {
      documentId: document.id,
      parser: result.parser,
      version: nextVersion,
    });

    await updateProcessingState(supabase, document.id, {
      markdown_content: result.markdown,
      content_hash: contentHash,
      version: nextVersion,
      processing_status: "READY",
      processing_error: null,
      processed_at: new Date().toISOString(),
      ai_ready: true,
    });

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document.id)
      .single();
    if (error) throw error;

    console.info("[Document] Processing completed", {
      documentId: document.id,
    });

    return data as DocumentRow;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[Document] Processing failed", {
      documentId: document.id,
      message,
    });

    await updateProcessingState(supabase, document.id, {
      processing_status: "FAILED",
      processing_error: message,
      content_hash: contentHash,
      ai_ready: false,
    });

    const { data, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document.id)
      .single();
    if (fetchError) throw fetchError;

    return data as DocumentRow;
  }
}
