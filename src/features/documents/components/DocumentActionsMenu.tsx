"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  Archive,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";
import type { DocumentRow } from "@/features/documents/types";
import { useDocumentActions } from "@/features/documents/hooks";

interface DocumentActionsMenuProps {
  document: DocumentRow;
}

export function DocumentActionsMenu({ document }: DocumentActionsMenuProps) {
  const router = useRouter();
  const { loadingId, archiveDocument, enableDocument, disableDocument, downloadDocument } =
    useDocumentActions();

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  const isLoading =
    loadingId === document.id || loadingId === document.storage_path;

  const handleArchive = async () => {
    await archiveDocument(document.id, document.display_title);
    setArchiveDialogOpen(false);
    router.refresh();
  };

  const handleDisable = async () => {
    await disableDocument(document.id, document.display_title);
    setDisableDialogOpen(false);
    router.refresh();
  };

  const handleEnable = async () => {
    await enableDocument(document.id, document.display_title);
    router.refresh();
  };

  const handleDownload = async () => {
    await downloadDocument(document.storage_path, document.file_name);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">เปิดเมนู</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>การจัดการเอกสาร</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push(`/documents/${document.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            ดูรายละเอียด
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/documents/${document.id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลด
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {document.status !== "ARCHIVED" && (
            <DropdownMenuItem
              onClick={() => setArchiveDialogOpen(true)}
              className="text-amber-600 focus:text-amber-600"
            >
              <Archive className="h-4 w-4 mr-2" />
              จัดเก็บเอกสาร
            </DropdownMenuItem>
          )}

          {document.status === "ACTIVE" && (
            <DropdownMenuItem
              onClick={() => setDisableDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              ปิดใช้งาน
            </DropdownMenuItem>
          )}

          {document.status === "DISABLED" && (
            <DropdownMenuItem
              onClick={handleEnable}
              className="text-emerald-600 focus:text-emerald-600"
            >
              <Power className="h-4 w-4 mr-2" />
              เปิดใช้งาน
            </DropdownMenuItem>
          )}

          {document.status === "ARCHIVED" && (
            <DropdownMenuItem
              onClick={handleEnable}
              className="text-emerald-600 focus:text-emerald-600"
            >
              <Power className="h-4 w-4 mr-2" />
              คืนสถานะใช้งาน
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>จัดเก็บเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการจัดเก็บเอกสาร{" "}
              <span className="font-semibold">&quot;{document.display_title}&quot;</span>{" "}
              ไว้ในคลังเก็บหรือไม่? เอกสารจะยังคงอยู่ในระบบแต่จะถูกซ่อนจากการค้นหาปกติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-amber-600 hover:bg-amber-700"
            >
              จัดเก็บเอกสาร
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ปิดใช้งานเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการปิดใช้งานเอกสาร{" "}
              <span className="font-semibold">&quot;{document.display_title}&quot;</span>{" "}
              หรือไม่? ผู้ใช้จะไม่สามารถเข้าถึงเอกสารนี้ได้
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
