"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { DragDropUploader } from "./DragDropUploader";
import { UploadFormSchema, type UploadFormValues } from "@/features/documents/schemas";
import { DOCUMENT_CATEGORY_MAP } from "@/features/documents/types";
import { uploadDocumentAction } from "@/features/documents/actions";

interface DocumentUploadFormProps {
  departments?: Array<{ id: string; name: string }>;
}

export function DocumentUploadForm({ departments = [] }: DocumentUploadFormProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<
    Record<string, { progress: number; status: "pending" | "uploading" | "success" | "error"; error?: string }> 
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(UploadFormSchema),
    defaultValues: {
      displayTitle: "",
      category: "General Documents",
      description: "",
      keywords: "",
      tags: "",
      language: "th",
      departmentId: "",
    },
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    if (files.length > 0 && !form.getValues("displayTitle")) {
      const name = files[0].name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      form.setValue("displayTitle", name);
    }
  };

  const handleSingleUpload = async (file: File, values: UploadFormValues) => {
    setUploadStatuses((prev) => ({
      ...prev,
      [file.name]: { progress: 20, status: "uploading" },
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayTitle", values.displayTitle || file.name.replace(/\.[^.]+$/, ""));
    formData.append("category", values.category);
    if (values.description) formData.append("description", values.description);
    if (values.keywords) formData.append("keywords", values.keywords);
    if (values.tags) formData.append("tags", values.tags);
    formData.append("language", values.language);
    if (values.departmentId) formData.append("departmentId", values.departmentId);

    setUploadStatuses((prev) => ({
      ...prev,
      [file.name]: { progress: 50, status: "uploading" },
    }));

    const result = await uploadDocumentAction(formData);

    setUploadStatuses((prev) => ({
      ...prev,
      [file.name]: result.error
        ? { progress: 0, status: "error", error: result.error }
        : { progress: 100, status: "success" },
    }));

    return !result.error;
  };

  const onSubmit: SubmitHandler<UploadFormValues> = async (values) => {
    if (selectedFiles.length === 0) {
      toast.error("กรุณาเลือกไฟล์", { description: "ต้องมีไฟล์อย่างน้อย 1 ไฟล์" });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      const ok = await handleSingleUpload(file, values);
      if (ok) successCount++;
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast.success(`อัปโหลดสำเร็จ ${successCount}/${selectedFiles.length} ไฟล์`, {
        description: "เอกสารถูกบันทึกเข้าระบบแล้ว",
      });
      setTimeout(() => router.push("/admin/documents"), 1500);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              เลือกไฟล์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropUploader
              onFilesSelected={handleFilesSelected}
              uploadStatuses={uploadStatuses}
              multiple
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              ข้อมูลเอกสาร
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="displayTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ชื่อเอกสาร <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="เช่น ระเบียบการรับสมัครนักศึกษา ปี 2568"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      หมวดหมู่ <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DOCUMENT_CATEGORY_MAP).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {departments.length > 0 && (
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แผนก</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแผนก (ถ้ามี)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">ไม่ระบุแผนก</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="คำอธิบายสั้นๆ เกี่ยวกับเอกสาร..."
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คีย์เวิร์ด</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="รับสมัคร, ระเบียบ, 2568"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      คั่นด้วยเครื่องหมายจุลภาค (,)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แท็ก</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="สำคัญ, อัปเดต"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      คั่นด้วยเครื่องหมายจุลภาค (,)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ภาษา</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="th">ภาษาไทย</SelectItem>
                      <SelectItem value="en">ภาษาอังกฤษ</SelectItem>
                      <SelectItem value="mixed">ภาษาผสม</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/documents")}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || selectedFiles.length === 0}
            className="gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                อัปโหลด{selectedFiles.length > 1 ? ` ${selectedFiles.length} ไฟล์` : ""}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
