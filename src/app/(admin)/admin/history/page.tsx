import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, Bot, Clock3, Download, FileQuestion, Search, ShieldAlert, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/utils/supabase/server'

type HistorySearchParams = Promise<{
  q?: string
  source?: string
  range?: string
}>

type AnalyticsRecord = {
  id: string
  question: string
  answer: string
  model_used: string | null
  response_time_ms: number | null
  source_type: 'KNOWLEDGE' | 'DOCUMENT' | 'AI' | null
  confidence_score: number | null
  created_at: string
}

const sourceLabels: Record<NonNullable<AnalyticsRecord['source_type']>, string> = {
  KNOWLEDGE: 'ฐานความรู้',
  DOCUMENT: 'เอกสาร',
  AI: 'AI',
}

const rangeLabels: Record<string, string> = {
  today: 'วันนี้',
  week: '7 วันล่าสุด',
  month: '30 วันล่าสุด',
  all: 'ทั้งหมด',
}

export default async function HistoryPage({ searchParams }: { searchParams: HistorySearchParams }) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const source = params.source ?? 'all'
  const range = params.range ?? 'week'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let query = supabase
    .from('ai_analytics')
    .select('id, created_at, question, answer, model_used, response_time_ms, source_type, confidence_score')
    .order('created_at', { ascending: false })
    .limit(500)

  const fromDate = getFromDate(range)
  if (fromDate) {
    query = query.gte('created_at', fromDate.toISOString())
  }

  if (source !== 'all') {
    query = query.eq('source_type', source)
  }

  const { data, error } = await query
  const rawRecords = ((data ?? []) as AnalyticsRecord[])
  const records = q
    ? rawRecords.filter((item) => {
        const needle = q.toLowerCase()
        return `${item.question} ${item.answer}`.toLowerCase().includes(needle)
      })
    : rawRecords

  const visibleRecords = records.slice(0, 50)
  const totalQuestions = records.length
  const avgResponseTime = average(records.map((item) => item.response_time_ms))
  const avgConfidence = average(records.map((item) => item.confidence_score))
  const lowConfidenceCount = records.filter((item) => (item.confidence_score ?? 1) < 0.7).length

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border/80 bg-card/80 p-6 shadow-[0_18px_70px_-55px_color-mix(in_oklch,var(--foreground),transparent_10%)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">AI usage ledger</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em]">ประวัติการใช้งาน</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              ตรวจสอบคำถาม คำตอบ แหล่งข้อมูล และประสิทธิภาพการตอบกลับของระบบ AI เพื่อใช้ติดตามคุณภาพความรู้ในระบบ
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/api/export/analytics">
              <Button variant="outline">
                <Download className="size-4" />
                ส่งออก CSV
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="รายการที่พบ"
          value={totalQuestions.toLocaleString('th-TH')}
          description={rangeLabels[range] ?? rangeLabels.week}
          icon={<Activity className="size-5" />}
          tone="primary"
        />
        <SummaryCard
          title="เวลาตอบกลับเฉลี่ย"
          value={formatDuration(avgResponseTime)}
          description="จากรายการที่มีข้อมูลเวลา"
          icon={<Clock3 className="size-5" />}
          tone="neutral"
        />
        <SummaryCard
          title="ความมั่นใจเฉลี่ย"
          value={formatPercent(avgConfidence)}
          description="ค่า confidence จาก AI"
          icon={<Sparkles className="size-5" />}
          tone="success"
        />
        <SummaryCard
          title="รายการที่ควรตรวจ"
          value={lowConfidenceCount.toLocaleString('th-TH')}
          description="confidence ต่ำกว่า 70%"
          icon={<ShieldAlert className="size-5" />}
          tone="warning"
        />
      </section>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>ตัวกรองประวัติ</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">ค้นจากคำถามหรือคำตอบ แล้วจำกัดช่วงเวลาและแหล่งข้อมูล</p>
            </div>
            <Link href="/admin/history" className="text-sm font-medium text-primary hover:underline">
              ล้างตัวกรอง
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 pt-1 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="ค้นหาคำถามหรือคำตอบ" className="pl-9" />
            </div>
            <select
              name="source"
              defaultValue={source}
              className="h-9 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">ทุกแหล่งข้อมูล</option>
              <option value="AI">AI</option>
              <option value="KNOWLEDGE">ฐานความรู้</option>
              <option value="DOCUMENT">เอกสาร</option>
            </select>
            <select
              name="range"
              defaultValue={range}
              className="h-9 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="today">วันนี้</option>
              <option value="week">7 วันล่าสุด</option>
              <option value="month">30 วันล่าสุด</option>
              <option value="all">ทั้งหมด</option>
            </select>
            <Button type="submit">
              <Search className="size-4" />
              ค้นหา
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>รายการล่าสุด</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                แสดง {visibleRecords.length.toLocaleString('th-TH')} จาก {totalQuestions.toLocaleString('th-TH')} รายการ
              </p>
            </div>
            {error ? (
              <Badge variant="destructive">โหลดข้อมูลไม่สำเร็จ</Badge>
            ) : (
              <Badge variant="outline">อัปเดตจาก ai_analytics</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[170px] pl-4">เวลา</TableHead>
                  <TableHead>คำถามและคำตอบ</TableHead>
                  <TableHead className="w-[130px]">แหล่งข้อมูล</TableHead>
                  <TableHead className="w-[130px] text-right">ความมั่นใจ</TableHead>
                  <TableHead className="w-[130px] pr-4 text-right">เวลาตอบกลับ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="pl-4 align-top text-muted-foreground">
                      <div className="font-medium text-foreground">{formatDate(record.created_at)}</div>
                      <div className="mt-1 text-xs">{formatTime(record.created_at)}</div>
                    </TableCell>
                    <TableCell className="max-w-[520px] align-top">
                      <div className="line-clamp-2 font-medium text-foreground">{record.question}</div>
                      <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{record.answer}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <SourceBadge source={record.source_type} />
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <span className={confidenceClass(record.confidence_score)}>{formatPercent(record.confidence_score)}</span>
                    </TableCell>
                    <TableCell className="pr-4 align-top text-right text-muted-foreground">
                      {formatDuration(record.response_time_ms)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileQuestion className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">ยังไม่มีประวัติที่ตรงกับตัวกรอง</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                ลองขยายช่วงเวลา ล้างคำค้นหา หรือเลือกแหล่งข้อมูลทั้งหมดเพื่อดูรายการเพิ่มเติม
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  tone: 'primary' | 'success' | 'warning' | 'neutral'
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    warning: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
    neutral: 'bg-secondary text-secondary-foreground',
  }[tone]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex size-9 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function SourceBadge({ source }: { source: AnalyticsRecord['source_type'] }) {
  if (!source) return <Badge variant="outline">ไม่ระบุ</Badge>

  const className = {
    AI: 'border-primary/20 bg-primary/10 text-primary',
    KNOWLEDGE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    DOCUMENT: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }[source]

  return (
    <Badge variant="outline" className={className}>
      <Bot className="size-3" />
      {sourceLabels[source]}
    </Badge>
  )
}

function getFromDate(range: string) {
  if (range === 'all') return null

  const date = new Date()
  if (range === 'today') {
    date.setHours(0, 0, 0, 0)
    return date
  }

  date.setDate(date.getDate() - (range === 'month' ? 30 : 7))
  return date
}

function average(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (numbers.length === 0) return null
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
}

function formatDuration(value: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'
  if (value < 1000) return `${Math.round(value)} ms`
  return `${(value / 1000).toFixed(1)} s`
}

function formatPercent(value: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'
  return `${Math.round(value * 100)}%`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function confidenceClass(value: number | null) {
  if (typeof value !== 'number') return 'text-muted-foreground'
  if (value < 0.7) return 'font-medium text-amber-700 dark:text-amber-300'
  return 'font-medium text-emerald-700 dark:text-emerald-300'
}
