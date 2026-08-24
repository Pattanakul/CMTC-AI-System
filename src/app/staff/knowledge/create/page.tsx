"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateArticleSchema, type CreateArticle } from "@/features/knowledge/schemas";
import { categoryService } from "@/features/knowledge/services/category.service";
import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateArticle>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      isPublish: false,
    }
  });

  useEffect(() => {
    // Fetch user department and categories for that department
    const fetchProfileAndCategories = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('department_id').eq('id', user.id).single();
        if (profile?.department_id) {
          setDepartmentId(profile.department_id);
          setValue('departmentId', profile.department_id);
          
          // Fetch categories only for this department
          categoryService.getCategories(profile.department_id).then(setCategories).catch(console.error);
        }
      }
    };
    fetchProfileAndCategories();
  }, [setValue]);

  const onSubmit = async (data: CreateArticle) => {
    try {
      await knowledgeService.createArticle(data);
      toast.success("Article created successfully");
      router.push("/staff/knowledge");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create article");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">เพิ่มข้อมูลความรู้</h1>
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
          <Textarea id="answer" rows={10} {...register("answer")} />
          {errors.answer && <p className="text-red-500 text-sm">{errors.answer.message as string}</p>}
        </div>

        <div>
          <Label>หมวดหมู่</Label>
          <Select onValueChange={(v) => setValue("categoryId", v as string)}>
            <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message as string}</p>}
        </div>

        <div>
            <Label>สถานะ</Label>
            <Select onValueChange={(v) => setValue("isPublish", v === "true")}>
              <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">เผยแพร่</SelectItem>
                <SelectItem value="false">ร่าง</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/staff/knowledge")}>ยกเลิก</Button>     
          <Button type="submit">บันทึก</Button>
        </div>
      </form>
    </div>
  );
}
