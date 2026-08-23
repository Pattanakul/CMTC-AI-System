import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { documentService } from "@/features/documents/services/document.service";
import { DocumentEditForm } from "@/features/documents/components/DocumentEditForm";
import { createClient } from "@/utils/supabase/server";

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditDocumentPageProps): Promise<Metadata> {
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

async function getDepartments(): Promise<Array<{ id: string; name: string }>> {
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

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;

  let document;
  try {
    document = await documentService.getDocumentById(id);
  } catch {
    notFound();
  }

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
          <Link
            href={`/documents/${id}`}
            className="hover:text-gray-700 transition-colors line-clamp-1 max-w-[200px]"
          >
            {document.display_title}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">แก้ไข</span>
        </div>

        {/* Page Header */}
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

        {/* Edit Form */}
        <DocumentEditForm document={document} departments={departments} />
      </div>
    </div>
  );
}
