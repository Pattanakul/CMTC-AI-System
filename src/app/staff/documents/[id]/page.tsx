import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { documentService } from "@/features/documents/services/document.service";
import { DocumentDetailCard } from "@/features/documents/components/DocumentDetailCard";
import type { DocumentRow } from "@/features/documents/types";

interface StaffDocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StaffDocumentDetailPageProps): Promise<Metadata> {
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

export default async function StaffDocumentDetailPage({
  params,
}: StaffDocumentDetailPageProps) {
  const { id } = await params;
  const document = await getStaffDocument(id);
  const departmentName = await getDepartmentName(document.department_id);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/staff/documents"
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

        <DocumentDetailCard
          document={document}
          departmentName={departmentName}
          basePath="/staff/documents"
        />
      </div>
    </div>
  );
}
