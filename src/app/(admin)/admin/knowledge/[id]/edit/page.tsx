"use client";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateArticleSchema, type UpdateArticle } from "@/features/knowledge/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UpdateArticle>({
    resolver: zodResolver(UpdateArticleSchema),
  });

  const isPublish = watch("isPublish");

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      reset({
        title: "Sample Article",
        question: "Sample Question?",
        answer: "Sample Answer.",
        categoryId: "00000000-0000-0000-0000-000000000000",
        departmentId: "25508dda-220b-490f-85f3-1c72adf515a1",
        isPublish: true
      });
      setLoading(false);
    }, 500);
  }, [id, reset]);

  const onSubmit = async (data: UpdateArticle) => {
    console.log(data);
    router.push("/admin/knowledge");
  };

  if (loading) return <div className="p-8">กำลังโหลด...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลความรู้</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">หัวข้อ</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="question">คำถาม</Label>
          <Input id="question" {...register("question")} />
        </div>

        <div>
          <Label htmlFor="answer">คำตอบ / รายละเอียด</Label>
          <Textarea id="answer" rows={5} {...register("answer")} />
          {errors.answer && <p className="text-red-500 text-sm">{errors.answer.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="categoryId">รหัสหมวดหมู่</Label>
          <Input id="categoryId" {...register("categoryId")} />
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message as string}</p>}
        </div>

        <div>
            <Label>สถานะ</Label>
            <Select value={isPublish ? "true" : "false"} onValueChange={(value) => setValue("isPublish", value === "true")}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">เผยแพร่</SelectItem>
                <SelectItem value="false">ร่าง</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/knowledge")}>ยกเลิก</Button>     
          <Button type="submit">บันทึกการแก้ไข</Button>
        </div>
      </form>
    </div>
  );
}
