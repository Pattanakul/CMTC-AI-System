"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { DocumentRow } from "@/features/documents/types";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { DocumentProcessingStatusBadge } from "./DocumentProcessingStatusBadge";
import { FileTypeBadge } from "./FileTypeBadge";
import { DocumentActionsMenu } from "./DocumentActionsMenu";

interface DocumentTableProps {
  documents: DocumentRow[];
  isLoading?: boolean;
  basePath?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

export function DocumentTable({
  documents,
  isLoading = false,
  basePath = "/admin/documents",
}: DocumentTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-[300px]">เอกสาร</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>ขนาด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่อัปโหลด</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-600">ไม่พบเอกสาร</p>
        <p className="text-xs text-gray-400 mt-1">
          ลองเปลี่ยนคำค้นหาหรือตัวกรอง หรืออัปโหลดเอกสารใหม่
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="w-[320px] font-semibold text-gray-700">เอกสาร</TableHead>
            <TableHead className="font-semibold text-gray-700">หมวดหมู่</TableHead>
            <TableHead className="font-semibold text-gray-700">ประเภท</TableHead>
            <TableHead className="font-semibold text-gray-700">ขนาด</TableHead>
              <TableHead className="font-semibold text-gray-700">สถานะ</TableHead>
              <TableHead className="font-semibold text-gray-700">ประมวลผล</TableHead>
              <TableHead className="font-semibold text-gray-700">วันที่อัปโหลด</TableHead>
              <TableHead className="font-semibold text-gray-700">Version</TableHead>
              <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="group hover:bg-blue-50/30 transition-colors"
            >
              {/* Document Name & Title */}
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`${basePath}/${doc.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {doc.display_title}
                  </Link>
                  <span className="text-xs text-gray-400 font-mono truncate max-w-[280px]">
                    {doc.file_name}
                  </span>
                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal whitespace-nowrap"
                >
                  {doc.category}
                </Badge>
              </TableCell>

              {/* File Type */}
              <TableCell>
                <FileTypeBadge fileType={doc.file_type} />
              </TableCell>

              {/* File Size */}
              <TableCell>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatFileSize(doc.file_size)}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <DocumentStatusBadge status={doc.status} />
              </TableCell>

              <TableCell>
                <DocumentProcessingStatusBadge status={doc.processing_status} />
              </TableCell>

              {/* Date */}
              <TableCell>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(doc.created_at)}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-sm font-medium text-gray-700">
                  v{doc.version ?? 1}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <DocumentActionsMenu document={doc} basePath={basePath} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
