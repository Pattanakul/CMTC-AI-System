import { StatsCard } from '@/components/dashboard/StatsCard';
import { BookOpen, BookCheck, BookX, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { knowledgeService } from '@/features/knowledge/services/knowledge.service';
import { userService } from '@/features/users/services/user.service';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch data
  const articles = await knowledgeService.getArticles({}, supabase);
  const users = await userService.getUsers(supabase);

  // Calculate stats
  const totalKnowledge = articles.length;
  const publishedKnowledge = articles.filter((a) => a.is_publish).length;
  const unpublishedKnowledge = totalKnowledge - publishedKnowledge;
  const totalUsers = users?.length || 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="text-muted-foreground mt-2">ภาพรวมการจัดการระบบ CMTC AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Knowledge ทั้งหมด"
          value={totalKnowledge}
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
        />
        <StatsCard
          title="Knowledge ที่เผยแพร่"
          value={publishedKnowledge}
          icon={<BookCheck className="h-5 w-5 text-green-500" />}
        />
        <StatsCard
          title="Knowledge ที่ยังไม่เผยแพร่"
          value={unpublishedKnowledge}
          icon={<BookX className="h-5 w-5 text-red-500" />}
        />
        <StatsCard
          title="จำนวนผู้ใช้งาน"
          value={totalUsers}
          icon={<Users className="h-5 w-5 text-purple-500" />}
        />
      </div>
    </div>
  );
}
