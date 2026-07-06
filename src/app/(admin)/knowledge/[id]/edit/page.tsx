"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateArticleSchema, UpdateArticle } from "@/features/knowledge/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateArticle>({
    resolver: zodResolver(UpdateArticleSchema),
  });

  useEffect(() => {
    // In a real app, fetch data from API or Server Action
    // For now, just simulating data load
    setTimeout(() => {
      reset({
        title: "Sample Article",
        category: "General Information",
        content: "This is a sample content.",
        status: "PUBLISHED"
      });
      setLoading(false);
    }, 500);
  }, [params.id, reset]);

  const onSubmit = async () => {
    // Call update service here
    router.push("/knowledge");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Knowledge Article</h1>
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
          <Label htmlFor="status">Status</Label>
          <select id="status" {...register("status")} className="w-full p-2 border rounded">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" rows={10} {...register("content")} />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/knowledge")}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
