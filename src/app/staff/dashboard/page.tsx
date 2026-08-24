import { createClient } from "@/utils/supabase/server";
import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import { documentService } from "@/features/documents/services/document.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BookCheck, FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StaffDashboardPage() {
  const supabase = await createClient();

  // Authorize check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, department_id, departments(name)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }
  
  // Fetch data, filtering by departmentId
  const articles = await knowledgeService.getArticles({ departmentId: profile.department_id }, supabase);
  
  let documents = [];
  try {
    documents = await documentService.getDocuments({ departmentId: profile.department_id });
  } catch(e) {}

  // Calculate stats
  const totalKnowledge = articles.length;
  const publishedKnowledge = articles.filter(a => a.is_publish).length;
  const totalDocuments = documents.length;

  const deptName = (profile.departments as any)?.name || "ไม่ระบุแผนก";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ดบุคลากร</h1>
        <p className="text-muted-foreground mt-2">
          ยินดีต้อนรับ บุคลากร แผนก {deptName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Knowledge ทั้งหมด" value={totalKnowledge} icon={<BookOpen className="h-5 w-5 text-blue-500" />} />
        <StatCard title="Knowledge ที่เผยแพร่แล้ว" value={publishedKnowledge} icon={<BookCheck className="h-5 w-5 text-green-500" />} />
        <StatCard title="เอกสารทั้งหมด" value={totalDocuments} icon={<FileText className="h-5 w-5 text-orange-500" />} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
