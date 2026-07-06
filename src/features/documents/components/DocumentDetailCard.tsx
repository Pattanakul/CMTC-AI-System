"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Download,
  Archive,
  Power,
  PowerOff,
  Loader2,
  Calendar,
  HardDrive,
  Tag,
  KeyRound,
  Globe,
  Folder,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DocumentRow } from "@/features/documents/types";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { FileTypeBadge } from "./FileTypeBadge";
import {
  archiveDocumentAction,
  enableDocumentAction,
  disableDocumentAction,
  getDownloadUrlAction,
} from "@/features/documents/actions";

interface DocumentDetailCardProps {
  document: DocumentRow;
  departmentName?: string;
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

export function DocumentDetailCard({
  document,
  departmentName,
}: DocumentDetailCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const handleDownload = async () => {
    setLoading("download");
    const result = await getDownloadUrlAction(document.storage_path);
    setLoading(null);

    if (result.error) {
      toast.error("ดาวน์โหลดไม่สำเร็จ", { description: result.error });
    } else if (result.data) {
      const link = window.document.createElement("a");
      link.href = result.data;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success("เริ่มดาวน์โหลดไฟล์แล้ว");
    }
  };

  const handleArchive = async () => {
    setLoading("archive");
    const result = await archiveDocumentAction(document.id);
    setLoading(null);
    setArchiveOpen(false);

    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("จัดเก็บเอกสารแล้ว");
      router.refresh();
    }
  };

  const handleDisable = async () => {
    setLoading("disable");
    const result = await disableDocumentAction(document.id);
    setLoading(null);
    setDisableOpen(false);

    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("ปิดใช้งานเอกสารแล้ว");
      router.refresh();
    }
  };

  const handleEnable = async () => {
    setLoading("enable");
    const result = await enableDocumentAction(document.id);
    setLoading(null);

    if (result.error) {
      toast.error("เกิดข้อผิดพลาด", { description: result.error });
    } else {
      toast.success("เปิดใช้งานเอกสารแล้ว");
      router.refresh();
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <DocumentStatusBadge status={document.status} />
              <FileTypeBadge fileType={document.file_type} />
              <Badge variant="secondary" className="text-xs">
                {document.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {document.display_title}
            </h1>
            <p className="text-sm text-gray-400 font-mono mt-1">{document.file_name}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading === "download"}
              className="gap-2"
            >
              {loading === "download" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              ดาวน์โหลด
            </Button>

            <Link href={`/documents/${document.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                แก้ไข
              </Button>
            </Link>

            {document.status !== "ARCHIVED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiveOpen(true)}
                disabled={loading === "archive"}
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                {loading === "archive" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                จัดเก็บ
              </Button>
            )}

            {document.status === "ACTIVE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisableOpen(true)}
                disabled={loading === "disable"}
                className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
              >
                {loading === "disable" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PowerOff className="h-4 w-4" />
                )}
                ปิดใช้งาน
              </Button>
            )}

            {(document.status === "DISABLED" || document.status === "ARCHIVED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnable}
                disabled={loading === "enable"}
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {loading === "enable" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                เปิดใช้งาน
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            {document.description && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    คำอธิบาย
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {document.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Keywords */}
            {document.keywords && document.keywords.length > 0 && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-500" />
                    คีย์เวิร์ด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {document.keywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-100"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    แท็ก
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-100"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-4">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  ข้อมูลไฟล์
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <HardDrive className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">ขนาดไฟล์</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">วันที่อัปโหลด</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(document.created_at)}
                    </p>
                  </div>
                </div>

                {document.updated_at && document.updated_at !== document.created_at && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">แก้ไขล่าสุด</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(document.updated_at)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">ภาษา</p>
                    <p className="text-sm font-medium text-gray-700">
                      {document.language === "th"
                        ? "ภาษาไทย"
                        : document.language === "en"
                        ? "ภาษาอังกฤษ"
                        : document.language}
                    </p>
                  </div>
                </div>

                {departmentName && (
                  <div className="flex items-start gap-2">
                    <Folder className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">แผนก</p>
                      <p className="text-sm font-medium text-gray-700">{departmentName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Folder className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Storage Path</p>
                    <p className="text-xs font-mono text-gray-500 break-all">
                      {document.storage_path}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Preparation Status */}
            <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  AI Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>หมวดหมู่</span>
                  <span className="font-medium text-gray-700">{document.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>ภาษา</span>
                  <span className="font-medium text-gray-700">{document.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>คีย์เวิร์ด</span>
                  <span className="font-medium text-gray-700">
                    {(document.keywords ?? []).length} รายการ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>แท็ก</span>
                  <span className="font-medium text-gray-700">
                    {(document.tags ?? []).length} รายการ
                  </span>
                </div>
                <div className="pt-2 border-t border-indigo-100 text-center text-indigo-400">
                  พร้อมสำหรับการประมวลผล AI
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Archive Dialog */}
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>จัดเก็บเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการจัดเก็บ{" "}
              <span className="font-semibold">&quot;{document.display_title}&quot;</span>{" "}
              หรือไม่? เอกสารจะถูกซ่อนจากการค้นหาปกติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-amber-600 hover:bg-amber-700"
            >
              จัดเก็บ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Dialog */}
      <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ปิดใช้งานเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการปิดใช้งาน{" "}
              <span className="font-semibold">&quot;{document.display_title}&quot;</span>{" "}
              หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              className="bg-red-600 hover:bg-red-700"
            >
              ปิดใช้งาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
