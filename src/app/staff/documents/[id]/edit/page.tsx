import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { documentService } from "@/features/documents/services/document.service";
import { DocumentEditForm } from "@/features/documents/components/DocumentEditForm";
import type { DocumentRow } from "@/features/documents/types";

interface StaffEditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StaffEditDocumentPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const doc = await documentService.getDocumentById(id);
    return {
      title: `แก้ไข: ${doc.display_title}`,
    };
  } catch {
    return { title: "แก้ไขเอกสาร" };
  }
}

async function getStaffDocument(id: string): Promise<DocumentRow> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", user.id)
    .single();

  if (!profile?.department_id) notFound();

  const document = await documentService.getDocumentById(id);

  if (document.department_id !== profile.department_id) {
    notFound();
  }

  return document;
}

async function getStaffDepartments(
  departmentId?: string
): Promise<Array<{ id: string; name: string }>> {
  if (!departmentId) return [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("departments")
      .select("id, name")
      .eq("id", departmentId)
      .single();

    return data ? [data] as Array<{ id: string; name: string }> : [];
  } catch {
    return [];
  }
}

export default async function StaffEditDocumentPage({
  params,
}: StaffEditDocumentPageProps) {
  const { id } = await params;
  const document = await getStaffDocument(id);
  const departments = await getStaffDepartments(document.department_id);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/staff/documents"
            className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            จัดการเอกสาร
          </Link>
          <span>/</span>
          <Link
            href={`/staff/documents/${id}`}
            className="hover:text-gray-700 transition-colors line-clamp-1 max-w-[200px]"
          >
            {document.display_title}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">แก้ไข</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
            <Pencil className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลเอกสาร</h1>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {document.file_name}
            </p>
          </div>
        </div>

        <DocumentEditForm
          document={document}
          departments={departments}
          basePath="/staff/documents"
        />
      </div>
    </div>
  );
}
