import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; isPublish?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user?.id).single();
  
  const params = await searchParams;
  
  let articles: any[] = [];
  try {
    if (!supabase) {
      console.error("Supabase client is missing!");
    }
    articles = await knowledgeService.getArticles({
      search: params.search,
      categoryId: params.categoryId,
      isPublish: params.isPublish === 'true' ? true : params.isPublish === 'false' ? false : undefined,
    }, supabase) || [];
  } catch (error: any) {
    console.error("Error fetching articles details:", {
      message: error?.message || "No message",
      code: error?.code || "No code",
      details: error?.details || "No details",
      raw: error
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        หน้าหลัก / ข้อมูลความรู้ประชาสัมพันธ์
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ข้อมูลความรู้ประชาสัมพันธ์</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการข้อมูลความรู้สำหรับใช้ในการให้บริการข้อมูลและตอบคำถามประชาสัมพันธ์ของวิทยาลัย</p>
        </div>
        <Link href="/admin/knowledge/create">
          <Button className="bg-slate-800 hover:bg-slate-900">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มข้อมูลความรู้
          </Button>
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16">ลำดับ</TableHead>
              <TableHead>หัวข้อ</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>แก้ไขล่าสุด</TableHead>
              <TableHead className="w-16">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles && articles.length > 0 ? (
                articles.map((article: any, index: number) => (
                <TableRow key={article.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.knowledge_categories?.name || '-'}</TableCell>
                    <TableCell>
                    <Badge variant={article.is_publish ? "default" : "secondary"} className={article.is_publish ? "bg-green-600" : "bg-slate-200 text-slate-700"}>
                        {article.is_publish ? "เผยแพร่" : "ร่าง"}
                    </Badge>
                    </TableCell>
                    <TableCell>{article.updated_at ? new Date(article.updated_at).toLocaleDateString('th-TH') : '-'}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem>ดูข้อมูล</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/knowledge/${article.id}/edit`}>แก้ไข</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>ลบข้อมูล</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        ยังไม่มีข้อมูลความรู้สำหรับงานประชาสัมพันธ์
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
