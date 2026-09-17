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
import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import { categoryService } from "@/features/knowledge/services/category.service";
import { toast } from "sonner";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UpdateArticle>({
    resolver: zodResolver(UpdateArticleSchema),
  });

  const isPublish = watch("isPublish");

  useEffect(() => {
    // Fetch article data
    const fetchArticleAndCategories = async () => {
      try {
        const article = await knowledgeService.getArticleById(id);
        
        // Fetch categories for this department
        if (article.department_id) {
          const cats = await categoryService.getCategories(article.department_id);
          setCategories(cats);
        }

        reset({
          title: article.title,
          question: article.question || undefined,
          answer: article.answer,
          categoryId: article.category_id,
          departmentId: article.department_id || undefined,
          isPublish: article.is_publish
        });
      } catch {
        toast.error("Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleAndCategories();
  }, [id, reset]);

  const onSubmit = async (data: UpdateArticle) => {
    try {
      await knowledgeService.updateArticle(id, data);
      toast.success("Article updated successfully");
      router.push("/staff/knowledge");
    } catch {
      toast.error("Failed to update article");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
          <Label htmlFor="question">คำถาม (ถ้ามี)</Label>
          <Input id="question" {...register("question")} />
        </div>

        <div>
          <Label htmlFor="answer">คำตอบ / รายละเอียด</Label>
          <Textarea id="answer" rows={5} {...register("answer")} />
          {errors.answer && <p className="text-red-500 text-sm">{errors.answer.message as string}</p>}
        </div>

        <div>
          <Label>หมวดหมู่</Label>
          <Select value={watch("categoryId") ?? ""} onValueChange={(v) => setValue("categoryId", v ?? "")}>

            <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
          <Button type="button" variant="outline" onClick={() => router.push("/staff/knowledge")}>ยกเลิก</Button>     
          <Button type="submit">บันทึกการแก้ไข</Button>
        </div>
      </form>
    </div>
  );
}
