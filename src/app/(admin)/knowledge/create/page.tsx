"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateArticleSchema, CreateArticle } from "@/features/knowledge/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateArticlePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateArticle>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      status: "DRAFT"
    }
  });

  const onSubmit = async (data: CreateArticle) => {
    // We would normally call the service here (e.g. via a Server Action or API route)
    // For this milestone, we'll assume success for now or wire up a Server Action
    router.push("/knowledge");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Knowledge Article</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register("category")} className="w-full p-2 border rounded">
            <option value="Admissions">Admissions</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Departments">Departments</option>
            <option value="Contact Information">Contact Information</option>
            <option value="News">News</option>
            <option value="General Information">General Information</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" rows={10} {...register("content")} placeholder="Use rich text..." />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>

        {/* Note: In a real app, authorId is pulled from the current user session. */}
        <input type="hidden" {...register("authorId")} value="00000000-0000-0000-0000-000000000000" />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/knowledge")}>Cancel</Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}
