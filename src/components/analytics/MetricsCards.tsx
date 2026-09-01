'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare, Clock } from 'lucide-react'

export function MetricsCards({ data }: { data: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">จำนวนบทความทั้งหมด</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalArticles || 0}</div>
          <p className="text-xs text-muted-foreground">
            {data.publishedArticles || 0} เผยแพร่แล้ว
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">จำนวนการถาม AI</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalQueries || 0}</div>
          <p className="text-xs text-muted-foreground">
            คำถามทั้งหมดที่ถูกประมวลผล
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">เวลาตอบกลับเฉลี่ยของ AI</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgResponseTime ? (data.avgResponseTime / 1000).toFixed(2) : 0} วินาที
          </div>
          <p className="text-xs text-muted-foreground">
            ต่อการประมวลผลคำถาม
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
