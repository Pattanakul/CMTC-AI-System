"use client";

import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileSpreadsheet,
  File,
  Image as ImageIcon,
} from "lucide-react";

interface FileTypeBadgeProps {
  fileType: string;
  showIcon?: boolean;
}

const fileTypeConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pdf: {
    label: "PDF",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <FileText className="h-3 w-3" />,
  },
  docx: {
    label: "DOCX",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <FileText className="h-3 w-3" />,
  },
  xlsx: {
    label: "XLSX",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: <FileSpreadsheet className="h-3 w-3" />,
  },
  csv: {
    label: "CSV",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    icon: <FileSpreadsheet className="h-3 w-3" />,
  },
  txt: {
    label: "TXT",
    className: "bg-gray-50 text-gray-700 border-gray-200",
    icon: <File className="h-3 w-3" />,
  },
  png: {
    label: "PNG",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <ImageIcon className="h-3 w-3" />,
  },
  jpg: {
    label: "JPG",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <ImageIcon className="h-3 w-3" />,
  },
  jpeg: {
    label: "JPEG",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <ImageIcon className="h-3 w-3" />,
  },
};

export function FileTypeBadge({ fileType, showIcon = true }: FileTypeBadgeProps) {
  const config = fileTypeConfig[fileType.toLowerCase()] ?? {
    label: fileType.toUpperCase(),
    className: "bg-gray-50 text-gray-700 border-gray-200",
    icon: <File className="h-3 w-3" />,
  };

  return (
    <Badge variant="outline" className={`gap-1 text-xs font-mono font-semibold ${config.className}`}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}
