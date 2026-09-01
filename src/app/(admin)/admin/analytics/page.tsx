import { createClient } from '@/utils/supabase/server'
import { MetricsCards } from '@/components/analytics/MetricsCards'
import { UsageChart } from '@/components/analytics/UsageChart'
import { KnowledgeGaps } from '@/components/analytics/KnowledgeGaps'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 1. Fetch Article Metrics
  const { count: totalArticles } = await supabase
    .from('knowledge_articles')
    .select('*', { count: 'exact', head: true })

  const { count: publishedArticles } = await supabase
    .from('knowledge_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED')

  // 2. Fetch AI Analytics
  const { data: aiData } = await supabase
    .from('ai_analytics')
    .select('id, created_at, response_time_ms, confidence_score, question')
    .order('created_at', { ascending: false })

  const totalQueries = aiData?.length || 0
  const totalResponseTime = aiData?.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0) || 0
  const avgResponseTime = totalQueries > 0 ? totalResponseTime / totalQueries : 0

  const metricsData = {
    totalArticles,
    publishedArticles,
    totalQueries,
    avgResponseTime
  }

  // 3. Process Usage Chart Data (Last 7 Days)
  const chartData: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    chartData[d.toLocaleDateString()] = 0
  }

  aiData?.forEach(item => {
    const dateStr = new Date(item.created_at).toLocaleDateString()
    if (chartData[dateStr] !== undefined) {
      chartData[dateStr] += 1
    }
  })

  const formattedChartData = Object.keys(chartData).map(date => ({
    date,
    count: chartData[date]
  }))

  // 4. Knowledge Gaps (Low confidence queries)
  const gaps = aiData?.filter(item => item.confidence_score < 0.7).slice(0, 10) || []

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        หน้าหลัก / สถิติการใช้งาน
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">สถิติการใช้งาน</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ตรวจสอบสถิติการใช้งานระบบฐานความรู้และประสิทธิภาพ AI Chat
          </p>
        </div>
        <Link href="/api/export/analytics">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ส่งออก CSV
          </Button>
        </Link>
      </div>

      <MetricsCards data={metricsData} />

      <div className="grid grid-cols-1 mt-6">
        <UsageChart data={formattedChartData} />
      </div>

      <div className="grid grid-cols-1 mt-6">
        <KnowledgeGaps gaps={gaps} />
      </div>
    </div>
  )
}
