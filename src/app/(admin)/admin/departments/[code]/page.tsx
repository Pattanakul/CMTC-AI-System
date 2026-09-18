'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { departmentService } from '@/features/departments/services'
import { Department } from '@/features/departments/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/utils'
import { Building2, ArrowLeft, Users, BookOpen, Bell, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function DepartmentDetailPage() {
  const { code } = useParams()
  const router = useRouter()
  const [department, setDepartment] = useState<Department | null>(null)
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDept = async () => {
      try {
        const data = await departmentService.getDepartment(code as string)
        setDepartment(data)
        const count = await departmentService.getDepartmentUserCount(data.id)
        setUserCount(count)
      } catch {
        toast.error('ไม่พบข้อมูลแผนก')
        router.push('/admin/departments')
        } finally {
        setLoading(false)
        }
        }

        if (code) {
        fetchDept()
        }
        }, [code, router])

        if (loading) {
        return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        </div>
        )
        }

        if (!department) return null

        return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
        variant="ghost"
        className="mb-6 text-slate-500 hover:text-slate-900"
        onClick={() => router.push('/admin/departments')}
        >
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับไปหน้ารายการ
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="font-mono">
                {department.code}
              </Badge>
              <Badge 
                className={department.status ? 'bg-emerald-500' : 'bg-slate-300'}
              >
                {department.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">ข้อมูลการติดต่อ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="w-5 h-5 text-slate-400" />
            <span>{department.email || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Phone className="w-5 h-5 text-slate-400" />
            <span>{department.phone || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 md:col-span-2">
            <MapPin className="w-5 h-5 text-slate-400" />
            <span>{department.office || '-'}</span>
          </div>
          {department.description && (
            <div className="md:col-span-2 pt-4 border-t mt-2">
              <h4 className="font-semibold text-sm mb-2 text-slate-900">รายละเอียดเพิ่มเติม</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{department.description}</p>
            </div>
          )}
          <div className="md:col-span-2 text-xs text-slate-400 mt-4">
            สร้างเมื่อ: {formatDateTime(department.created_at)} | อัปเดตล่าสุด: {formatDateTime(department.updated_at)}
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold mb-4">สถิติภาพรวม</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">บุคลากรในแผนก</p>
              <h4 className="text-2xl font-bold text-slate-900">{userCount}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">บทความความรู้</p>
              <h4 className="text-2xl font-bold text-slate-900">0</h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">ประกาศ</p>
              <h4 className="text-2xl font-bold text-slate-900">0</h4>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
