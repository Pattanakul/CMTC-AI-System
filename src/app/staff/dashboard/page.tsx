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
  
  let documents: Awaited<ReturnType<typeof documentService.getDocuments>> = [];
  try {
    documents = await documentService.getDocuments({ departmentId: profile.department_id });
  } catch {}

  // Calculate stats
  const totalKnowledge = articles.length;
  const publishedKnowledge = articles.filter(a => a.is_publish).length;
  const totalDocuments = documents.length;

  const department = profile.departments as { name?: string } | { name?: string }[] | null;
  const deptName = (Array.isArray(department) ? department[0]?.name : department?.name) || "ไม่ระบุแผนก";

  const publishRate = totalKnowledge > 0 ? Math.round((publishedKnowledge / totalKnowledge) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border/80 bg-card/80 p-6 shadow-[0_18px_70px_-55px_color-mix(in_oklch,var(--foreground),transparent_10%)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{deptName}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em]">แดชบอร์ดบุคลากร</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              ตรวจดูความรู้และเอกสารของแผนก พร้อมสถานะเผยแพร่ที่พร้อมใช้งานกับระบบ AI
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
            <div className="text-sm text-muted-foreground">อัตราการเผยแพร่</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{publishRate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Knowledge ทั้งหมด" value={totalKnowledge} tone="primary" icon={<BookOpen className="h-5 w-5" />} />
        <StatCard title="Knowledge ที่เผยแพร่แล้ว" value={publishedKnowledge} tone="success" icon={<BookCheck className="h-5 w-5" />} />
        <StatCard title="เอกสารทั้งหมด" value={totalDocuments} tone="warning" icon={<FileText className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, tone }: { title: string, value: number, icon: React.ReactNode, tone: "primary" | "success" | "warning" }) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  }[tone];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex size-9 items-center justify-center rounded-lg ${toneClass}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value.toLocaleString("th-TH")}</div>
      </CardContent>
    </Card>
  );
}
