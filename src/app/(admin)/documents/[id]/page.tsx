import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { documentService } from "@/features/documents/services/document.service";
import { DocumentDetailCard } from "@/features/documents/components/DocumentDetailCard";
import { createClient } from "@/utils/supabase/server";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DocumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const doc = await documentService.getDocumentById(id);
    return {
      title: doc.display_title,
      description: doc.description ?? `เอกสาร ${doc.display_title}`,
    };
  } catch {
    return { title: "รายละเอียดเอกสาร" };
  }
}

async function getDepartmentName(departmentId?: string): Promise<string | undefined> {
  if (!departmentId) return undefined;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .single();
    return data?.name;
  } catch {
    return undefined;
  }
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;

  let document;
  try {
    document = await documentService.getDocumentById(id);
  } catch {
    notFound();
  }

  const departmentName = await getDepartmentName(document.department_id);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/documents"
            className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            จัดการเอกสาร
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">
            {document.display_title}
          </span>
        </div>

        {/* Document Detail */}
        <DocumentDetailCard document={document} departmentName={departmentName} />
      </div>
    </div>
  );
}
