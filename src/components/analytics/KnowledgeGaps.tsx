'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function KnowledgeGaps({ gaps }: { gaps: any[] }) {
  return (
    <Card className="col-span-4 mt-6">
      <CardHeader>
        <CardTitle>การวิเคราะห์ช่องว่างทางความรู้</CardTitle>
        <CardDescription>
          คำถามล่าสุดที่ AI มีความมั่นใจต่ำ (คะแนน &lt; 0.7) โปรดพิจารณาเขียนบทความเพื่อตอบคำถามเหล่านี้
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>คำถามของผู้ใช้</TableHead>
                <TableHead>ความมั่นใจของ AI</TableHead>
                <TableHead>วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gaps.map((gap) => (
                <TableRow key={gap.id}>
                  <TableCell className="font-medium max-w-[300px] truncate" title={gap.question}>
                    {gap.question}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {Math.round(gap.confidence_score * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(gap.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {gaps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    ไม่พบช่องว่างทางความรู้ที่สำคัญในช่วงนี้ เยี่ยมมาก!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
