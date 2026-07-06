"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { DOCUMENT_CATEGORIES } from "@/features/documents/types";
import { updateDocumentAction } from "@/features/documents/actions";
import type { DocumentRow } from "@/features/documents/types";

const EditFormSchema = z.object({
  displayTitle: z.string().min(1, "กรุณากรอกชื่อเอกสาร"),
  category: z.enum([
    "Admissions",
    "Tuition Fees",
    "Departments",
    "Regulations",
    "Curriculum",
    "News",
    "General Documents",
  ]),
  description: z.string().optional(),
  keywords: z.string().optional(),
  tags: z.string().optional(),
  language: z.string(),
  departmentId: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "DISABLED"]),
});

type EditFormValues = z.infer<typeof EditFormSchema>;

interface DocumentEditFormProps {
  document: DocumentRow;
  departments?: Array<{ id: string; name: string }>;
}

export function DocumentEditForm({
  document,
  departments = [],
}: DocumentEditFormProps) {
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      displayTitle: document.display_title,
      category: document.category,
      description: document.description ?? "",
      keywords: (document.keywords ?? []).join(", "),
      tags: (document.tags ?? []).join(", "),
      language: document.language ?? "th",
      departmentId: document.department_id ?? "",
      status: document.status,
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: EditFormValues) => {
    const formData = new FormData();
    formData.append("displayTitle", values.displayTitle);
    formData.append("category", values.category);
    if (values.description) formData.append("description", values.description);
    if (values.keywords) formData.append("keywords", values.keywords);
    if (values.tags) formData.append("tags", values.tags);
    formData.append("language", values.language);
    if (values.departmentId) formData.append("departmentId", values.departmentId);
    formData.append("status", values.status);

    const result = await updateDocumentAction(document.id, formData);

    if (result.error) {
      toast.error("บันทึกไม่สำเร็จ", { description: result.error });
    } else {
      toast.success("บันทึกการเปลี่ยนแปลงสำเร็จ");
      router.push(`/documents/${document.id}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* File Info (Read-only) */}
        <Card className="border-gray-100 shadow-sm bg-gray-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-700">
              ข้อมูลไฟล์ (ไม่สามารถแก้ไขได้)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">ชื่อไฟล์</p>
                <p className="font-medium text-gray-700 font-mono text-xs truncate">
                  {document.file_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ประเภทไฟล์</p>
                <p className="font-medium text-gray-700 uppercase">{document.file_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ขนาดไฟล์</p>
                <p className="font-medium text-gray-700">
                  {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่อัปโหลด</p>
                <p className="font-medium text-gray-700">
                  {document.created_at
                    ? new Intl.DateTimeFormat("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(document.created_at))
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Metadata */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              แก้ไขข้อมูลเอกสาร
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Title */}
            <FormField
              control={form.control}
              name="displayTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ชื่อเอกสาร <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category, Department, Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                            <SelectValue placeholder="ไม่ระบุ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">ไม่ระบุ</SelectItem>
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
                        <SelectItem value="ARCHIVED">จัดเก็บแล้ว</SelectItem>
                        <SelectItem value="DISABLED">ปิดใช้งาน</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keywords & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คีย์เวิร์ด</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
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
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      คั่นด้วยเครื่องหมายจุลภาค (,)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Language */}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
