"use client";

import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/features/documents/types";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "ใช้งาน",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  ARCHIVED: {
    label: "จัดเก็บแล้ว",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  DISABLED: {
    label: "ปิดใช้งาน",
    className:
      "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50",
  },
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DISABLED;
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
