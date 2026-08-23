import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { DocumentUploadForm } from "@/features/documents/components/DocumentUploadForm";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "อัปโหลดเอกสาร",
  description: "อัปโหลดเอกสารใหม่เข้าสู่ระบบ CMTC AI Knowledge Management System",
};

async function getDepartments() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("departments")
      .select("id, name")
      .order("name");
    return (data ?? []) as Array<{ id: string; name: string }>;
  } catch {
    return [];
  }
}

export default async function UploadDocumentPage() {
  const departments = await getDepartments();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/admin/documents"
            className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            จัดการเอกสาร
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">อัปโหลดเอกสาร</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">อัปโหลดเอกสาร</h1>
            <p className="text-sm text-gray-500">รองรับหลายไฟล์พร้อมกัน ขนาดไม่เกิน 20MB ต่อไฟล์</p>
          </div>
        </div>

        {/* Upload Form */}
        <DocumentUploadForm departments={departments} />
      </div>
    </div>
  );
}
