const fs = require('fs');
const path = require('path');

const files = {
  "src/features/documents/schemas/index.ts": `import { z } from "zod";

export const DocumentStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "DISABLED"]);
export const DocumentCategorySchema = z.enum([
  "Admissions", 
  "Tuition Fees", 
  "Departments", 
  "Regulations",
  "Curriculum",
  "News", 
  "General Documents"
]);

export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  fileName: z.string(),
  displayTitle: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  category: DocumentCategorySchema,
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  fileType: z.string(),
  fileSize: z.number().max(20 * 1024 * 1024, "File size must be less than 20MB"),
  storagePath: z.string(),
  uploadedBy: z.string().uuid(),
  language: z.string().default("th"),
  status: DocumentStatusSchema.default("ACTIVE"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateDocumentSchema = DocumentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateDocumentSchema = CreateDocumentSchema.partial();
`,
  "src/features/documents/types/index.ts": `import { z } from "zod";
import { DocumentSchema, CreateDocumentSchema, UpdateDocumentSchema } from "../schemas";

export type DocumentRecord = z.infer<typeof DocumentSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;
`,
  "src/features/documents/services/document.service.ts": `import { createClient } from '@/utils/supabase/server';
import { CreateDocument, UpdateDocument } from '../types';

export const documentService = {
  async getDocuments(filters?: { search?: string; category?: string; departmentId?: string; fileType?: string; status?: string }) {
    const supabase = createClient();
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(\`display_title.ilike.%\${filters.search}%,file_name.ilike.%\${filters.search}%\`);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.fileType) {
      query = query.eq('file_type', filters.fileType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getDocumentById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async uploadDocumentFile(file: File, folder: string) {
    const supabase = createClient();
    const fileName = \`\${Date.now()}-\${file.name}\`;
    const filePath = \`\${folder}/\${fileName}\`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;
    return data;
  },

  async createDocument(documentData: CreateDocument) {
    const supabase = createClient();
    const { data, error } = await supabase.from('documents').insert([{
      file_name: documentData.fileName,
      display_title: documentData.displayTitle,
      description: documentData.description,
      department_id: documentData.departmentId,
      category: documentData.category,
      keywords: documentData.keywords,
      tags: documentData.tags,
      file_type: documentData.fileType,
      file_size: documentData.fileSize,
      storage_path: documentData.storagePath,
      uploaded_by: documentData.uploadedBy,
      language: documentData.language,
      status: documentData.status,
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateDocument(id: string, documentData: UpdateDocument) {
    const supabase = createClient();
    const updatePayload: any = {};
    if (documentData.displayTitle) updatePayload.display_title = documentData.displayTitle;
    if (documentData.description !== undefined) updatePayload.description = documentData.description;
    if (documentData.category) updatePayload.category = documentData.category;
    if (documentData.departmentId) updatePayload.department_id = documentData.departmentId;
    if (documentData.keywords) updatePayload.keywords = documentData.keywords;
    if (documentData.tags) updatePayload.tags = documentData.tags;
    if (documentData.language) updatePayload.language = documentData.language;
    if (documentData.status) updatePayload.status = documentData.status;

    const { data, error } = await supabase.from('documents').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async archiveDocument(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('documents').update({ status: 'ARCHIVED' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async downloadDocument(storagePath: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from('documents').download(storagePath);
    if (error) throw error;
    return data;
  }
};
`,
  "src/app/(admin)/documents/page.tsx": `import { documentService } from "@/features/documents/services/document.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DocumentsPage() {
  let documents = [];
  try {
    documents = await documentService.getDocuments();
  } catch (err) {
    console.error("Error fetching documents:", err);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Link href="/documents/upload">
          <Button>Upload Document</Button>
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents?.map((doc: any) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap">{doc.display_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{doc.file_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{doc.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={\`px-2 py-1 text-xs rounded-full \${doc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={\`/documents/\${doc.id}/edit\`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <button className="text-blue-600 hover:text-blue-900">Download</button>
                </td>
              </tr>
            ))}
            {(!documents || documents.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,
  "src/app/(admin)/documents/upload/page.tsx": `"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDocumentSchema, CreateDocument } from "@/features/documents/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadDocumentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: {
      status: "ACTIVE",
      language: "th"
    }
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 20 * 1024 * 1024) {
        alert("File size exceeds 20MB limit");
        return;
      }
      setFile(selected);
    }
  };

  const onSubmit = async (data: any) => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    // Simulate upload process and database insertion via Service
    router.push("/documents");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
          <Label htmlFor="file" className="mb-2 cursor-pointer text-blue-600 hover:underline">
            Click or Drag & Drop to upload
          </Label>
          <input id="file" type="file" className="hidden" onChange={onFileChange} 
                 accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg" />
          {file && <p className="text-sm text-gray-600 mt-2">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOCX, XLSX, CSV, TXT, PNG, JPG (Max 20MB)</p>
        </div>

        <div>
          <Label htmlFor="displayTitle">Display Title</Label>
          <Input id="displayTitle" {...register("displayTitle", { required: "Title is required" })} />
          {errors.displayTitle && <p className="text-red-500 text-sm">{errors.displayTitle.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register("category")} className="w-full p-2 border rounded">
            <option value="Admissions">Admissions</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Departments">Departments</option>
            <option value="Regulations">Regulations</option>
            <option value="Curriculum">Curriculum</option>
            <option value="News">News</option>
            <option value="General Documents">General Documents</option>
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/documents")}>Cancel</Button>
          <Button type="submit" disabled={!file}>Upload & Save</Button>
        </div>
      </form>
    </div>
  );
}
`,
  "src/app/(admin)/documents/[id]/edit/page.tsx": `"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateDocumentSchema, UpdateDocument } from "@/features/documents/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateDocument>({
    resolver: zodResolver(UpdateDocumentSchema),
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      reset({
        displayTitle: "Student Regulations 2026",
        category: "Regulations",
        description: "Official student regulations document.",
        status: "ACTIVE"
      });
      setLoading(false);
    }, 500);
  }, [params.id, reset]);

  const onSubmit = async (data: UpdateDocument) => {
    // Call update service
    router.push("/documents");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Document Metadata</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="displayTitle">Display Title</Label>
          <Input id="displayTitle" {...register("displayTitle")} />
          {errors.displayTitle && <p className="text-red-500 text-sm">{errors.displayTitle.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register("category")} className="w-full p-2 border rounded">
            <option value="Admissions">Admissions</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Departments">Departments</option>
            <option value="Regulations">Regulations</option>
            <option value="Curriculum">Curriculum</option>
            <option value="News">News</option>
            <option value="General Documents">General Documents</option>
          </select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" {...register("status")} className="w-full p-2 border rounded">
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="DISABLED">DISABLED</option>
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/documents")}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('D:/CMTC/CMTC-AI-System', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
}
