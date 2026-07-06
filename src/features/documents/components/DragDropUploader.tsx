"use client";

import { useCallback, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from "@/features/documents/types";

export interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error" | "duplicate";
  error?: string;
}

interface DragDropUploaderProps {
  onFilesSelected: (files: File[]) => void;
  uploadStatuses?: Record<string, { progress: number; status: FileWithStatus["status"]; error?: string }>;
  multiple?: boolean;
  disabled?: boolean;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg"].includes(ext))
    return <ImageIcon className="h-5 w-5" />;
  if (["xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className="h-5 w-5" />;
  if (["pdf", "docx", "txt"].includes(ext))
    return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function DragDropUploader({
  onFilesSelected,
  uploadStatuses = {},
  multiple = false,
  disabled = false,
}: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const validateFile = (file: File): string | null => {
    const ext = ("." + file.name.split(".").pop()?.toLowerCase()) as string;
    if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
      return `ประเภทไฟล์ไม่รองรับ (${ext})`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `ไฟล์ขนาดใหญ่เกินกว่า 20MB (${formatSize(file.size)})`;
    }
    return null;
  };

  const processFiles = useCallback(
    (selectedFiles: FileList | File[]) => {
      const fileArray = Array.from(selectedFiles);
      const existingNames = files.map((f) => f.file.name);

      const processed: FileWithStatus[] = fileArray.map((file) => {
        const isDuplicate = existingNames.includes(file.name);
        const error = isDuplicate ? undefined : validateFile(file) ?? undefined;
        return {
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          progress: 0,
          status: isDuplicate ? "duplicate" : error ? "error" : "pending",
          error: isDuplicate ? "ไฟล์นี้ถูกเลือกแล้ว" : error,
        };
      });

      const validFiles = processed
        .filter((f) => f.status === "pending")
        .map((f) => f.file);

      setFiles((prev) => (multiple ? [...prev, ...processed] : processed));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [multiple, onFilesSelected, files]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-inner"
            : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <input
          id="file-upload-input"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={onInputChange}
          multiple={multiple}
          accept={ALLOWED_EXTENSIONS.join(",")}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={[
              "p-4 rounded-full transition-colors",
              isDragging ? "bg-blue-100" : "bg-white shadow-sm border border-gray-100",
            ].join(" ")}
          >
            <UploadCloud
              className={[
                "h-8 w-8 transition-colors",
                isDragging ? "text-blue-500" : "text-gray-400",
              ].join(" ")}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? "ปล่อยไฟล์เพื่ออัปโหลด" : "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOCX, XLSX, CSV, TXT, PNG, JPG, JPEG • สูงสุด 20MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => {
            const liveStatus = uploadStatuses[fileItem.file.name];
            const status = liveStatus?.status ?? fileItem.status;
            const progress = liveStatus?.progress ?? fileItem.progress;
            const errorMsg = liveStatus?.error ?? fileItem.error;

            const borderClass =
              status === "error" || status === "duplicate"
                ? "border-red-100 bg-red-50"
                : status === "success"
                ? "border-emerald-100 bg-emerald-50"
                : status === "uploading"
                ? "border-blue-100 bg-blue-50"
                : "border-gray-100 bg-white";

            const iconClass =
              status === "error" || status === "duplicate"
                ? "text-red-400"
                : status === "success"
                ? "text-emerald-400"
                : status === "uploading"
                ? "text-blue-400"
                : "text-gray-400";

            return (
              <div
                key={fileItem.id}
                className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm ${borderClass} transition-colors`}
              >
                <div className={`flex-shrink-0 ${iconClass}`}>
                  {getFileIcon(fileItem.file.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatSize(fileItem.file.size)}</p>
                  {errorMsg && (
                    <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
                  )}
                  {status === "uploading" && (
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-blue-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : status === "error" || status === "duplicate" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : status === "uploading" ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeFile(fileItem.id)}
                      className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
