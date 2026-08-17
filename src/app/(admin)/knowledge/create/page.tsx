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

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateArticle>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      isPublish: false,
      departmentId: "25508dda-220b-490f-85f3-1c72adf515a1"
    }
  });

  const onSubmit = async (data: CreateArticle) => {
    try {
      await knowledgeService.createArticle(data);
      toast.success("Article created successfully");
      router.push("/knowledge");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create article");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Knowledge Article</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="question">Question</Label>
          <Input id="question" {...register("question")} />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <Textarea id="answer" rows={10} {...register("answer")} />
          {errors.answer && <p className="text-red-500 text-sm">{errors.answer.message as string}</p>}
        </div>

        <div>
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("categoryId", v as string)}>
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message as string}</p>}
        </div>

        <div>
            <Label>Status</Label>
            <Select onValueChange={(v) => setValue("isPublish", v === "true")}>
              <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/knowledge")}>Cancel</Button>     
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}
