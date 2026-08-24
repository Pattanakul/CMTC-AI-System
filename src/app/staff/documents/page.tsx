export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText } from "lucide-react";
import { documentService } from "@/features/documents/services/document.service";
import { DocumentTable } from "@/features/documents/components/DocumentTable";
import { DocumentSearchFilter } from "@/features/documents/components/DocumentSearchFilter";
import type { DocumentFilters, DocumentCategory, DocumentStatus, DocumentRow } from "@/features/documents/types";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "จัดการเอกสาร",
  description: "บริหารจัดการเอกสารทั้งหมดในระบบ CMTC AI Knowledge Management System",
};

interface DocumentsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    fileType?: string;
    status?: string;
    departmentId?: string;
  }>;
}

async function DocumentList({ filters }: { filters: DocumentFilters }) {
  let documents: DocumentRow[] = [];
  try {
    documents = await documentService.getDocuments(filters);
  } catch (err) {
    console.error("Error fetching documents:", err);
  }

  return <DocumentTable documents={documents} />;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('department_id').eq('id', user?.id).single();

  const filters: DocumentFilters = {
    search: params.search,
    category: params.category as DocumentCategory | undefined,
    fileType: params.fileType,
    status: params.status as DocumentStatus | undefined,
    departmentId: profile?.department_id || params.departmentId,
  };

  let totalCount = 0;
  try {
    const docs = await documentService.getDocuments(filters);
    totalCount = docs.length;
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">จัดการเอกสาร</h1>
              </div>
              <p className="text-sm text-gray-500 ml-14">
                บริหารจัดการเอกสารทั้งหมดในระบบ • พบ{" "}
                <span className="font-semibold text-gray-700">{totalCount}</span> เอกสาร
              </p>
            </div>
            <Link href="/staff/documents/upload">
              <Button className="gap-2 shadow-sm">
                <Upload className="h-4 w-4" />
                อัปโหลดเอกสาร
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6">
          <Suspense fallback={<Skeleton className="h-12 w-full rounded-lg" />}>
            <DocumentSearchFilter />
          </Suspense>
        </div>

        {/* Document Table */}
        <Suspense
          fallback={
            <div className="rounded-lg border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-12 bg-gray-50 border-b border-gray-100" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 border-b border-gray-50 px-6 flex items-center gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          }
        >
          <DocumentList filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
