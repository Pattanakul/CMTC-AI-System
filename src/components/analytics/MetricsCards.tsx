'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare, Clock } from 'lucide-react'

export function MetricsCards({ data }: { data: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalArticles || 0}</div>
          <p className="text-xs text-muted-foreground">
            {data.publishedArticles || 0} published
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalQueries || 0}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime queries processed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg AI Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgResponseTime ? (data.avgResponseTime / 1000).toFixed(2) : 0}s
          </div>
          <p className="text-xs text-muted-foreground">
            Per query execution
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
