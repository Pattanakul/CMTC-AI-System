import { createClient } from "@/utils/supabase/server";
import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import { userService } from "@/features/users/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BookCheck, BookX, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Authorize check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['SUPER_ADMIN', 'Super Admin'].includes(profile.role)) {
    redirect("/403"); // Forbidden page
  }
  
  // Fetch data
  const articles = await knowledgeService.getArticles({}, supabase);
  const users = await userService.getUsers(supabase);

  // Calculate stats
  const totalKnowledge = articles.length;
  const publishedKnowledge = articles.filter(a => a.is_publish).length;
  const unpublishedKnowledge = totalKnowledge - publishedKnowledge;
  const totalUsers = users?.length || 0;

  const publishRate = totalKnowledge > 0 ? Math.round((publishedKnowledge / totalKnowledge) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border/80 bg-card/80 p-6 shadow-[0_18px_70px_-55px_color-mix(in_oklch,var(--foreground),transparent_10%)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin command center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em]">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">ภาพรวมการจัดการความรู้ ผู้ใช้งาน และสถานะการเผยแพร่ของระบบ CMTC AI</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
            <div className="text-sm text-muted-foreground">อัตราการเผยแพร่</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{publishRate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Knowledge ทั้งหมด" value={totalKnowledge} tone="primary" icon={<BookOpen className="h-5 w-5" />} />
        <StatCard title="Knowledge ที่เผยแพร่" value={publishedKnowledge} tone="success" icon={<BookCheck className="h-5 w-5" />} />
        <StatCard title="Knowledge ที่ยังไม่เผยแพร่" value={unpublishedKnowledge} tone="warning" icon={<BookX className="h-5 w-5" />} />
        <StatCard title="จำนวนผู้ใช้งาน" value={totalUsers} tone="neutral" icon={<Users className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, tone }: { title: string, value: number, icon: React.ReactNode, tone: "primary" | "success" | "warning" | "neutral" }) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    neutral: "bg-secondary text-secondary-foreground",
  }[tone];

  return (
    <Card className="relative">
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
