"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  uploadDocumentAction,
  updateDocumentAction,
  archiveDocumentAction,
  enableDocumentAction,
  disableDocumentAction,
  getDownloadUrlAction,
  reprocessDocumentAction,
} from "../actions";

// ─── useDocumentUpload ────────────────────────────────────────────────────────

export function useDocumentUpload() {
  const [isPending, startTransition] = useTransition();

  const upload = async (formData: FormData): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await uploadDocumentAction(formData);
        if (result.error) {
          toast.error("อัปโหลดไม่สำเร็จ", { description: result.error });
          resolve(false);
        } else {
          toast.success("อัปโหลดเอกสารสำเร็จ", {
            description: `เอกสาร "${result.data?.display_title}" ถูกบันทึกแล้ว`,
          });
          resolve(true);
        }
      });
    });
  };

  return { upload, isPending };
}

// ─── useDocumentUpdate ────────────────────────────────────────────────────────

export function useDocumentUpdate() {
  const [isPending, startTransition] = useTransition();

  const update = async (id: string, formData: FormData): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updateDocumentAction(id, formData);
        if (result.error) {
          toast.error("บันทึกไม่สำเร็จ", { description: result.error });
          resolve(false);
        } else {
          toast.success("บันทึกการเปลี่ยนแปลงสำเร็จ");
          resolve(true);
        }
      });
    });
  };

  return { update, isPending };
}

// ─── useDocumentActions ───────────────────────────────────────────────────────

export function useDocumentActions() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const archiveDocument = async (id: string, title: string) => {
    setLoadingId(id);
    const result = await archiveDocumentAction(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("จัดเก็บเอกสารแล้ว", { description: `"${title}" ถูกย้ายไปยังคลังเก็บ` });
    }
    return !result.error;
  };

  const enableDocument = async (id: string, title: string) => {
    setLoadingId(id);
    const result = await enableDocumentAction(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("เปิดใช้งานเอกสารแล้ว", { description: `"${title}" ถูกเปิดใช้งาน` });
    }
    return !result.error;
  };

  const disableDocument = async (id: string, title: string) => {
    setLoadingId(id);
    const result = await disableDocumentAction(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("ปิดใช้งานเอกสารแล้ว", { description: `"${title}" ถูกปิดใช้งาน` });
    }
    return !result.error;
  };

  const downloadDocument = async (storagePath: string, fileName: string) => {
    setLoadingId(storagePath);
    const result = await getDownloadUrlAction(storagePath);
    setLoadingId(null);
    if (result.error) {
      toast.error("ดาวน์โหลดไม่สำเร็จ", { description: result.error });
    } else if (result.data) {
      const link = document.createElement("a");
      link.href = result.data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("เริ่มดาวน์โหลดไฟล์แล้ว");
    }
    return !result.error;
  };

  const reprocessDocument = async (id: string, title: string) => {
    setLoadingId(id);
    const result = await reprocessDocumentAction(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("ประมวลผลไม่สำเร็จ", { description: result.error });
    } else {
      toast.success("ประมวลผลเอกสารใหม่แล้ว", {
        description: `"${title}" พร้อมใช้งานสำหรับ Knowledge Base`,
      });
    }
    return !result.error;
  };

  return {
    loadingId,
    archiveDocument,
    enableDocument,
    disableDocument,
    downloadDocument,
    reprocessDocument,
  };
}
