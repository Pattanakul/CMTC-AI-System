"use client";

import { Badge } from "@/components/ui/badge";
import type { DocumentProcessingStatus } from "@/features/documents/types";

interface DocumentProcessingStatusBadgeProps {
  status?: DocumentProcessingStatus;
}

const statusConfig: Record<
  DocumentProcessingStatus,
  { label: string; className: string }
> = {
  UPLOADED: {
    label: "อัปโหลดแล้ว",
    className: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50",
  },
  PROCESSING: {
    label: "กำลังประมวลผล",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  READY: {
    label: "พร้อมใช้งาน",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  FAILED: {
    label: "ประมวลผลไม่สำเร็จ",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  },
};

export function DocumentProcessingStatusBadge({
  status = "UPLOADED",
}: DocumentProcessingStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.UPLOADED;

  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
